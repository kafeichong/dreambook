import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import styles from './Background.module.css'

interface ThreeBackgroundProps {
  gradient?: string
  backgroundImage?: string
  particleColor: string
  particleSpeed: number
  particleDirection: 'up' | 'down' | 'random'
}

interface ParticleLayer {
  count: number
  geometry: THREE.BufferGeometry
  basePositions: Float32Array
  speeds: Float32Array
  amps: Float32Array
  phases: Float32Array
  points: THREE.Points
  material: THREE.ShaderMaterial
}

export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({
  gradient,
  backgroundImage
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | undefined>(undefined)
  const cameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined)
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const clockRef = useRef<THREE.Clock | undefined>(undefined)
  const layersRef = useRef<ParticleLayer[]>([])

  useEffect(() => {
    if (!containerRef.current) return

    // 初始化场景
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // 初始化相机
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      2000
    )
    camera.position.z = 700
    cameraRef.current = camera

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0'
    renderer.domElement.style.left = '0'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.pointerEvents = 'none'

    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 时钟
    const clock = new THREE.Clock()
    clockRef.current = clock

    // Shader
    const vertexShader = `
      attribute float size;
      attribute float alpha;
      attribute float phase;
      varying float vAlpha;
      varying float vPhase;

      void main() {
        vAlpha = alpha;
        vPhase = phase;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `

    const fragmentShader = `
      uniform vec3  uColor;
      uniform float uTime;

      varying float vAlpha;
      varying float vPhase;

      void main() {
        vec2 pc = gl_PointCoord - vec2(0.5);
        float r = length(pc);

        float glow = exp(-12.0 * r * r);

        // 轻微闪烁：0.7 ~ 1.0 之间缓慢变化
        float twinkle = 0.7 + 0.3 * sin(uTime * 0.6 + vPhase);

        float finalAlpha = glow * vAlpha * twinkle;

        if (finalAlpha < 0.01) discard;

        gl_FragColor = vec4(uColor, finalAlpha);
      }
    `

    // 创建粒子层函数
    const createParticleLayer = ({
      count,
      areaXY,
      areaZ,
      sizeMin,
      sizeMax,
      alphaMin,
      alphaMax,
      color,
      speedMin,
      speedMax,
      ampMin,
      ampMax
    }: {
      count: number
      areaXY: number
      areaZ: number
      sizeMin: number
      sizeMax: number
      alphaMin: number
      alphaMax: number
      color: number
      speedMin: number
      speedMax: number
      ampMin: number
      ampMax: number
    }): ParticleLayer => {
      const positions = new Float32Array(count * 3)
      const basePositions = new Float32Array(count * 3)
      const sizes = new Float32Array(count)
      const alphas = new Float32Array(count)
      const speeds = new Float32Array(count)
      const amps = new Float32Array(count)
      const phases = new Float32Array(count)

      for (let i = 0; i < count; i++) {
        const i3 = i * 3

        const x = (Math.random() - 0.5) * areaXY
        const y = (Math.random() - 0.5) * areaXY
        const z = (Math.random() - 0.5) * areaZ

        positions[i3 + 0] = basePositions[i3 + 0] = x
        positions[i3 + 1] = basePositions[i3 + 1] = y
        positions[i3 + 2] = basePositions[i3 + 2] = z

        sizes[i] = sizeMin + Math.random() * (sizeMax - sizeMin)
        alphas[i] = alphaMin + Math.random() * (alphaMax - alphaMin)

        speeds[i] = speedMin + Math.random() * (speedMax - speedMin)
        amps[i] = ampMin + Math.random() * (ampMax - ampMin)
        phases[i] = Math.random() * Math.PI * 2.0
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
      geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1))
      geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uTime: { value: 0 }
        }
      })

      const points = new THREE.Points(geometry, material)
      scene.add(points)

      return {
        count,
        geometry,
        basePositions,
        speeds,
        amps,
        phases,
        points,
        material
      }
    }

    // 创建三层粒子
    const backLayer = createParticleLayer({
      count: 420,
      areaXY: 980,
      areaZ: 400,
      sizeMin: 4,
      sizeMax: 10,
      alphaMin: 0.05,
      alphaMax: 0.14,
      color: 0xbfe7ff, // 淡蓝
      speedMin: 0.25,
      speedMax: 0.6,
      ampMin: 12,
      ampMax: 24
    })

    const frontTrailLayer = createParticleLayer({
      count: 80,
      areaXY: 820,
      areaZ: 260,
      sizeMin: 8,
      sizeMax: 50,
      alphaMin: 0.07,
      alphaMax: 0.18,
      color: 0xaed5ff, // 偏蓝的淡光
      speedMin: 0.5,
      speedMax: 0.8,
      ampMin: 16,
      ampMax: 32
    })

    const frontLayer = createParticleLayer({
      count: 80,
      areaXY: 820,
      areaZ: 260,
      sizeMin: 8,
      sizeMax: 80,
      alphaMin: 0.10,
      alphaMax: 0.22,
      color: 0xdcc4ff, // 带点紫的淡光
      speedMin: 0.5,
      speedMax: 0.8,
      ampMin: 16,
      ampMax: 32
    })

    layersRef.current = [backLayer, frontTrailLayer, frontLayer]

    // 更新粒子层函数
    const updateLayer = (layer: ParticleLayer, time: number, amplitudeScale = 1) => {
      const { count, geometry, basePositions, speeds, amps, phases } = layer
      const arr = geometry.attributes.position.array as Float32Array

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const baseX = basePositions[i3 + 0]
        const baseY = basePositions[i3 + 1]

        const speed = speeds[i]
        const amp = amps[i] * amplitudeScale
        const phase = phases[i]

        arr[i3 + 0] = baseX + Math.sin(time * speed + phase) * amp
        arr[i3 + 1] = baseY + Math.cos(time * speed * 0.85 + phase) * amp * 0.6
      }

      geometry.attributes.position.needsUpdate = true
    }

    // 动画循环
    const animate = () => {
      if (!clockRef.current || layersRef.current.length === 0) return

      const t = clockRef.current.getElapsedTime()

      // 更新位移
      updateLayer(backLayer, t * 0.6, 1.0)
      updateLayer(frontTrailLayer, t * 0.75 - 1.2, 1.30)
      updateLayer(frontLayer, t * 0.9, 1.1)

      // 轻微旋转
      backLayer.points.rotation.z = t * 0.018
      frontTrailLayer.points.rotation.z = t * 0.022
      frontLayer.points.rotation.z = t * 0.025

      // 更新时间到 Shader（控制闪烁）
      backLayer.material.uniforms.uTime.value = t
      frontTrailLayer.material.uniforms.uTime.value = t
      frontLayer.material.uniforms.uTime.value = t

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // 窗口大小调整
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return

      cameraRef.current.aspect = window.innerWidth / window.innerHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      layersRef.current.forEach(layer => {
        layer.geometry.dispose()
        layer.material.dispose()
      })

      if (rendererRef.current) {
        rendererRef.current.dispose()
        if (containerRef.current?.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement)
        }
      }
    }
  }, [gradient, backgroundImage])

  // 计算背景图片样式
  const backgroundImageStyle = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : gradient
    ? { background: gradient }
    : {}

  return (
    <div className={styles.background}>
      {/* 背景图片层 - 带呼吸动画 */}
      <div className={styles.backgroundLayer} style={backgroundImageStyle} />

      {/* Three.js 粒子层 */}
      <div ref={containerRef} className={styles.canvas} />
    </div>
  )
}
