import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import { getAssetPath } from '@utils/assetPath'
import styles from './WaterWaveBackground.module.css'

interface WaterWaveBackgroundProps {
  backgroundImage: string
  personImage?: string
  maskImage?: string
  waterMapImage?: string
  displacementScale?: number
  animationSpeed?: { x: number; y: number }
}

export const WaterWaveBackground: React.FC<WaterWaveBackgroundProps> = ({
  backgroundImage,
  personImage,
  maskImage,
  waterMapImage,
  displacementScale = 60,
  animationSpeed = { x: 0.8, y: 0.5 }
}) => {
  // 如果没有提供 waterMapImage，使用默认路径并处理
  const finalWaterMapImage = waterMapImage || getAssetPath('/assets/water/water-normal.jpg')
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let isMounted = true

    // 使用 Pixi v8 API 初始化应用
    ;(async () => {
      // 创建应用实例
      const app = new PIXI.Application()

      // 异步初始化
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x000000,
        antialias: true,
        resizeTo: window
      })

      if (!isMounted || !containerRef.current) {
        app.destroy(true)
        return
      }

      containerRef.current.appendChild(app.canvas)
      appRef.current = app

      // 存储精灵引用
      let bgStatic: PIXI.Sprite
      let bgWater: PIXI.Sprite
      let personSprite: PIXI.Sprite | null = null
      let dispSprite: PIXI.Sprite
      let maskSprite: PIXI.Sprite | null = null

      // 使用 Pixi v8 Assets API 加载资源
      const loadAssets = async () => {
        try {
          console.log('Loading assets...')

          // 使用新的 Assets.load API（直接传入对象）
          const textures: any = {}

          // 加载背景图
          if (backgroundImage) {
            console.log('Loading background:', backgroundImage)
            textures.background = await PIXI.Assets.load(backgroundImage)
          }

          // 加载水波纹贴图
          if (finalWaterMapImage) {
            console.log('Loading waterMap:', finalWaterMapImage)
            textures.waterMap = await PIXI.Assets.load(finalWaterMapImage)
          }

          // 加载人物图（可选）
          if (personImage) {
            console.log('Loading person:', personImage)
            textures.person = await PIXI.Assets.load(personImage)
          }

          // 加载遮罩图（可选）
          if (maskImage) {
            console.log('Loading mask:', maskImage)
            textures.mask = await PIXI.Assets.load(maskImage)
          }

          return textures
        } catch (error) {
          console.error('Error loading assets:', error)
          throw error
        }
      }

      loadAssets().then((textures) => {
        // 检查背景纹理是否加载成功
        if (!textures.background) {
          console.error('Failed to load background texture')
          return
        }

        // 计算缩放比例
        const scale = Math.max(
          app.renderer.width / textures.background.width,
          app.renderer.height / textures.background.height
        )

        // 1. 底层：静态背景（提供非水面区域的显示）
        bgStatic = new PIXI.Sprite(textures.background)
        bgStatic.anchor.set(0.5)
        bgStatic.x = app.renderer.width / 2
        bgStatic.y = app.renderer.height / 2
        bgStatic.scale.set(scale)
        app.stage.addChild(bgStatic)

        // 2. 中层：水面背景（带波纹，通过遮罩只在水面显示）
        bgWater = new PIXI.Sprite(textures.background)
        bgWater.anchor.set(0.5)
        bgWater.x = app.renderer.width / 2
        bgWater.y = app.renderer.height / 2
        bgWater.scale.set(scale)
        app.stage.addChild(bgWater)

      // 3. 如果有遮罩，创建遮罩精灵
      if (maskImage && textures.mask) {
        maskSprite = new PIXI.Sprite(textures.mask)
        maskSprite.anchor.set(0.5)
        maskSprite.x = app.renderer.width / 2
        maskSprite.y = app.renderer.height / 2
        maskSprite.scale.set(scale)
        app.stage.addChild(maskSprite)
        bgWater.mask = maskSprite
      }

        // 4. 创建位移贴图精灵
        if (!textures.waterMap) {
          console.error('Failed to load water map texture')
          return
        }

        console.log('Creating displacement sprite...')
        dispSprite = new PIXI.Sprite(textures.waterMap)
        dispSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT

        const dispScale = Math.max(
          app.renderer.width / dispSprite.texture.width,
          app.renderer.height / dispSprite.texture.height
        ) * 4

        dispSprite.scale.set(dispScale)
        dispSprite.anchor.set(0)
        dispSprite.x = 0
        dispSprite.y = 0
        dispSprite.alpha = 0
        app.stage.addChild(dispSprite)
        console.log('Displacement sprite created:', dispSprite)

        // 5. 创建位移滤镜
        console.log('Creating displacement filter...')
        const displacementFilter = new PIXI.DisplacementFilter(dispSprite)
        displacementFilter.scale.x = displacementScale
        displacementFilter.scale.y = displacementScale
        bgWater.filters = [displacementFilter]
        console.log('Displacement filter applied to bgWater:', displacementFilter)

        // 6. 如果有人物图片，创建人物层
        if (personImage && textures.person) {
          console.log('Background texture size:', textures.background.width, 'x', textures.background.height)
          console.log('Person texture size:', textures.person.width, 'x', textures.person.height)
          console.log('Calculated scale:', scale)

          personSprite = new PIXI.Sprite(textures.person)
          personSprite.anchor.set(0.5)
          personSprite.x = app.renderer.width / 2
          personSprite.y = app.renderer.height / 2

          // 为人物图片计算独立的缩放比例
          const personScale = Math.max(
            app.renderer.width / textures.person.width,
            app.renderer.height / textures.person.height
          )

          personSprite.scale.set(personScale)
          app.stage.addChild(personSprite)

          console.log('Person scale:', personScale)
          console.log('Person sprite position:', personSprite.x, personSprite.y)
        }

        // 6. 启动动画
        console.log('Starting animation ticker...')
        let frameCount = 0
        app.ticker.add((delta) => {
          if (dispSprite) {
            dispSprite.x += animationSpeed.x * delta.deltaTime
            dispSprite.y += animationSpeed.y * delta.deltaTime

            const texWidth = dispSprite.texture.width * dispSprite.scale.x
            const texHeight = dispSprite.texture.height * dispSprite.scale.y

            dispSprite.x = dispSprite.x % texWidth
            dispSprite.y = dispSprite.y % texHeight

            // 每60帧输出一次调试信息
            if (frameCount % 60 === 0) {
              console.log('Animation running, dispSprite position:', dispSprite.x, dispSprite.y)
            }
            frameCount++
          }
        })
        console.log('Animation ticker started')

        // 响应窗口大小变化
        const handleResize = () => {
          if (bgStatic && bgWater) {
            const newScale = Math.max(
              app.renderer.width / bgStatic.texture.width,
              app.renderer.height / bgStatic.texture.height
            )

            bgStatic.x = app.renderer.width / 2
            bgStatic.y = app.renderer.height / 2
            bgStatic.scale.set(newScale)

            bgWater.x = app.renderer.width / 2
            bgWater.y = app.renderer.height / 2
            bgWater.scale.set(newScale)

          if (maskSprite) {
            maskSprite.x = app.renderer.width / 2
            maskSprite.y = app.renderer.height / 2
            maskSprite.scale.set(newScale)
          }

          if (personSprite) {
            personSprite.x = app.renderer.width / 2
            personSprite.y = app.renderer.height / 2
            personSprite.scale.set(newScale)
          }

          if (dispSprite) {
            const dispScale = Math.max(
              app.renderer.width / dispSprite.texture.width,
              app.renderer.height / dispSprite.texture.height
            ) * 4
            dispSprite.scale.set(dispScale)
          }
        }
      }

        window.addEventListener('resize', handleResize)
      }).catch((error) => {
        console.error('Failed to load water wave assets:', error)
      })
    })()

    // 清理
    return () => {
      isMounted = false
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
    }
  }, [backgroundImage, personImage, maskImage, waterMapImage, displacementScale, animationSpeed])

  return <div ref={containerRef} className={styles.waterWaveBackground} />
}
