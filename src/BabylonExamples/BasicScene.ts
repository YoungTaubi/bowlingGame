import { Scene, Engine, FreeCamera, Vector3, HemisphericLight, MeshBuilder, CubeTexture, StandardMaterial, Texture } from '@babylonjs/core'


export class BasicScene {

    scene: Scene;
    engine: Engine;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true)
        this.scene = this.CreateScene()

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

        hemiLight.intensity = 2

        const envTex = CubeTexture.CreateFromPrefilteredData(
            '../../public/environmet/hdri.env',
            scene
        )

        scene.environmentTexture = envTex

        scene.createDefaultSkybox(envTex, true)

        const ground = MeshBuilder.CreateGround(
            'ground',
            { width: 10, height: 10 },
            this.scene
        )

        const ball = MeshBuilder.CreateSphere('Ball', { diameter: 1 }, this.scene)

        ground.material = this.CreateGroundMaterial()
        ball.material = this.CreateBallMaterial()

        ball.position = new Vector3(0, 1, 0)

        return scene

    }

    CreateGroundMaterial(): StandardMaterial {
        const groundMat = new StandardMaterial('groundMat', this.scene)

        const uvScale = 4
        const texArray: Texture[] = []

        const diffuseTex = new Texture(
            './textures/concrete/brushed_concrete_diff_1k.jpg',
            this.scene
        )

        groundMat.diffuseTexture = diffuseTex
        texArray.push(diffuseTex)

        const normalTex = new Texture(
            './textures/concrete/brushed_concrete_nor_gl_1k.jpg',
            this.scene
        )

        groundMat.bumpTexture = normalTex
        texArray.push(normalTex)

        const aoTex = new Texture(
            './textures/concrete/brushed_concrete_ao_1k.jpg'
        )

        groundMat.ambientTexture = aoTex
        texArray.push(aoTex)

        const specTex = new Texture(
            './textures/concrete/brushed_concrete_rough_1k.jpg'
        )

        groundMat.specularTexture = specTex
        texArray.push(specTex)

        texArray.forEach((tex) => {
            tex.uScale = uvScale
            tex.vScale = uvScale
        })

        return groundMat
    }

    CreateBallMaterial(): StandardMaterial {
        const ballMat = new StandardMaterial('ball', this.scene)

        const uvScale = 2
        const texArray: Texture[] = []

        const diffuseTex = new Texture(
            './textures/metal/metal_plate_diff_1k.jpg'
        )

        ballMat.diffuseTexture = diffuseTex
        texArray.push(diffuseTex)

        const bumpTex = new Texture(
            './textures/metal/metal_plate_nor_gl_1k.jpg'
        )

        ballMat.bumpTexture = bumpTex
        ballMat.invertNormalMapX = true
        ballMat.invertNormalMapY= true
        texArray.push(bumpTex)

        const aoTex = new Texture(
            './textures/metal/metal_plate_ao_1k.jpg'
        )

        ballMat.ambientTexture= aoTex
        texArray.push(aoTex)

        const specTex = new Texture(
            './textures/metal/metal_plate_spec_1k.jpg'
        )

        ballMat.specularTexture = specTex
        ballMat.specularPower = 8
        texArray.push(specTex)

        texArray.forEach((tex) => {
            tex.uScale = uvScale
            tex.vScale = uvScale
        })


        return ballMat
    }
}