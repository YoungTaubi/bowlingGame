import {
    Scene,
    SceneLoader,
    FreeCamera,
    HemisphericLight,
    Vector3,
    CannonJSPlugin,
    PhysicsImpostor,
    AbstractMesh,
    CubeTexture,
    AmmoJSPlugin,
   MeshBuilder,
   Engine
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as CANNON from "cannon";
import Ammo from 'ammojs-typed'
import { CharacterController } from "babylonjs-charactercontroller";
import * as BABYLON from 'babylonjs';

export class ThirdPersonControl_2 {
    scene: BABYLON.Scene;
    engine: BABYLON.Engine;
    camera!: FreeCamera
    character!: void
    ground: AbstractMesh



    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.CreateEnvironment();

        // this.CreateController()
        this.CreateThirdPersonController()

        this.CreatePhysics()

        this.CreateCharacter()


        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    CreateScene(): Scene {
        const scene = new BABYLON.Scene(this.engine);
        this.scene = scene
        new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);
        // const camera = new FreeCamera(
        //     "camera",
        //     new Vector3(0, 1, -12),
        //     this.scene
        // );
        // camera.setTarget(Vector3.Zero());
        // camera.attachControl();
        // camera.minZ = 0.5

        const envTex = CubeTexture.CreateFromPrefilteredData(
            './environment/thatch_chapel_1k.env',
            this.scene
        )

        envTex.gammaSpace = false

        this.scene.environmentTexture = envTex
        this.scene.createDefaultSkybox(envTex, true, 1000, 0.25)

        // this.scene.onPointerDown = (evt) => {
        //     console.log(evt);
        //     if (evt.button === 0) this.engine.enterPointerlock()
        //     if (evt.button === 1) this.engine.exitPointerlock()
        // }

        const framesPerSec = 60
        const gravity = -9.81
        this.scene.gravity = new Vector3(0, gravity / framesPerSec, 0)
        this.scene.collisionsEnabled = true

        this.scene.enablePhysics(
            new Vector3(0, -9.81, 0),
            new CannonJSPlugin(true, 10, CANNON)
        );

        return this.scene;
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

    // CreateController(): void {
    //     this.camera = new FreeCamera('camera', new Vector3(8, 1, 8), this.scene)


    //     this.camera.attachControl()

    //     // this.scene.onKeyboardObservable.add((kbInfo) => {
    //     //     if (kbInfo.type === 1 && kbInfo.event.code === 'Space') {
    //     //         console.log('Jump');
    //     //         if (this.camera.position.y <= 5) {
    //     //             this.camera.cameraDirection.y += 0.8;
    //     //         }
    //     //     }

    //     //     switch (kbInfo.type) {
    //     //         case KeyboardEventTypes.KEYDOWN:
    //     //             console.log("KEY DOWN: ", kbInfo.event.key);
    //     //             break;
    //     //         case KeyboardEventTypes.KEYUP:
    //     //             console.log("KEY UP: ", kbInfo.event.code);
    //     //             break;
    //     //     }
    //     // })

    //     this.camera.applyGravity = true
    //     this.camera.checkCollisions = true

    //     this.camera.ellipsoid = new Vector3(1, 1, 1)

    //     this.camera.minZ = 0.45
    //     this.camera.speed = 0.75
    //     this.camera.angularSensibility = 4000

    //     this.camera.keysUp.push(87)
    //     this.camera.keysLeft.push(65)
    //     this.camera.keysDown.push(83)
    //     this.camera.keysRight.push(68)


    // }

    CreateThirdPersonController(): void {
        const alpha = 0;
        const beta = Math.PI / 2.5;
        const camera = new BABYLON.ArcRotateCamera('ArcRotateCamera', alpha, beta, 5, new BABYLON.Vector3(1, 1, 1), this.scene)
        const thirdPersonControler = new CharacterController(this.character, camera, this.scene,)
    }

    async CreatePhysics(): Promise<void> {
        const ammo = await Ammo()
        const physics = new AmmoJSPlugin(true, ammo)
        this.scene.enablePhysics(new Vector3(0, -9.851, 0), physics)

    }

    // async CreateCharacter(): Promise<void> {
    //     const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
    //         "",
    //         "./models/",
    //         "soilder_character.glb",
    //         this.scene
    //     )

    //     meshes[0].position = new Vector3(this.camera.position.x, 0, this.camera.position.x + 3)




    //     const characterBoundingBox = MeshBuilder.CreateBox('characterBoundingBox', {
    //         width: 1,
    //         height: 1.7,
    //         depth: 1
    //     })

    //     characterBoundingBox.position.y = 0.8
    //     characterBoundingBox.visibility = 0

    //     characterBoundingBox.physicsImpostor = new PhysicsImpostor(characterBoundingBox, PhysicsImpostor.BoxImpostor, { mass: 1 })


    //     // meshes[0].setParent(characterBoundingBox)
    //     this.character = meshes[0]
    //     // characterBoundingBox.setParent(this.camera)


    //     // this.character.applyGravity = true
    //     // this.character.checkCollisions = true

    //     console.log('cam pos', this.camera.position);
    // }

    

    CreateCharacter(): void {
        
        const cc: void = undefined

        BABYLON.SceneLoader.ImportMesh(
            "",
            "./models/",
            "soilder_character.glb",
            this.scene,
            (meshes, particleSystems, skeletons) => {
                const player = meshes[0];
                const skeleton = skeletons[0];
                player.skeleton = skeleton;

                skeleton.enableBlending(0.1);
                //if the skeleton does not have any animation ranges then set them as below
                // setAnimationRanges(skeleton);

                const sm = player.material;
                console.log('sm', sm);
                //     if (sm.diffuseTexture != null) {
                //       sm.backFaceCulling = true;
                //       sm.ambientColor = new BABYLON.Color3(1, 1, 1);
                //  }

                player.position = new BABYLON.Vector3(0, 12, 0);
                player.checkCollisions = true;
                player.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
                player.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

                //rotate the camera behind the player
                //player.rotation.y = Math.PI / 4;
                //const alpha = -(Math.PI / 2 + player.rotation.y);
                const alpha = 0;
                const beta = Math.PI / 2.5;
                const target = new BABYLON.Vector3(player.position.x, player.position.y + 1.5, player.position.z);

                const camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", alpha, beta, 5, target, this.scene);

                //standard camera setting
                camera.wheelPrecision = 15;
                camera.checkCollisions = true;
                //make sure the keyboard keys controlling camera are different from those controlling player
                //here we will not use any keyboard keys to control camera
                camera.keysLeft = [];
                camera.keysRight = [];
                camera.keysUp = [];
                camera.keysDown = [];
                //how close can the camera come to player
                camera.lowerRadiusLimit = 2;
                //how far can the camera go from the player
                camera.upperRadiusLimit = 200;

                camera.attachControl();

                cc = new CharacterController(player, camera, this.scene);
                cc.setFaceForward(false);
                cc.setMode(0);
                cc.setTurnSpeed(45);
                //below makes the controller point the camera at the player head which is approx
                //1.5m above the player origin
                cc.setCameraTarget(new BABYLON.Vector3(0, 1.5, 0));

                //if the camera comes close to the player we want to enter first person mode.
                cc.setNoFirstPerson(false);
                //the height of steps which the player can climb
                cc.setStepOffset(0.4);
                //the minimum and maximum slope the player can go up
                //between the two the player will start sliding down if it stops
                cc.setSlopeLimit(30, 60);

                //tell controller
                // - which animation range should be used for which player animation
                // - rate at which to play that animation range
                // - wether the animation range should be looped
                //use this if name, rate or looping is different from default
                cc.setIdleAnim("idle", 1, true);
                cc.setTurnLeftAnim("turnLeft", 0.5, true);
                cc.setTurnRightAnim("turnRight", 0.5, true);
                cc.setWalkBackAnim("walkBack", 0.5, true);
                cc.setIdleJumpAnim("idleJump", 0.5, false);
                cc.setRunJumpAnim("runJump", 0.6, false);
                cc.setFallAnim("fall", 2, false);
                cc.setSlideBackAnim("slideBack", 1, false);

               const walkSound = new BABYLON.Sound(
                    "walk",
                    "./sounds/footstep_carpet_000.ogg",
                    this.scene,
                    () => {
                        cc.setSound(walkSound);
                    },
                    { loop: false }
                );

                const ua = window.navigator.userAgent;
                const isIE = /MSIE|Trident/.test(ua);
                if (isIE) {
                    //IE specific code goes here
                    cc.setJumpKey("spacebar");
                }

                cc.setCameraElasticity(true);
                cc.makeObstructionInvisible(true);
                cc.start();

                // this.engine.runRenderLoop(function () {
                //     this.scene.render();
                // });

                cmds = [cc.walk, cc.walkBack, cc.run, cc.jump, cc.turnLeft, cc.turnRight, cc.strafeLeft, cc.strafeRight];
                showControls();
                canvas.focus();
            });
    }
         

    // meshes[0].position = new Vector3(this.camera.position.x , 0, this.camera.position.x+3)

    //  console.log(meshes);

    //  this.character = meshes

    // console.log('cam pos' ,this.camera.position);
}

