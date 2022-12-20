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
    IncrementValueAction
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as CANNON from "cannon";
import Ammo from 'ammojs-typed'
import { CharacterController } from "babylonjs-charactercontroller";

export class ThirdPersonControl_5 {
    scene: Scene;
    engine: Engine;
    camera!: ArcRotateCamera
    character!: AbstractMesh
    ground: AbstractMesh
    cube!: AbstractMesh;



    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.CreateEnvironment();

        this.CreateController()
        this.CreateThirdPersonControler()

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

        // scene.onPointerDown = (evt) => {
        //     console.log(evt);
        //     if (evt.button === 0) this.engine.enterPointerlock()
        //     if (evt.button === 1) this.engine.exitPointerlock()
        // }

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

    CreateController(): void {
        this.camera = new ArcRotateCamera('camera', 0, Math.PI / 2, 5, new Vector3(1, 1, 1), this.scene)


        this.camera.attachControl()

        this.scene.onKeyboardObservable.add((kbInfo) => {

            // if (kbInfo.event.code === 'KeyW') {
            //     this.cube.addRotation(0, 1, 0)
            // }
            // if (kbInfo.event.code === 'KeyS') {
            //     this.cube.position.z -= 1
            // }
            // if (kbInfo.event.code === 'KeyA') {
            //     this.cube.position.x -= 1
            // }
            // if (kbInfo.event.code === 'KeyD') {
            //     this.cube.position.x += 1
            // }
            if (kbInfo.type === 1 && kbInfo.event.code === 'Space') {
                console.log('Jump');
                if (this.camera.position.y <= 5) {
                    this.camera.cameraDirection.y += 0.5;
                    this.cube.position.y = this.camera.position.y + .5
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

        // this.camera.applyGravity = true
        this.camera.checkCollisions = true

        // this.camera.ellipsoid = new Vector3(1, 1, 1)
        // this.camera.ellipsoidOffset = new Vector3 (this.cube?.position.x, this.cube?.position.y, this.cube?.position.z+ 3)



        this.camera.minZ = 0.45
        this.camera.speed = 0.75
        this.camera.computeWorldMatrix()
        // this.camera.angularSensibility = 4000

        // this.camera.keysUp.push(87)
        this.camera.keysLeft.push(65)
        // this.camera.keysDown.push(83)
        this.camera.keysRight.push(68)


    }

    CreateThirdPersonControler(): void {
        // const alpha = 0;
        // const beta = Math.PI / 2.5;
        // const camera = new ArcRotateCamera('ArcRotateCamera', alpha, beta, 5, new Vector3(1, 1, 1), this.scene)
        // const thirdPersonControler = new CharacterController(this.character, camera, this.scene)
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




        const characterBoundingBox = MeshBuilder.CreateBox('characterBoundingBox', {
            width: 1,
            height: 1.7,
            depth: 1
        })

        characterBoundingBox.position = new Vector3(this.camera.position.x, 1, this.camera.position.z + 3)
        characterBoundingBox.visibility = 1


        characterBoundingBox.computeWorldMatrix(true)


        let characterZPos = characterBoundingBox.position.z

        this.scene.onKeyboardObservable.add((kbInfo) => {
            if (kbInfo.event.code === 'KeyW') {
                console.log('w');
                this.camera.cameraDirection.z += 0.5;
                // characterBoundingBox.position.z = this.camera.position.z + .5
            }
            if (kbInfo.event.code === 'KeyS') {
                this.cube.position.z -= 1
            }
            if (kbInfo.event.code === 'KeyA') {
                this.cube.position.x -= 1
            }
            if (kbInfo.event.code === 'KeyD') {
                this.cube.position.x += 1
            }
            if (kbInfo.type === 1 && kbInfo.event.code === 'Space') {
                // console.log('Jump');
                if (this.camera.position.y <= 5) {
                    this.camera.cameraDirection.y += 0.5;
                    this.cube.position.y = this.camera.position.y + .5
                }
            }
        })

        // this.cube = characterBoundingBox



        const charaterPhysics = () => {
            // this.scene.onKeyboardObservable.add((kbInfo) => {

            //     if (kbInfo.event.code === 'KeyW') {
            //         characterBoundingBox.position.z += 1
            //     }
            //     if (kbInfo.event.code === 'KeyS') {
            //         this.cube.position.z -= 1
            //     }
            //     if (kbInfo.event.code === 'KeyA') {
            //         this.cube.position.x -= 1
            //     }
            //     if (kbInfo.event.code === 'KeyD') {
            //         this.cube.position.x += 1
            //     }
            //     if (kbInfo.type === 1 && kbInfo.event.code === 'Space') {
            //         // console.log('Jump');
            //         if (this.camera.position.y <= 5) {
            //             this.camera.cameraDirection.y += 0.5;
            //             this.cube.position.y = this.camera.position.y +.5
            //         }
            //     }



            //     switch (kbInfo.type) {
            //         case KeyboardEventTypes.KEYDOWN:
            //             console.log("KEY DOWN: ", kbInfo.event.key);
            //             break;
            //         case KeyboardEventTypes.KEYUP:
            //             console.log("KEY UP: ", kbInfo.event.code);
            //             break;
            //     }
            // })
            // characterBoundingBox.position.z = this.camera.cameraDirection.z
            this.camera.cameraDirection.z ++
            characterBoundingBox.rotation = new Vector3(0, this.camera.absoluteRotation._y * 1.5, 0)
            console.log(this.camera.absoluteRotation._y);
             this.camera.target._z = characterBoundingBox.position.z
             this.camera.target._x = characterBoundingBox.position.x
            // if (this.camera.rotation._y > 1) {
            //                 this.camera.setTarget(new Vector3(characterBoundingBox.position.x,characterBoundingBox.position.y,characterBoundingBox.position.z))

            // }
            // console.log(this.camera.rotation._y);
        }




        this.scene.registerBeforeRender(charaterPhysics)




        // characterBoundingBox.physicsImpostor = new PhysicsImpostor(characterBoundingBox, PhysicsImpostor.BoxImpostor, { mass: 1 })

        // const characterPhysics = () => {
        //     characterBoundingBox.physicsImpostor!.setLinearVelocity(characterBoundingBox.up)

        // }

        // console.log('cam', this.camera);

        meshes[0].setParent(characterBoundingBox)
        this.character = meshes[0]

        // let gameOver = false

        // if (!gameOver) {
        // this.scene.registerBeforeRender(characterPhysics)
        // }

        // characterBoundingBox.actionManager = new ActionManager(this.scene)
        // this.cube.actionManager = new ActionManager(this.scene)
        // this.scene.actionManager = new ActionManager(this.scene);

        // characterBoundingBox.actionManager.registerAction(
        //     new IncrementValueAction(
        //         ActionManager.OnPickDownTrigger,
        //         characterBoundingBox,
        //         "rotation.y",
        //         .1
        //     )
        // );

        // this.cube.actionManager.registerAction(
        //     new IncrementValueAction(
        //         ActionManager.OnPickDownTrigger,
        //         this.cube,
        //         "position.z",
        //         1
        //     )
        // );

        characterBoundingBox.physicsImpostor = new PhysicsImpostor(characterBoundingBox, PhysicsImpostor.BoxImpostor, { mass: 1 })
        // this.cube.physicsImpostor = new PhysicsImpostor(this.cube, PhysicsImpostor.BoxImpostor, { mass: 1 })






        // this.scene.onPointerDown = () => {
        //     gameOver = true
        //     // this.scene.unregisterBeforeRender(characterPhysics)
        // }


        // characterBoundingBox.setParent(this.camera)
        // this.camera.parent = characterBoundingBox


        // this.character.applyGravity = true
        // this.character.checkCollisions = true

        console.log('cam pos', this.camera.position);
    }

    // CreateCharacter(): void {
    //     const meshes = SceneLoader.ImportMesh(
    //         "",
    //         "./models/",
    //         "soilder_character.glb",
    //         this.scene,
    //     )

    //     // meshes[0].position = new Vector3(this.camera.position.x , 0, this.camera.position.x+3)

    //     console.log(meshes);

    //     this.character = meshes

    //     // console.log('cam pos' ,this.camera.position);
    // }

}