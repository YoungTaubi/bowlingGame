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
    Mesh,
    ArcRotateCamera,
    MeshBuilder,
    ActionManager,
    IncrementValueAction,
    AxesViewer
} from "@babylonjs/core";
import "@babylonjs/loaders";
// import * as CANNON from "cannon";
import Ammo from 'ammojs-typed'

export class ThirdPersonControl_6 {
    scene: Scene;
    engine: Engine;
    camera!: ArcRotateCamera
    character!: AbstractMesh
    ground: AbstractMesh
    cube!: AbstractMesh;
    freeCamera: FreeCamera



    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.CreateEnvironment();
        // this.CreatePhysics()
        this.CreateCamera()


        this.CreateController()



        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine);
        new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);

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

        // scene.enablePhysics(
        //     new Vector3(0, -9.81, 0),
        //     new CannonJSPlugin(true, 10, CANNON)
        // );

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
            mesh.physicsImpostor = new PhysicsImpostor(
                mesh,
                PhysicsImpostor.BoxImpostor,
                {mass: 0, restitution: 1}
            )
        })

        this.ground = MeshBuilder.CreateGround("ground", {
            width: 40,
            height: 40,
        });

        this.ground.isVisible = false;

        this.ground.physicsImpostor = new PhysicsImpostor(
            this.ground,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 1 }
        );


    }

    async CreatePhysics(): Promise<void> {
        const ammo = await Ammo()
        const physics = new AmmoJSPlugin(true, ammo)
        this.scene.enablePhysics(new Vector3(0, -9.851, 0), physics)

        this.CreateCharacter()
        this.CreateObstacle()
        this.CeateBowlingball()
    }

    CreateCamera() {
        this.camera = new ArcRotateCamera('cam', 0, Math.PI / 2, 5, new Vector3(0, 0, 0), this.scene)
        this.camera.attachControl(true)
        this.camera.target = new Vector3(1, 1, 1)
        this.camera.collisionRadius = new Vector3(.1, .1, .1)

        this.camera.keysLeft.push(68)
        this.camera.keysRight.push(65)
    }

    CreateFreeCamera(): void {
        this.freeCamera = new FreeCamera('freeCam', new Vector3(1, 1, 1), this.scene)
        this.freeCamera.attachControl(true)
    }

    async CreateController(): Promise<void> {

        const ammo = await Ammo()
        const physics = new AmmoJSPlugin(true, ammo)
        this.scene.enablePhysics(new Vector3(0, -9.851, 0), physics)

        this.CreateCharacter()
        this.CreateObstacle()

        const input = {
            forward: false,
            backward: false,
            left: false,
            right: false
        }

        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    switch (kbInfo.event.key) {
                        case 'w':
                            input.forward = true;
                            break;
                        case 's':
                            input.backward = true;
                            break;
                        case 'a':
                            input.left = true;
                            break;
                        case 'd':
                            input.right = true;
                            break;
                    }
                    break;
                case KeyboardEventTypes.KEYUP:
                    switch (kbInfo.event.key) {
                        case 'w':
                            input.forward = false;
                            break;
                        case 's':
                            input.backward = false;
                            break;
                        case 'a':
                            input.left = false;
                            break;
                        case 'd':
                            input.right = false;
                            break;
                    }
                    break;
            }
        });

        let speed = 0;
        const maxSpeed = 1;
        const acceleration = 0.01
        const translation = new Vector3(0, 0, 0);
        const rotation = new Vector3(0, 0, 0);
        const charaterPhysics = () => {

            translation.set(0, 0, 0);
            rotation.set(0, 0, 0);
            if (input.forward && speed < maxSpeed || input.backward && speed < maxSpeed) {
                speed = speed + acceleration
            }

            if (input.forward) {
                translation.z = speed
            }
            if (input.backward) {
                translation.z = -speed
            }
            if (!input.forward && !input.backward) {
                speed = 0
            }
            if (input.left) {
                console.log('turn');
                this.cube.rotate(new Vector3(0, 1, 0), -0.1)
            }
            if (input.right) {
                console.log('turn');
                this.cube.rotate(new Vector3(0, 1, 0), 0.1)
            }
            this.cube.locallyTranslate(translation)



            // this.cube.rotate(new Vector3(0,1,0), 0.01) 
            // if (input.forward
            //     && this.camera.absoluteRotation._y > -.85 && this.camera.absoluteRotation._y < .85
            //     || input.backward
            //     && this.camera.absoluteRotation._y > -.85 && this.camera.absoluteRotation._y < .85
            // ) {
            //     this.cube.rotation = new Vector3(0, this.camera.absoluteRotation._y * 4, 0)
            // }
            this.camera.target._z = this.cube.position.z
            this.camera.target._x = this.cube.position.x
        }

        this.scene.registerBeforeRender(charaterPhysics)

    }

    async CreateObstacle(): Promise<void> {
        const obstacle = MeshBuilder.CreateSphere('sphere', { diameter: 1 }, this.scene);
        obstacle.position = new Vector3(1, 5, 1)

        obstacle.physicsImpostor = new PhysicsImpostor(
            obstacle,
            PhysicsImpostor.SphereImpostor,
            { mass: .5, restitution: .7, friction:.5}
        );
    }


    async CreateCharacter(): Promise<void> {
        this.cube = MeshBuilder.CreateBox('box', { size: 1 }, this.scene)
        this.cube.position = new Vector3(1, 1, 1)
        // this.cube.computeWorldMatrix(true)

        this.cube.physicsImpostor = new PhysicsImpostor(
            this.cube,
            PhysicsImpostor.BoxImpostor,
            { mass: 10, restitution: .7, friction:.5 }
        );

        const cubeAxis = new AxesViewer(this.scene, 1)
        cubeAxis.xAxis.parent = this.cube
        cubeAxis.yAxis.parent = this.cube
        cubeAxis.zAxis.parent = this.cube
    }

    async CeateBowlingball(): Promise <void> {
        const bowlingBall = MeshBuilder.CreateSphere('bowlinball', {diameter: 1}, this.scene)
        bowlingBall.position = this.cube.position 

    }
    


}