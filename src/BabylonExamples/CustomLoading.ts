import { Scene, Engine, FreeCamera, Vector3, HemisphericLight, MeshBuilder, CubeTexture, StandardMaterial, Texture, PBRMaterial, Color3, GlowLayer, SceneLoader, AbstractMesh, Light, LightGizmo, GizmoManager, DirectionalLight, PointLight, SpotLight, ShadowGenerator } from '@babylonjs/core'
import { noisePixelShader } from '@babylonjs/core/Shaders/noise.fragment';
import '@babylonjs/loaders'
import { CustomLoadingScreen } from './CustomLoadingScreen';

export class CustomLoading {

    scene: Scene;
    engine: Engine;
    // loadingScreen: CustomLoadingScreen;

    lightTubes!: AbstractMesh[];
    models!: AbstractMesh[]
    ball!: AbstractMesh


    constructor(private canvas: HTMLCanvasElement,
        private setLoaded: () => void,
        private loadingBar?: HTMLElement,
        private percentLoaded?: HTMLElement,
        private loader?: HTMLElement
    ) {
        this.engine = new Engine(this.canvas, true)

        // this.loadingScreen = new CustomLoadingScreen(this.loadingBar, this.percentLoaded, this.loader)

        // this.engine.loadingScreen = this.loadingScreen

        // this.engine.displayLoadingUI()

        this.scene = this.CreateScene()

        this.CreateEnvironment()

        this.engine.runRenderLoop(() => {
            this.scene.render()
        })
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine)
        const camera = new FreeCamera('camera', new Vector3(0, 1, -5), this.scene)
        camera.attachControl()
        camera.speed = 0.25

        const envTex = CubeTexture.CreateFromPrefilteredData(
            './environment/brown_photostudio_02_2k.env',
            scene
        )

        scene.environmentTexture = envTex

        scene.createDefaultSkybox(envTex, true)

        scene.environmentIntensity = 0

        return scene

    }

    async CreateEnvironment(): Promise<void> {
        const { meshes } = await SceneLoader.ImportMeshAsync(
            '',
            './models/',
            'LightingScene.glb',
            this.scene,
            (evt) => {
                let loadStatus: any = 0
                if (evt.lengthComputable) {
                    loadStatus = ((evt.loaded * 100 / evt.total).toFixed());
                } else {
                    const dlCount = evt.loaded / (1024 * 1024);
                    loadStatus = ((dlCount * 100.0) / 100.0).toFixed();
                }
                // console.log('loaded', evt.loaded*100, 'total', evt);
                // const loadStatus = ((evt.loaded * 100)/ evt.total).toFixed()
                // this.loadingScreen.updateLoadStatus(loadStatus)
            }

        )

        this.models = meshes

        this.lightTubes = meshes.filter((mesh) =>
            mesh.name === 'lightTube_left' || mesh.name === 'lightTube_right'
        )

        this.ball = MeshBuilder.CreateSphere('Ball', { diameter: .5 }, this.scene)

        this.ball.material = this.CreateBallMaterial()

        this.ball.position = new Vector3(0, 1, -1)

        const glowLayer = new GlowLayer('glowLayer', this.scene)
        glowLayer.intensity = 0.75

        this.CreateBarrel()
        this.CreateLights()
        // this.engine.hideLoadingUI()
        this.setLoaded()
    }


    CreateLights(): void {
        // const hemiLight = new HemisphericLight('hemiLight', new Vector3(0,1,0), this.scene)
        // hemiLight.intensity = 0.75
        // hemiLight.diffuse = new Color3(1,0,0)
        // hemiLight.groundColor = new Color3(0,0,1)
        // hemiLight.specular = new Color3(0,1,0)

        // const directionLight = new DirectionalLight(
        //     'directionalLight',
        //     new Vector3(0,-1,0),
        //     this.scene
        // )

        const pointLight = new PointLight(
            "pointLight",
            new Vector3(0, 1, 0),
            this.scene
        );

        pointLight.diffuse = new Color3(172 / 255, 246 / 255, 250 / 255);
        pointLight.intensity = 0;

        const pointClone = pointLight.clone("pointClone") as PointLight;

        pointLight.parent = this.lightTubes[0];
        pointClone.parent = this.lightTubes[1];

        const spotLight = new SpotLight('spotLihjt',
            new Vector3(0, 0.5, -3),
            new Vector3(0, 1, 3),
            Math.PI / 2, 10,
            this.scene)

        spotLight.intensity = 10
        spotLight.shadowEnabled = true
        spotLight.shadowMinZ = 1 // is needed for the shadow blur
        spotLight.shadowMaxZ = 10 // is needed for the shadow blur

        const shadowGen = new ShadowGenerator(2048, spotLight)
        shadowGen.useBlurCloseExponentialShadowMap = true

        this.ball.receiveShadows = true
        shadowGen.addShadowCaster(this.ball)

        this.models.forEach(mesh => {
            mesh.receiveShadows = true
            shadowGen.addShadowCaster(mesh)
        })

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

    CreateBallMaterial(): PBRMaterial {
        const ballMat = new PBRMaterial('ball', this.scene)

        const uvScale = 2
        const texArray: Texture[] = []

        const albedoTex = new Texture(
            './textures/sciFi/TexturesCom_SciFiPanels09_1K_albedo.jpeg'
        )

        ballMat.albedoTexture = albedoTex
        texArray.push(albedoTex)

        const normalTex = new Texture(
            './textures/sciFi/TexturesCom_SciFiPanels09_1K_normal.jpg'
        )

        ballMat.bumpTexture = normalTex
        texArray.push(normalTex)

        const metallicTex = new Texture(
            './textures/sciFi/TexturesCom_SciFiPanels09_1K_metallic.jpeg')

        ballMat.metallicTexture = metallicTex
        texArray.push(metallicTex)

        ballMat.emissiveColor = new Color3(1, 1, 1)

        const emissiveTex = new Texture(
            './textures/sciFi/TexturesCom_SciFiPanels09_1K_emissive.jpg'
        )

        ballMat.emissiveTexture = emissiveTex
        texArray.push(emissiveTex)

        ballMat.emissiveIntensity = 12
        const glowLayer = new GlowLayer('glow', this.scene)

        glowLayer.intensity = .5

        texArray.forEach((tex) => {
            tex.uScale = uvScale
            tex.vScale = uvScale
        })

        // ballMat.roughness = 1
        ballMat.environmentIntensity = .75

        return ballMat
    }

    async CreateBarrel(): Promise<void> {
        const { meshes } = await SceneLoader.ImportMeshAsync('', './models/', 'wine_barrel_01_2k-processed.glb')

        meshes[1].position = new Vector3(0, 1, 0)

        console.log('meshes', meshes);
    }
}