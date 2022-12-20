import {
    Scene,
    Engine,
    SceneLoader,
    FreeCamera,
    HemisphericLight,
    Vector3,
    CannonJSPlugin,
    KeyboardEventTypes,
    PhysicsImpostor,
    AbstractMesh,
    CubeTexture,
    AmmoJSPlugin,
    Animation,
    Mesh
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as CANNON from "cannon";
import Ammo from 'ammojs-typed'


export class CharacterAnimations {
    scene: Scene;
    engine: Engine;
    camera!: FreeCamera
    character!: AbstractMesh



    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.CreateEnvironment();

        this.CreateController()
        

        this.CreatePhysics()

        this.CreateCharacter()


        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine);
        new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);
        // const camera = new FreeCamera(
        //     "camera",
        //     new Vector3(0, 1, -12),
        //     this.scene
        // );
        // camera.setTarget(Vector3.Zero());
        // camera.attachControl();
        // camera.minZ = 0.5;

        const envTex = CubeTexture.CreateFromPrefilteredData(
            './environment/thatch_chapel_1k.env',
            scene
        )

        envTex.gammaSpace = false

        scene.environmentTexture = envTex
        scene.createDefaultSkybox(envTex, true, 1000, 0.25)

        scene.onPointerDown = (evt) => {
            console.log(evt);
            if (evt.button === 0) this.engine.enterPointerlock()
            if (evt.button === 1) this.engine.exitPointerlock()
        }

        const framesPerSec = 60
        const gravity = -9.81
        scene.gravity = new Vector3(0, gravity / framesPerSec, 0)
        scene.collisionsEnabled = true

        scene.enablePhysics(
            new Vector3(0, -9.81, 0),
            new CannonJSPlugin(true, 10, CANNON)
        );

        return scene;
    }

    async CreateEnvironment(): Promise<void> {
        const { meshes } = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "Prototype_Level.glb",
            this.scene
        );


        console.log(meshes);

        meshes[8].isVisible = false

        meshes.forEach(mesh => {
            mesh.checkCollisions = true
        })
    }

    CreateController(): void {
        this.camera = new FreeCamera('camera', new Vector3(8, 1, 8), this.scene)


        this.camera.attachControl()

        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.type === 1 && kbInfo.event.code === 'Space') {
                console.log('Jump');
                if (this.camera.position.y <= 5) {
                    this.camera.cameraDirection.y += 0.8;
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

        this.camera.applyGravity = true
        this.camera.checkCollisions = true

        this.camera.ellipsoid = new Vector3(1, 1, 1)

        this.camera.minZ = 0.45
        this.camera.speed = 0.75
        this.camera.angularSensibility = 4000

        this.camera.keysUp.push(87)
        this.camera.keysLeft.push(65)
        this.camera.keysDown.push(83)
        this.camera.keysRight.push(68)


    }

    async CreatePhysics(): Promise<void> {
        const ammo = await Ammo()
        const physics = new AmmoJSPlugin(true, ammo)
        this.scene.enablePhysics(new Vector3(0, -9.851, 0), physics)

    }

    async CreateCharacter(): Promise<void> {
        const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "soilder_character.glb",
            this.scene
        )

        meshes[0].position = new Vector3(this.camera.position.x, 0, this.camera.position.x + 3)

        this.character = meshes[0]

        console.log('cam pos', this.camera.position);
    }

}