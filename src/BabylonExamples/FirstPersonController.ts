import { Scene, Engine, SceneLoader, HemisphericLight, Vector3, FreeCamera, KeyboardEventTypes } from "@babylonjs/core";
import "@babylonjs/loaders";

export class FirstPersonController {
    scene: Scene;
    engine: Engine;


    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();

        this.CreateEnvironment()

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
        const camera = new FreeCamera('camera', new Vector3(8, 2, 8), this.scene)
        camera.attachControl()

        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo .type === 1 && kbInfo.event.code === 'Space') {
                console.log('Jump');
                if ( camera.position.y <= 5) {
                     camera.cameraDirection.y += 0.8;
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
}