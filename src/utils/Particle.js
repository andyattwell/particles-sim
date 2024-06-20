import Body from './Body'
export default class Particle extends Body {
  ctx
  color = '#0095DD'
  baseColor = '#0095DD'
  selected = false
  radius = 20
  isCircle = true
  type = 'particle'

  constructor(game, props) {
    super(game, props)
    this.canvas = game.canvas
    this.ctx = this.canvas.getContext('2d')
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