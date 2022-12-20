import {
    Scene,
    Engine,
    SceneLoader,
    ArcRotateCamera,
    Vector3,
    MeshBuilder,
    PhysicsImpostor,
    CubeTexture,
    Mesh,
    AmmoJSPlugin,
    PBRMaterial,
    Color3,
    ActionManager,
    ExecuteCodeAction,
    KeyboardEventTypes,
    AxesViewer,
    AbstractMesh,
    AnimationGroup
} from "@babylonjs/core";
import "@babylonjs/loaders";
import Ammo from "ammojs-typed";


export class BowlingGame {
    scene: Scene;
    engine: Engine;
    camera: ArcRotateCamera;
    bowlingball: Mesh;
    ground: Mesh;
    cube: Mesh;
    screenMode: boolean
    character: AbstractMesh
    characterMode: any
    characterAnimations: AnimationGroup[]
    bowlingPin: Mesh

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.screenMode = false
        this.characterMode = 'idle'
        this.scene = this.CreateScene();
        this.CreatePhysics();
        this.CreateEnvironment();
        this.CreateCamera()

        this.CreateController()





        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    CreateScene(): Scene {
        // console.log(this.screenMode);
        const scene = new Scene(this.engine);

        const envTex = CubeTexture.CreateFromPrefilteredData(
            "./environment/brown_photostudio_02_2k.env",
            scene
        );

        envTex.gammaSpace = false;

        envTex.rotationY = Math.PI / 2;

        scene.environmentTexture = envTex;

        scene.createDefaultSkybox(envTex, true, 1000, 0.25);

        scene.onPointerDown = (evt) => {
            // console.log(evt);
            if (evt.button === 0) {
                // console.log('click');
                this.engine.enterPointerlock()
                this.screenMode = true
            }
            if (evt.button === 1) this.engine.exitPointerlock()
            if (this.screenMode) {
                this.CreateBowlingball();
                if (evt.button === 2) {
                    this.characterAnimations[7].play()
                    setTimeout(() => this.ThrowBowlingball(), 1600)
                        ;
                }
            }
        }

        //   const camera = new FreeCamera("camera", new Vector3(0, 2, -10), this.scene);
        //   camera.attachControl();
        //   camera.minZ = 0.5;

        //   this.camera = camera;

        return scene;
    }

    async CreatePhysics(): Promise<void> {
        const ammo = await Ammo();
        const physics = new AmmoJSPlugin(true, ammo);
        this.scene.enablePhysics(new Vector3(0, -9.81, 0), physics);

        this.CreateImpostors();
        this.CreateBowlingPin()
        // this.CreateImpulse();
        // this.CreateBowlingball();
    }

    async CreateEnvironment(): Promise<void> {
        const { meshes } = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "Prototype_Level.glb",
            this.scene
        );

        meshes[8].isVisible = false



        // this.PositionBowlinPin(3, 3)
    }

    CreateImpostors(): void {
        const ground = MeshBuilder.CreateGround("ground", {
            width: 40,
            height: 40,
        });

        ground.isVisible = false;

        ground.physicsImpostor = new PhysicsImpostor(
            ground,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 1 }
        );

        this.ground = ground;
    }

    CreateCamera() {
        this.camera = new ArcRotateCamera('cam', 0, Math.PI / 2, 5, new Vector3(0, 0, 0), this.scene)
        this.camera.attachControl(true)
        this.camera.target = new Vector3(1, 1, 1)
        this.camera.collisionRadius = new Vector3(.1, .1, .1)

        this.camera.keysLeft.push(68)
        this.camera.keysRight.push(65)
    }

    async CreateController(): Promise<void> {

        const ammo = await Ammo()
        const physics = new AmmoJSPlugin(true, ammo)
        this.scene.enablePhysics(new Vector3(0, -9.851, 0), physics)

        this.CreateCharacter()

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
                            this.characterAnimations[6].play(true)
                            break;
                        case 's':
                            input.backward = true;
                            this.characterAnimations[8].play(true)
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
                            this.characterAnimations[6].stop()
                            break;
                        case 's':
                            input.backward = false;
                            this.characterAnimations[8].stop()
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
                translation.z = -speed / 3
            }
            if (!input.forward && !input.backward) {
                speed = 0
            }
            if (input.left) {
                this.cube.rotate(new Vector3(0, 1, 0), -0.1)
                // console.log('turn', this.cube.rotationQuaternion.y);
            }
            if (input.right) {
                this.cube.rotate(new Vector3(0, 1, 0), 0.1)
                // console.log('turn', this.cube.rotationQuaternion.y);
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
            { mass: .5, restitution: .7, friction: .5 }
        );
    }


    async CreateCharacter(): Promise<void> {

        this.cube = MeshBuilder.CreateBox('box', { width: .7, height: 2 }, this.scene)
        this.cube.position = new Vector3(1, 1, 1)
        // this.cube.computeWorldMatrix(true)

        this.cube.visibility = 0

        this.cube.physicsImpostor = new PhysicsImpostor(
            this.cube,
            PhysicsImpostor.BoxImpostor,
            { mass: 20, restitution: .7, friction: .5 }
        );

        // const cubeAxis = new AxesViewer(this.scene, 1)
        // cubeAxis.xAxis.parent = this.cube
        // cubeAxis.yAxis.parent = this.cube
        // cubeAxis.zAxis.parent = this.cube

        const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "soilderCharacter.glb",
            this.scene
        )

        // console.log(animationGroups);

        this.characterAnimations = animationGroups
        const walkForward = animationGroups[6]
        const walkBackward = animationGroups[9]
        const idle = animationGroups[1]
        const throwBall = animationGroups[7]
        const throwFrisbe = animationGroups[0]

        throwFrisbe.stop()
        idle.play(true)

        if (this.characterMode === 'walkForward') {

            this.characterAnimations[6].play(true)
        }


        meshes[0].position = new Vector3(this.cube.position.x, 0, this.cube.position.z)

        meshes[0].setParent(this.cube)
        this.character = meshes[0]
        // console.log(this.character);
    }

    CreateBowlingball(): void {

        this.bowlingball = MeshBuilder.CreateSphere("bowlingball", { diameter: 0.5 });

        const ballMat = new PBRMaterial("ballMat", this.scene);
        ballMat.roughness = 1;
        ballMat.albedoColor = new Color3(0, 1, 0);

        this.bowlingball.material = ballMat;

        this.bowlingball.physicsImpostor = new PhysicsImpostor(
            this.bowlingball,
            PhysicsImpostor.SphereImpostor,
            { mass: 1.5, friction: 1 }
        );

        this.bowlingball.position = this.cube.position;
        this.bowlingball.setEnabled(false);
    }

    ThrowBowlingball(): void {
        const clone = this.bowlingball.clone("clone");
        if (this.cube.rotationQuaternion.y > -0.85 && this.cube.rotationQuaternion.y < 0.6) {
            // console.log('case +');
            clone.position = new Vector3(this.cube.position.x + 0.7, 1, this.cube.position.z + 0.75)

        } else {
            // console.log('case -');
            clone.position = new Vector3(this.cube.position.x - 0.7, 1, this.cube.position.z - 0.75)
        }

        clone.setEnabled(true);

        clone.physicsImpostor.applyForce(
            this.camera.getForwardRay().direction.scale(750),
            clone.getAbsolutePosition()
        );

        clone.physicsImpostor.registerOnPhysicsCollide(
            this.ground.physicsImpostor,
            () => {
                setTimeout(() => {
                    clone.dispose();
                }, 3000);
            }
        );
    }

    CreateBowlingPin(): void {
        this.bowlingPin = MeshBuilder.CreateBox(
            'BowlinPin',
            { height: .8, width: .2, depth: .2 },
            this.scene)

        this.bowlingPin.position = new Vector3(3, 0, 3)

        this.bowlingPin.physicsImpostor = new PhysicsImpostor(
            this.bowlingPin,
            PhysicsImpostor.CylinderImpostor,
            { mass: 1, friction: .5 }
        );
        this.bowlingPin.setEnabled(false);

        let xPos = 0
        let zPos = 0
        
        for (let i = 1; i < 6; i++) {
            zPos ++
            if (i > 1)
            xPos -= i /1.4

            console.log(i);
            for (let j = 1; j < i; j++) {
                xPos++
                this.PositionBowlinPin(xPos, zPos)   
            }
                     
        }


    }

    PositionBowlinPin(xPos: number, zPos: number): void {
        const clone = this.bowlingPin.clone("clone");

        clone.position.x = xPos;
        clone.position.y = 0.1;
        clone.position.z = zPos;

        clone.setEnabled(true);

    }
}
