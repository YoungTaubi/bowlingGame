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
    Mesh,
    PBRBaseMaterial,
    PBRMaterial,
    Color3,
    ActionManager,
    Texture,
    Matrix
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as CANNON from "cannon";
import Ammo from 'ammojs-typed'

export class Raycasting {
    scene: Scene;
    engine: Engine;
    sphere!: AbstractMesh;
    box!: AbstractMesh;
    ground!: AbstractMesh;
    camera!: FreeCamera
    splatters!: PBRMaterial[]

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.CreateEnvironment();
        this.CreateTextures()
        this.CreatePickingRay()

        // this.CreateRocket()

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

        this.camera = camera

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

    async CreateRocket(): Promise<void> {
        const { meshes } = await SceneLoader.ImportMeshAsync(
            '',
            '/models/',
            'toon_rocket.glb',
            this.scene
        )

        const rocketCol = MeshBuilder.CreateBox('rocketCol', {
            width: 1,
            height: 1.7,
            depth: 1
        })

        rocketCol.position.y = 0.8
        rocketCol.visibility = 0

        rocketCol.physicsImpostor = new PhysicsImpostor(
            rocketCol,
            PhysicsImpostor.BoxImpostor,
            { mass: 1 }
        )

        meshes[0].setParent(rocketCol)

        rocketCol.rotate(Vector3.Forward(), .75)

        const rocketPhysics = () => {
            this.camera.position.y = rocketCol.position.y
            this.camera.position.x = rocketCol.position.x
            // rocketCol.physicsImpostor!.setLinearVelocity(new Vector3(0, 1, 0))
            // rocketCol.physicsImpostor!.setAngularVelocity(new Vector3(0, 1, 0))


            rocketCol.physicsImpostor!.setLinearVelocity(rocketCol.up.scale(5))
            rocketCol.physicsImpostor!.setAngularVelocity(rocketCol.up.scale(5))

        }

        // let gameOver = false

        // if (!gameOver) {
        this.scene.registerBeforeRender(rocketPhysics)
        // }



        // this.scene.onPointerDown = () => {
        //     gameOver = true
        //     this.scene.unregisterBeforeRender(rocketPhysics)
        // }

    }

    async CreatePhysics(): Promise<void> {
        const ammo = await Ammo()
        const physics = new AmmoJSPlugin(true, ammo)
        this.scene.enablePhysics(new Vector3(0, -9.851, 0), physics)

        this.CreateImpostors()
        this.CreateImpulse()
    }

    CreateImpulse(): void {
        

        // box.actionManager = new ActionManager(this.scene)
        // box.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
        //     box.physicsImpostor?.applyImpulse(
        //         new Vector3(-5, 3, 0),
        //         box.getAbsolutePosition().add(new Vector3(0, 2, 0))
        //     )
        // }))
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
            { mass: 0, friction: 20}
        );

        const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 4 })
        const sphereMat = new PBRMaterial('sphereMat', this.scene)
        sphereMat.roughness = 1
        sphere.position.y = 3
        sphereMat.albedoColor = new Color3(1, 0.5, 0)
        sphere.material = sphereMat

        sphere.physicsImpostor = new PhysicsImpostor(
            sphere,
            PhysicsImpostor.SphereImpostor,
            { mass: 10, friction: 1 }
        )
        


        // this.sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 });
        // this.sphere.position = new Vector3(0, 8, 0);

        // this.sphere.physicsImpostor = new PhysicsImpostor(
        //     this.sphere,
        //     PhysicsImpostor.SphereImpostor,
        //     { mass: 1, restitution: 1, friction: 1 }
        // );
    }

    CreateTextures(): void {
        const blue = new PBRMaterial('blue', this.scene)
        const green = new PBRMaterial('green', this.scene)
        const orange = new PBRMaterial('orange', this.scene)

        blue.roughness = 1
        green.roughness = 1
        orange.roughness = 1

        blue.albedoTexture = new Texture('./textures/blue.png', this.scene)
        green.albedoTexture = new Texture('./textures/green.png', this.scene)
        orange.albedoTexture = new Texture('./textures/orange.png', this.scene)

        blue.albedoTexture.hasAlpha = true
        green.albedoTexture.hasAlpha = true
        orange.albedoTexture.hasAlpha = true

        blue.zOffset = -0.25
        green.zOffset = -0.25
        orange.zOffset = -0.25

        this.splatters = [blue, green, orange]
    }

    CreatePickingRay(): void {

        this.scene.onPointerDown = () => {
            const ray = this.scene.createPickingRay(
                this.scene.pointerX,
                this.scene.pointerY,
                Matrix.Identity(),
                this.camera
            )

            const raycastHit = this.scene.pickWithRay(ray)

            if (raycastHit?.hit) {
                const decal = MeshBuilder.CreateDecal(
                    'decal',
                    raycastHit.pickedMesh,
                    {
                        position: raycastHit.pickedPoint,
                        normal: raycastHit.getNormal(true),
                        size: new Vector3(1, 1, 1)
                    }
                )

                decal.material = this.splatters[Math.floor(Math.random() * this.splatters.length)]

                decal.setParent(raycastHit.pickedMesh)

                raycastHit.pickedMesh?.physicsImpostor?.applyImpulse(ray.direction.scale(5), raycastHit.pickedPoint)
            }
        }
    }


}