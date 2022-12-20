import { Scene, Engine, FreeCamera, Vector3, HemisphericLight, MeshBuilder, CubeTexture, StandardMaterial, Texture, PBRMaterial, Color3, GlowLayer, SceneLoader } from '@babylonjs/core'
import '@babylonjs/loaders'

export class CustomModels {

    scene: Scene;
    engine: Engine;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true)
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

        const hemiLight = new HemisphericLight(
            'hemiLight',
            new Vector3(0, 1, 0),
            this.scene
        )

        hemiLight.intensity = 0

        const envTex = CubeTexture.CreateFromPrefilteredData(
            './environment/brown_photostudio_02_2k.env',
            scene
        )

        scene.environmentTexture = envTex

        scene.createDefaultSkybox(envTex, true)

        scene.environmentIntensity = 1

        return scene

    }

    CreateEnvironment(): void {
        const ground = MeshBuilder.CreateGround(
            'ground',
            { width: 10, height: 10 },
            this.scene
        )

        const ball = MeshBuilder.CreateSphere('Ball', { diameter: 1 }, this.scene)

        ground.material = this.CreateGroundMaterial()
        ball.material = this.CreateBallMaterial()

        ball.position = new Vector3(0, 3, 0)

        this.CreateBarrel()

        this.CreateCampfire()
    }

    CreateGroundMaterial(): PBRMaterial {
        const groundMat = new PBRMaterial('groundMat', this.scene)

        const uvScale = 4
        const texArray: Texture[] = []

        const albedoTex = new Texture(
            './textures/nature/forrest_ground_01_diff_1k.jpg')


        groundMat.albedoTexture = albedoTex
        texArray.push(albedoTex)

        const normalTex = new Texture(
            './textures/nature/forrest_ground_01_nor_gl_1k.jpg')


        groundMat.bumpTexture = normalTex
        groundMat.invertNormalMapX = true
        groundMat.invertNormalMapY = true
        texArray.push(albedoTex)

        groundMat.useAmbientOcclusionFromMetallicTextureRed = true

        groundMat.useRoughnessFromMetallicTextureGreen = true
        groundMat.useMetallnessFromMetallicTextureBlue = true

        const metallicTex = new Texture(
            './textures/nature/forrest_ground_01_arm_1k.jpg'
        )

        groundMat.metallicTexture = metallicTex
        texArray.push(metallicTex)

        texArray.forEach((tex) => {
            tex.uScale = uvScale
            tex.vScale = uvScale
        })

        // groundMat.roughness = 1

        return groundMat
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

        ballMat.emissiveColor = new Color3(1,1,1)

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
        ballMat.environmentIntensity =.75

        return ballMat
    }

    async CreateBarrel() :Promise<void> {
        // SceneLoader.ImportMesh('', './models/', 'wine_barrel_01_2k-processed.glb', this.scene, (meshes) => {
        //     console.log('meshes', meshes);
        // })
        const {meshes} = await SceneLoader.ImportMeshAsync('', './models/', 'wine_barrel_01_2k-processed.glb')

        meshes[1].position = new Vector3(0,1,0)

        console.log('meshes', meshes);
    }

    async CreateCampfire(): Promise<void> {
        const model = await SceneLoader.ImportMeshAsync('', './models/', 'campfire.glb')

        model.meshes[0].position = new Vector3(-13,0,0)

    }
}