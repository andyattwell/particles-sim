import Body from './Body'
export default class Box extends Body {
    // radius = 10
    radius = 0
    width = 20
    height = 20
    friction = 0.95
    mass = 1
    collitionForce = 5
    attractionForce = 50
    gravityForce = 0.05
    baseColor = "#696969"
    color = "#696969"
    isCircle = false
    type = 'box'

    constructor(game, props) {
        super(game, props)
        if (!props.height) {
            this.height = 20
        }
        if (!props.width) {
            this.width = 20
        }
        this.canvas = game.canvas
        this.ctx = this.canvas.getContext('2d')
    }

    draw() {
      this.ctx.beginPath()
      this.ctx.rect(this.x, this.y, this.width, this.height)
      this.ctx.fillStyle = this.color
      this.ctx.fill()
      this.ctx.closePath()
    }
}