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
    ExecuteCodeAction
} from "@babylonjs/core";
import "@babylonjs/loaders";
import * as CANNON from "cannon";
import Ammo from 'ammojs-typed'

export class PhysicsForces {
    scene: Scene;
    engine: Engine;
    sphere!: AbstractMesh;
    box!: AbstractMesh;
    ground!: AbstractMesh;
    camera!: FreeCamera
    cannonball!: Mesh;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.CreateEnvironment();

        // this.CreateImpostors();

        // this.CreateRocket()

        this.CreatePhysics()

        this.scene.onPointerDown = (e) => {
            if (e.button === 2) {
                this.ShootCannoball()
            }
        }

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
        this.CreateCannonball()
    }

    CreateImpulse(): void {
        const box = MeshBuilder.CreateBox('box', { height: 4 })
        const boxMat = new PBRMaterial('boxMat', this.scene)
        boxMat.roughness = 1
        box.position.y = 3
        boxMat.albedoColor = new Color3(1, 0.5, 0)
        box.material = boxMat


        box.physicsImpostor = new PhysicsImpostor(
            box,
            PhysicsImpostor.BoxImpostor,
            { mass: 1, friction: 1 }
        )

        // box.actionManager = new ActionManager(this.scene)
        // box.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickDownTrigger, () => {
        //     box.physicsImpostor?.applyImpulse(
        //         new Vector3(-5, 3, 0),
        //         box.getAbsolutePosition().add(new Vector3(0, 2, 0))
        //     )
        // }))
    }

    CreateCannonball(): void {
        this.cannonball = MeshBuilder.CreateSphere('cannonball', { diameter: 0.5 })
        const ballMat = new PBRMaterial('ballMat', this.scene)
        ballMat.roughness = 0.7

        ballMat.albedoColor = new Color3(0, 1, 0)
        this.cannonball.material = ballMat

        this.cannonball.physicsImpostor = new PhysicsImpostor(
            this.cannonball,
            PhysicsImpostor.SphereImpostor,
            { mass: 1, friction: 1 }
        )

        this.cannonball.position = this.camera.position
        this.cannonball.setEnabled(false)

    }

    ShootCannoball() {
        const clone = this.cannonball.clone('clone')
        clone.position = this.camera.position

        clone.setEnabled(true)

        clone.physicsImpostor?.applyForce(
            this.camera.getForwardRay().direction.scale(1000),
            clone.getAbsolutePosition()
            )

            clone.physicsImpostor?.registerOnPhysicsCollide(
                this.ground.physicsImpostor, 
                () => {
                setTimeout(() => {
                    clone.dispose()
                }, 3000)
            })
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
            { mass: 0, restitution: 1 }
        );

        // this.sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 });
        // this.sphere.position = new Vector3(0, 8, 0);

        // this.sphere.physicsImpostor = new PhysicsImpostor(
        //     this.sphere,
        //     PhysicsImpostor.SphereImpostor,
        //     { mass: 1, restitution: 1, friction: 1 }
        // );
    }
}