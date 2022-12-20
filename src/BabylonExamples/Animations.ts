import {
    Scene,
    Engine,
    SceneLoader,
    FreeCamera,
    HemisphericLight,
    Vector3,
    CannonJSPlugin,
    MeshBuilder,
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

export class Animations {
    scene: Scene;
    engine: Engine;
    target!: AbstractMesh;
    ground!: AbstractMesh;


    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.CreateEnvironment();


        this.CreateTarget()

        this.CreatePhysics()


        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine);
        new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);
        const camera = new FreeCamera(
            "camera",
            new Vector3(0, 1, -12),
            this.scene
        );
        camera.setTarget(Vector3.Zero());
        camera.attachControl();
        camera.minZ = 0.5;

        const envTex = CubeTexture.CreateFromPrefilteredData(
            './environment/thatch_chapel_1k.env',
            scene
        )

        envTex.gammaSpace = false

        scene.environmentTexture = envTex
        scene.createDefaultSkybox(envTex, true, 1000, 0.25)

        scene.enablePhysics(
            new Vector3(0, -9.81, 0),
            new CannonJSPlugin(true, 10, CANNON)
        );

        return scene;
    }

    async CreateEnvironment(): Promise<void> {
        const mesh = await SceneLoader.ImportMeshAsync(
            "",
            "./models/",
            "Prototype_Level.glb",
            this.scene
        );

        mesh.geometries[7].meshes[0].isVisible = false
    }


    async CreatePhysics(): Promise<void> {
        const ammo = await Ammo()
        const physics = new AmmoJSPlugin(true, ammo)
        this.scene.enablePhysics(new Vector3(0, -9.851, 0), physics)

        this.CreateImpostors()
    }

    CreateImpostors(): void {
        // this.box = MeshBuilder.CreateBox("box", { size: 2 });
        // this.box.position = new Vector3(0, 3, 0);

        // this.box.physicsImpostor = new PhysicsImpostor(
        //     this.box,
        //     PhysicsImpostor.BoxImpostor,
        //     { mass: 1, restitution: .75, friction: 1 }
        // );

        this.ground = MeshBuilder.CreateGround("ground", {
            width: 40,
            height: 40,
        });

        this.ground.isVisible = false;

        this.ground.physicsImpostor = new PhysicsImpostor(
            this.ground,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, friction: 20 }
        );

        // const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 4 })
        // const sphereMat = new PBRMaterial('sphereMat', this.scene)
        // sphereMat.roughness = 1
        // sphere.position.y = 3
        // sphereMat.albedoColor = new Color3(1, 0.5, 0)
        // sphere.material = sphereMat

        // sphere.physicsImpostor = new PhysicsImpostor(
        //     sphere,
        //     PhysicsImpostor.SphereImpostor,
        //     { mass: 10, friction: 1 }
        // )



        // this.sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 });
        // this.sphere.position = new Vector3(0, 8, 0);

        // this.sphere.physicsImpostor = new PhysicsImpostor(
        //     this.sphere,
        //     PhysicsImpostor.SphereImpostor,
        //     { mass: 1, restitution: 1, friction: 1 }
        // );
    }

    async CreateTarget(): Promise<void> {
        const { meshes } = await SceneLoader.ImportMeshAsync(
            '',
            './models/',
            'target.glb',
            this.scene
        )

        meshes.shift()

        this.target = Mesh.MergeMeshes(meshes as Mesh[], true, true, undefined, false, true)

        this.target.position.y = 3

        this.CreateAnimation()
    }

    CreateAnimation(): void {
        const rotateFrames = []
        const slideFrames = []
        const fadeFrames = []
        const fps = 60

        const rotateAnim = new Animation(
            'rotateAnim',
            'rotation.z',
            fps,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )

        const slideAnim = new Animation(
            'slide',
            'position',
            fps,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )

        const fadeAnim = new Animation(
            'fadeAnim',
            'visibility',
            fps,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        )

        rotateFrames.push({ frame: 0, value: 0 })
        rotateFrames.push({ frame: 180, value: Math.PI / 2 })

        slideFrames.push({ frame: 0, value: new Vector3(0, 3, 0) })
        slideFrames.push({ frame: 45, value: new Vector3(-3, 2, 0) })
        slideFrames.push({ frame: 90, value: new Vector3(0, 3, 0) })
        slideFrames.push({ frame: 135, value: new Vector3(3, 2, 0) })
        slideFrames.push({ frame: 180, value: new Vector3(0, 3, 0) })

        fadeFrames.push({ frame: 0, value: 1 })
        fadeFrames.push({ frame: 180, value: 0 })

        rotateAnim.setKeys(rotateFrames)
        slideAnim.setKeys(slideFrames)
        fadeAnim.setKeys(fadeFrames)

        this.target.animations.push(rotateAnim)
        this.target.animations.push(slideAnim)
        this.target.animations.push(fadeAnim)

        // this.scene.beginAnimation(this.target, 0, 180, true)

        const onAnimationEnd = () => {
            console.log('end');
            this.target.setEnabled(false)
        }

        const animControl = this.scene.beginDirectAnimation(
            this.target,
            [slideAnim, rotateAnim],
            0,
            180,
            true,
            1,
            onAnimationEnd
        )

        this.scene.onPointerDown = async evt => {
            if (evt.button === 1) {
                console.log(evt.button);
                await this.scene.beginDirectAnimation(
                    this.target,
                    [fadeAnim],
                    0,
                    180
                ).waitAsync()

                animControl.stop()


            }
        }
    }



}