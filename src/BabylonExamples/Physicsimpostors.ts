import { Scene, Engine, SceneLoader, HemisphericLight, Vector3, FreeCamera, KeyboardEventTypes, CannonJSPlugin, MeshBuilder, PhysicsImpostor, GroundMesh } from "@babylonjs/core";
import "@babylonjs/loaders";
import * as CANNON from 'cannon'

export class Physicsimpostors {
    scene: Scene;
    engine: Engine;


    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();

        this.CreateEnvironment()

        // this.CreateImposter()

        this.CreateController()

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine);
        new HemisphericLight('hemi', new Vector3(0, 1, 0), this.scene)

        scene.onPointerDown = (evt) => {
            console.log(evt);
            if (evt.button === 0) this.engine.enterPointerlock()
            if (evt.button === 1) this.engine.exitPointerlock()
        }

        const framesPerSec = 60
        const gravity = -9.81
        scene.gravity = new Vector3(0, gravity / framesPerSec, 0)
        scene.collisionsEnabled = true

        scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin(true, 10, CANNON))

        return scene;
    }

    async CreateEnvironment(): Promise<void> {
        const { meshes } = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "Prototype_Level.glb",
            this.scene
        );

        meshes.forEach(mesh => {
            mesh.checkCollisions = true
        })
    }

    CreateController(): void {
        const camera = new FreeCamera('camera', new Vector3(6, 2, 6), this.scene)
        camera.attachControl()

        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === 1 && kbInfo.event.code === 'Space') {
                console.log('Jump');
                if (camera.position.y <= 5) {
                    camera.cameraDirection.y += 0.8;
                    this.CreateImposter()
                }
            }

            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    console.log("KEY DOWN: ", kbInfo.event.key);
                    break;
                case KeyboardEventTypes.KEYUP:
                    console.log("KEY UP: ", kbInfo.event.code);
                    break;
            }
        })

        camera.applyGravity = true
        camera.checkCollisions = true

        camera.ellipsoid = new Vector3(1, 1, 1)

        camera.minZ = 0.45
        camera.speed = 0.75
        camera.angularSensibility = 4000

        camera.keysUp.push(87)
        camera.keysLeft.push(65)
        camera.keysDown.push(83)
        camera.keysRight.push(68)
    }

    CreateImposter(): void {
        const box = MeshBuilder.CreateBox('box', { size: 2 })
        box.position = new Vector3(1, 10, 1)

        box.physicsImpostor = new PhysicsImpostor(
            box, 
            PhysicsImpostor.BoxImpostor, 
            { mass: 1, friction: 0, restitution: 0.75 })

        const sphere = MeshBuilder.CreateSphere('sphere', {diameter: 3})
        sphere.position = new Vector3(0, 20, 0)

        sphere.physicsImpostor = new PhysicsImpostor(
            sphere,
            PhysicsImpostor.SphereImpostor,
            {mass: 1, restitution: 0.8}
        )


        const ground = MeshBuilder.CreateGround('ground', { width: 20, height: 20 })
        ground.position = new Vector3(0, 5, 0)
        ground.physicsImpostor = new PhysicsImpostor(
            ground,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.75 }
        )
    }
}