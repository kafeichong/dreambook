import * as THREE from 'three'

interface TouchPoint {
  x: number
  y: number
  age: number
  force: number
}

export class TouchTexture {
  private size: number
  private maxAge: number
  private radius: number
  private trail: TouchPoint[]
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  public texture: THREE.Texture

  constructor() {
    this.size = 64
    this.maxAge = 120
    this.radius = 0.15
    this.trail = []

    this.canvas = document.createElement('canvas')
    this.canvas.width = this.size
    this.canvas.height = this.size
    this.ctx = this.canvas.getContext('2d')!

    this.clear()

    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.minFilter = THREE.LinearFilter
    this.texture.magFilter = THREE.LinearFilter
  }

  update() {
    this.clear()

    // Age points and remove old ones
    this.trail = this.trail.filter(point => {
      point.age++
      return point.age <= this.maxAge
    })

    // Draw all touch points
    this.trail.forEach(point => {
      this.drawTouch(point)
    })

    this.texture.needsUpdate = true
  }

  clear() {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.size, this.size)
  }

  addTouch(point: { x: number; y: number }) {
    let force = 0
    const last = this.trail[this.trail.length - 1]

    if (last) {
      const dx = last.x - point.x
      const dy = last.y - point.y
      const dd = dx * dx + dy * dy
      force = Math.min(dd * 10000, 1)
    }

    this.trail.push({
      x: point.x,
      y: point.y,
      age: 0,
      force
    })
  }

  drawTouch(point: TouchPoint) {
    const pos = {
      x: point.x * this.size,
      y: (1 - point.y) * this.size
    }

    let intensity = 1
    const fadeInDuration = this.maxAge * 0.3
    const fadeOutStart = this.maxAge * 0.3

    if (point.age < fadeInDuration) {
      // Fade in
      intensity = this.easeOutSine(point.age / fadeInDuration)
    } else {
      // Fade out
      intensity = this.easeOutSine(1 - (point.age - fadeOutStart) / (this.maxAge * 0.7))
    }

    intensity *= point.force

    const radius = this.size * this.radius * intensity
    const grd = this.ctx.createRadialGradient(
      pos.x, pos.y, radius * 0.25,
      pos.x, pos.y, radius
    )

    grd.addColorStop(0, 'rgba(255, 255, 255, 0.2)')
    grd.addColorStop(1, 'rgba(0, 0, 0, 0.0)')

    this.ctx.beginPath()
    this.ctx.fillStyle = grd
    this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }

  private easeOutSine(t: number): number {
    return Math.sin((t * Math.PI) / 2)
  }

  dispose() {
    this.texture.dispose()
  }
}
