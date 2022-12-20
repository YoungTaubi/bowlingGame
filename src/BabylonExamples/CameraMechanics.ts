import { Scene, Engine, FreeCamera, Vector3, CubeTexture, SceneLoader, AbstractMesh, SpotLight, ShadowGenerator, LightGizmo, GizmoManager, Light, ArcRotateCamera, TargetCamera } from '@babylonjs/core'
import '@babylonjs/loaders'


export class CameraMechanics {

    scene: Scene;
    engine: Engine;
    models!: AbstractMesh[]
    camera!: ArcRotateCamera


    constructor(private canvas: HTMLCanvasElement) {

        this.engine = new Engine(this.canvas, true)

        this.scene = this.CreateScene()

        this.CreateCamera()


        this.CreateEnvironment()

        this.CreateLights()


        this.engine.runRenderLoop(() => {
            this.scene.render()
        })

    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine)

        const envTex = CubeTexture.CreateFromPrefilteredData(
            './environment/thatch_chapel_1k.env',
            scene
        )


        scene.environmentTexture = envTex

        // scene.createDefaultSkybox(envTex, true, 1000, 0.25)

        scene.environmentIntensity = 1

        return scene

    }

    CreateCamera() :void {
        this.camera = new ArcRotateCamera('camera', -Math.PI/2,Math.PI/2, 4, Vector3.Zero(), this.scene)

        this.camera.attachControl(this.canvas, true)
        this.camera.wheelPrecision = 100

        this.camera.minZ = .1
        this.camera.lowerRadiusLimit =2
        this.camera.upperRadiusLimit = 6
        this.camera.upperBetaLimit = Math.PI/1.7

        this.camera.panningSensibility = 0
        // this.camera.useBouncingBehavior = true

        this.camera.useAutoRotationBehavior = true;
        this.camera.autoRotationBehavior!.idleRotationSpeed = 0.1
        this.camera.autoRotationBehavior!.idleRotationSpinupTime = 4000
        this.camera.autoRotationBehavior!.idleRotationWaitTime = 100
        this.camera.autoRotationBehavior!.zoomStopsAnimation = true

        this.camera.useFramingBehavior = true

        this.camera.framingBehavior!.radiusScale = 10
        this.camera.framingBehavior!.framingTime = 4000

    }

    async CreateEnvironment(): Promise<void> {
    
        this.CreateLychee()
    }

    CreateLights(): void {

        const spotLight = new SpotLight('spotLihjt', 
        new Vector3(0,0.5,-3), 
        new Vector3(0,1,3), 
        Math.PI/2, 10, 
        this.scene)

        spotLight.intensity = 20
        spotLight.shadowEnabled = true
        spotLight.shadowMinZ = 1 // is needed for the shadow blur
        spotLight.shadowMaxZ = 10 // is needed for the shadow blur

        const shadowGen = new ShadowGenerator(2048, spotLight)
        shadowGen.useBlurCloseExponentialShadowMap = true

        this.CreateGizmos(spotLight)

    }

    CreateGizmos(customLight: Light): void {
        const lightGizmo = new LightGizmo()
        lightGizmo.scaleRatio = 2
        lightGizmo.light = customLight

        const gizmoManager = new GizmoManager(this.scene)
        gizmoManager.positionGizmoEnabled = true
        gizmoManager.rotationGizmoEnabled = true
        gizmoManager.usePointerToAttachGizmos = false
        gizmoManager.attachToMesh(lightGizmo.attachedMesh)
    }

    async CreateLychee() {
        const { meshes } = await SceneLoader.ImportMeshAsync('', './models/', 'food_lychee_01_2k.glb')

        // this.camera.setTarget(meshes[1])
        // console.log(meshes);

        // meshes[0].showBoundingBox = true
        // meshes[1].showBoundingBox = true

        meshes[0].scaling = new Vector3(40, 40, 40)
        meshes[0].position = new Vector3(0,-1,0)

        console.log('meshes', meshes);
    }

    

    
}