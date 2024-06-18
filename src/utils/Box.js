import Body from './Body'
export default class Box extends Body {
    // radius = 10
    radius = 0
    mass = 40
    friction = 0.95
    attractionForce = 100
    collitionForce = 30
    gravityForce = 0
    // color = "#FFFFFF"
    type = 'box'

    constructor(canvas, props) {
        super(props)
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
    }

    draw() {
      this.ctx.beginPath()
      this.ctx.rect(this.x, this.y, this.width, this.height)
      this.ctx.fillStyle = this.color
      this.ctx.fill()
      this.ctx.closePath()
    }

    select() {
        this.selected = true
        this.color = '#f5ff08'
        this.velocityX = 0
        this.velocityY = 0
    }

    deselect() {
        this.color = "#FFFFFF"
        this.selected = false
        this.velocityX = 0
        this.velocityY = 0
    }
}