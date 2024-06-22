import type { ParticleProps } from '@/types'
import Particle from './Particle'
import type Game from './Game'

export default class Circle extends Particle {
  color = '#0095DD'
  baseColor = '#0095DD'
  // selected = false
  // radius = 20
  isCircle = true
  type = 'circle'

  constructor(game: Game, props:ParticleProps) {
    super(game, props)
  }
  
  draw() {
    this.ctx.beginPath()
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    this.ctx.fillStyle = this.color
    this.ctx.fill()
    this.ctx.closePath()
    // super.draw()
  }
}