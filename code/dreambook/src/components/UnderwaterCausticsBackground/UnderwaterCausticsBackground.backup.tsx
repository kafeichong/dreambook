import { useEffect, useRef } from 'react'
import * as PIXI from 'pixi.js'
import styles from './UnderwaterCausticsBackground.module.css'

interface UnderwaterCausticsBackgroundProps {
  backgroundImage: string
  particleCount?: number
  lightSpotCount?: number
  causticsIntensity?: number
  animationSpeed?: number
}

export const UnderwaterCausticsBackground: React.FC<UnderwaterCausticsBackgroundProps> = ({
  backgroundImage,
  particleCount = 100,
  lightSpotCount = 40,
  causticsIntensity = 0.4,
  animationSpeed = 1.0
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let isMounted = true

    // 初始化 Pixi 应用
    ;(async () => {
      const app = new PIXI.Application()

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

      // 加载背景图
      console.log('Loading background image:', backgroundImage)
      const bgTexture = await PIXI.Assets.load(backgroundImage)
      console.log('Background texture loaded:', bgTexture)

      // 创建背景精灵
      const background = new PIXI.Sprite(bgTexture)
      background.anchor.set(0.5)
      background.x = app.renderer.width / 2
      background.y = app.renderer.height / 2

      const bgScale = Math.max(
        app.renderer.width / background.texture.width,
        app.renderer.height / background.texture.height
      )
      background.scale.set(bgScale)
      app.stage.addChild(background)
      console.log('Background sprite created and added to stage')
      console.log('Background position:', background.x, background.y)
      console.log('Background size:', background.width, background.height)

      // ==================== 焦散效果 - 使用真实的序列帧纹理 ====================
      console.log('Loading caustics sequence...')

      // 加载所有焦散序列帧
      const loadCausticsFrames = async () => {
        const frameCount = 240
        const textures: PIXI.Texture[] = []

        console.log('Loading caustics frames...')

        for (let i = 0; i < frameCount; i++) {
          const frameNumber = i.toString().padStart(4, '0')
          const path = `/assets/caustics/02B_Caribbean_Caustics_Deep_FREE_SAMPLE_${frameNumber}.jpg`
          try {
            const texture = await PIXI.Assets.load(path)
            textures.push(texture)
          } catch (error) {
            console.error(`Failed to load frame ${i}:`, error)
          }
        }

        console.log(`Loaded ${textures.length} caustics frames`)
        return textures
      }

      // 异步加载序列帧
      loadCausticsFrames().then((textures) => {
        if (textures.length === 0) {
          console.error('No caustics textures loaded')
          return
        }

        // 创建焦散动画精灵（全屏覆盖）
        const causticsSprite = new PIXI.AnimatedSprite(textures)

        causticsSprite.anchor.set(0.5)
        causticsSprite.x = app.renderer.width / 2
        causticsSprite.y = app.renderer.height / 2

        // 缩放以覆盖整个屏幕
        const scale = Math.max(
          app.renderer.width / textures[0].width,
          app.renderer.height / textures[0].height
        ) * 1.2 // 稍微放大一点

        causticsSprite.scale.set(scale)

        // 设置混合模式和透明度
        causticsSprite.blendMode = 'add'
        causticsSprite.alpha = causticsIntensity

        // 设置动画参数
        causticsSprite.animationSpeed = animationSpeed * 0.3 // 调整播放速度
        causticsSprite.play()
        causticsSprite.loop = true

        app.stage.addChild(causticsSprite)

        console.log('Caustics animation sprite created and playing')

        // 保存引用以便在 resize 时调整
        const handleResize = () => {
          causticsSprite.x = app.renderer.width / 2
          causticsSprite.y = app.renderer.height / 2
          const newScale = Math.max(
            app.renderer.width / textures[0].width,
            app.renderer.height / textures[0].height
          ) * 1.2
          causticsSprite.scale.set(newScale)
        }

        window.addEventListener('resize', handleResize)
      }).catch((error) => {
        console.error('Failed to load caustics sequence:', error)
      })

      // 确保背景可见
      background.visible = true
      background.alpha = 1
      console.log('Background visibility:', background.visible, 'alpha:', background.alpha)

      // ==================== 光斑粒子系统 ====================
      // 创建光斑纹理
      const createLightSpotTexture = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 100
        canvas.height = 100
        const ctx = canvas.getContext('2d')!

        const gradient = ctx.createRadialGradient(50, 50, 0, 50, 50, 50)
        gradient.addColorStop(0, 'rgba(100, 200, 255, 0.8)')
        gradient.addColorStop(0.4, 'rgba(100, 200, 255, 0.4)')
        gradient.addColorStop(1, 'rgba(100, 200, 255, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 100, 100)

        return PIXI.Texture.from(canvas)
      }

      const lightSpotTexture = createLightSpotTexture()

      // 创建粒子容器
      const particlesContainer = new PIXI.Container()
      app.stage.addChild(particlesContainer)

      // 创建光斑粒子
      interface LightSpot {
        sprite: PIXI.Sprite
        vx: number
        vy: number
        phase: number
        phaseSpeed: number
        baseAlpha: number
      }

      const lightSpots: LightSpot[] = []

      for (let i = 0; i < lightSpotCount; i++) {
        const spot = new PIXI.Sprite(lightSpotTexture)
        spot.anchor.set(0.5)
        spot.x = Math.random() * app.renderer.width
        spot.y = Math.random() * app.renderer.height

        const size = 50 + Math.random() * 100
        spot.scale.set(size / 100)

        spot.blendMode = 'add'
        spot.alpha = 0.3 + Math.random() * 0.3

        particlesContainer.addChild(spot)

        lightSpots.push({
          sprite: spot,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.3,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.02 + Math.random() * 0.03,
          baseAlpha: spot.alpha
        })
      }

      // ==================== 动画循环 ====================
      app.ticker.add((delta) => {
        // 更新光斑粒子
        lightSpots.forEach(spot => {
          // 移动
          spot.sprite.x += spot.vx * delta.deltaTime
          spot.sprite.y += spot.vy * delta.deltaTime

          // 边界检测
          if (spot.sprite.x < -50) spot.sprite.x = app.renderer.width + 50
          if (spot.sprite.x > app.renderer.width + 50) spot.sprite.x = -50
          if (spot.sprite.y < -50) spot.sprite.y = app.renderer.height + 50
          if (spot.sprite.y > app.renderer.height + 50) spot.sprite.y = -50

          // 闪烁效果
          spot.phase += spot.phaseSpeed * delta.deltaTime
          spot.sprite.alpha = spot.baseAlpha * (0.6 + 0.4 * Math.sin(spot.phase))
        })
      })

      // 响应窗口大小变化
      const handleResize = () => {
        if (background) {
          background.x = app.renderer.width / 2
          background.y = app.renderer.height / 2
          const scale = Math.max(
            app.renderer.width / background.texture.width,
            app.renderer.height / background.texture.height
          )
          background.scale.set(scale)
        }
      }

      window.addEventListener('resize', handleResize)

    })()

    // 清理
    return () => {
      isMounted = false
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
    }
  }, [backgroundImage, lightSpotCount, causticsIntensity, animationSpeed])

  return <div ref={containerRef} className={styles.underwaterCausticsBackground} />
}
