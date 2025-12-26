import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { TouchTexture } from '@/utils/TouchTexture'
import vertexShader from '@/shaders/interactiveParticle.vert.glsl?raw'
import fragmentShader from '@/shaders/interactiveParticle.frag.glsl?raw'
import styles from './InteractiveLogo.module.css'

interface InteractiveLogoProps {
  imageSrc: string
  width?: number
  height?: number
}

export const InteractiveLogo: React.FC<InteractiveLogoProps> = ({
  imageSrc,
  width = 557,
  height = 557
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | undefined>(undefined)
  const cameraRef = useRef<THREE.OrthographicCamera | undefined>(undefined)
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined)
  const particlesRef = useRef<THREE.Mesh | undefined>(undefined)
  const touchTextureRef = useRef<TouchTexture | undefined>(undefined)
  const raycasterRef = useRef<THREE.Raycaster | undefined>(undefined)
  const hitAreaRef = useRef<THREE.Mesh | undefined>(undefined)
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!containerRef.current) {
      console.error('InteractiveLogo: containerRef is null')
      return
    }

    console.log('InteractiveLogo: Initializing...', { imageSrc, width, height })

    // Initialize scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Initialize camera - 先用占位值，加载图片后再调整
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      1,
      1000
    )
    camera.position.z = 100
    cameraRef.current = camera

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Initialize raycaster for mouse interaction
    const raycaster = new THREE.Raycaster()
    raycasterRef.current = raycaster

    // Load texture and create particles
    const loader = new THREE.TextureLoader()
    loader.load(
      imageSrc,
      (texture) => {
        console.log('InteractiveLogo: Texture loaded successfully', {
          width: texture.image.width,
          height: texture.image.height
        })

        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter

        const imgWidth = texture.image.width
        const imgHeight = texture.image.height

        // 关键：调整相机视野来"放大"粒子
        // 使相机看到的区域小于图片尺寸，从而放大效果
        // 使用图片高度作为相机尺寸（因为高度更小），这样会放大 logo
        const camSize = Math.min(imgWidth, imgHeight)
        if (cameraRef.current) {
          cameraRef.current.left = -camSize / 2
          cameraRef.current.right = camSize / 2
          cameraRef.current.top = camSize / 2
          cameraRef.current.bottom = -camSize / 2
          cameraRef.current.updateProjectionMatrix()
        }

        console.log('InteractiveLogo: Camera adjusted for zoom effect', {
          containerSize: { width, height },
          imageSize: { width: imgWidth, height: imgHeight },
          cameraSize: camSize
        })

        createParticles(texture, imgWidth, imgHeight)
        createHitArea(imgWidth, imgHeight)
        animate()
      },
      undefined,
      (error) => {
        console.error('InteractiveLogo: Failed to load texture', error)
      }
    )

    const createParticles = (texture: THREE.Texture, imgWidth: number, imgHeight: number): void => {
      // Create touch texture
      const touchTexture = new TouchTexture()
      touchTextureRef.current = touchTexture

      // Get image data to filter dark pixels
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = imgWidth
      canvas.height = imgHeight
      ctx.drawImage(texture.image as CanvasImageSource, 0, 0)
      const imgData = ctx.getImageData(0, 0, imgWidth, imgHeight)

      const numPoints = imgWidth * imgHeight
      let numVisible = 0
      const threshold = 34

      // Count visible pixels
      for (let i = 0; i < numPoints; i++) {
        const alpha = imgData.data[i * 4 + 3]
        if (alpha > threshold) numVisible++
      }

      // Create geometry
      const geometry = new THREE.InstancedBufferGeometry()

      // Base quad for each particle
      const positions = new Float32Array([
        -0.5, 0.5, 0.0,
        0.5, 0.5, 0.0,
        -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0
      ])
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

      // UVs for the quad
      const uvs = new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
      ])
      geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

      // Indices
      geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1))

      // Instance attributes
      const indices = new Uint16Array(numVisible)
      const offsets = new Float32Array(numVisible * 3)
      const angles = new Float32Array(numVisible)

      let j = 0
      for (let i = 0; i < numPoints; i++) {
        const alpha = imgData.data[i * 4 + 3]
        if (alpha <= threshold) continue

        offsets[j * 3 + 0] = (i % imgWidth)
        offsets[j * 3 + 1] = Math.floor(i / imgWidth)
        offsets[j * 3 + 2] = 0

        indices[j] = i
        angles[j] = Math.random() * Math.PI * 2

        j++
      }

      geometry.setAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false))
      geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false))
      geometry.setAttribute('angle', new THREE.InstancedBufferAttribute(angles, 1, false))

      // Create material with shaders
      const material = new THREE.RawShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uRandom: { value: 5.0 },  // 初始值大，粒子分散
          uDepth: { value: 40.0 },   // 初始深度大，粒子远离
          uSize: { value: 0.0 },     // 初始大小为0
          uTextureSize: { value: new THREE.Vector2(imgWidth, imgHeight) },
          uTexture: { value: texture },
          uTouch: { value: touchTexture.texture }
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false
      })

      const particles = new THREE.Mesh(geometry, material)
      scene.add(particles)
      particlesRef.current = particles

      // 不缩放粒子，通过相机视野来控制大小
      particles.scale.set(1, 1, 1)

      console.log('InteractiveLogo: Particles created', {
        numVisible,
        numPoints: imgWidth * imgHeight,
        imgSize: { width: imgWidth, height: imgHeight },
        containerSize: { width, height }
      })

      // 入场聚合动画
      animateEntrance(material)
    }

    const animateEntrance = (material: THREE.RawShaderMaterial) => {
      const duration = 2000 // 2秒动画时长
      const startTime = Date.now()

      const easeOutCubic = (t: number) => {
        return 1 - Math.pow(1 - t, 3)
      }

      const entranceAnimation = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeOutCubic(progress)

        // 粒子逐渐聚合 - 增大最终粒子尺寸
        material.uniforms.uRandom.value = 5.0 - eased * 4.0  // 5.0 -> 1.0
        material.uniforms.uDepth.value = 40.0 - eased * 38.0 // 40.0 -> 2.0
        material.uniforms.uSize.value = eased * 8.0          // 0.0 -> 8.0 (大幅增大粒子)

        if (progress < 1) {
          requestAnimationFrame(entranceAnimation)
        } else {
          console.log('InteractiveLogo: Entrance animation complete')
        }
      }

      entranceAnimation()
    }

    const createHitArea = (imgWidth: number, imgHeight: number) => {
      const geometry = new THREE.PlaneGeometry(imgWidth, imgHeight, 1, 1)
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthTest: false
      })
      const hitArea = new THREE.Mesh(geometry, material)
      scene.add(hitArea)
      hitAreaRef.current = hitArea
    }

    const animate = () => {
      if (!particlesRef.current || !touchTextureRef.current) return

      // Update touch texture
      touchTextureRef.current.update()

      // Update time uniform
      const material = particlesRef.current.material as THREE.RawShaderMaterial
      material.uniforms.uTime.value += 0.01

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    console.log('InteractiveLogo: Animation loop started')

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !hitAreaRef.current || !raycasterRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!)
      const intersects = raycasterRef.current.intersectObject(hitAreaRef.current)

      if (intersects.length > 0 && touchTextureRef.current) {
        const uv = intersects[0].uv
        if (uv) {
          touchTextureRef.current.addTouch(uv)
        }
      }
    }

    containerRef.current.addEventListener('mousemove', handleMouseMove)

    // Cleanup
    return () => {
      containerRef.current?.removeEventListener('mousemove', handleMouseMove)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (particlesRef.current) {
        particlesRef.current.geometry.dispose()
        ;(particlesRef.current.material as THREE.Material).dispose()
      }

      if (touchTextureRef.current) {
        touchTextureRef.current.dispose()
      }

      if (rendererRef.current) {
        rendererRef.current.dispose()
        if (containerRef.current?.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement)
        }
      }
    }
  }, [imageSrc, width, height])

  return <div ref={containerRef} className={styles.container} />
}
