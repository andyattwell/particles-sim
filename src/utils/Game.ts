import Circle from './Circle'
import Box from './Box'
import { INITIAL_GAME_CONFIG } from './Settings'
import type { Config, ParticleType, ParticleProps } from '../types'

export default class Game {
  canvasId: string
  canvas: any = null
  ctx:any
  particles:Array<Circle|Box> = []
  config:Config = INITIAL_GAME_CONFIG
  requestId:number|null = null
  playing = false
  selectedProfile: string|undefined = 'Default'

  constructor(canvasId:string, config:Config|null = null) {
    this.canvasId = canvasId
    if (config) {
      this.config = config
    }
    this.setCanvas()
  }

  start() {
    this.particles = []
    this.createParticles(1, 'circle')
    this.createParticles(1, 'box')
    this.play()
  }

  play() {
    if (!this.requestId) {
      this.playing = true;
      this.update()
    }
  }

  stop() {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null
      this.playing = false;
    }
  }

  pause () {
    if (!this.requestId) {
      this.play()
    } else {
      this.stop()
    }
    return this.playing
  }

  reset(config:Config) {
    this.config = config
    this.particles = []
    this.start()
  }

  update() {
    if (!this.ctx) {
      return
    }
    this.ctx.clearRect(0, 0, this.canvas?.width, this.canvas?.height)
    const self = this

    this.ctx.save();

    this.drawClippingMask();

    this.particles.forEach((particle, index1) => {
      particle.draw()
      particle.update(index1, self.particles)
    })
    
    // Restore the canvas state to remove clipping for future drawings
    this.ctx.restore();

    if (this.playing) {
      this.requestId = requestAnimationFrame(() => {
        self.update()
      })
    }
  }

  drawClippingMask() {
    if (!this.canvas || !this.config) {
      return
    }
    const clipWidth = this.config.containerWidth || 1;
    const clipHeight = this.config.containerHeight || 1;
    const clipX = this.canvas.width / 2 - clipWidth / 2
    const clipY = this.canvas.height / 2 - clipHeight / 2
    this.ctx.beginPath();
    this.ctx.rect(clipX, clipY, clipWidth, clipHeight);
    this.ctx.clip();
    this.ctx.lineWidth = 2; // Border width
    this.ctx.strokeStyle = 'white'; // Border color
    this.ctx.stroke();
    this.ctx.closePath();
  }

  getMaskPosition() {
    const canvasWidth = this.canvas?.width || 1
    const canvasHeight = this.canvas?.width || 1
    const containerWidth = this.config?.containerWidth || 1
    const containerHeight = this.config?.containerHeight || 1

    const clipX = canvasWidth / 2 - containerWidth / 2
    const clipY = canvasHeight / 2 - containerHeight / 2
    return {
      x: clipX,
      y: clipY
    }
  }

  getRandomNumber(max:number) {
    return Math.floor(Math.random() * (max + 1))
  }

  addObject (props:ParticleProps) {
    let obj;
    if (props.type === 'circle') {
      obj = new Circle(this, props);
    } else if (props.type === 'box') {
      obj = new Box(this, props);
    }
    if (obj) {
      this.particles.push(obj)
    }
  }

  createParticles(particleAmmount:number, type:string) {
    const clipPos = this.getMaskPosition();
    const containerWidth = this.config.containerWidth || 1;
    const containerHeight = this.config.containerWidth || 1;
    for (let index = 0; index < particleAmmount; index++) {
      const position = {
        x: clipPos.x + this.getRandomNumber(containerWidth),
        y: clipPos.y + this.getRandomNumber(containerHeight)
      }
      this.addObject({ type, position })
    }
  }

  loadParticles(particlesArr:Array<ParticleProps>) {
    if (!particlesArr) return false;
    const containerWidth = this.config.containerWidth || 1;
    const containerHeight = this.config.containerWidth || 1;
    this.particles = []
    particlesArr.forEach(p => {
      this.addObject({
        ...this.config,
        ...p, 
        containerHeight: containerWidth,
        containerWidth: containerHeight
      })
    });
  }

  updateParticles() {
    
    if (this.config.particles) {
      this.loadParticles(this.config.particles);
    }

    const containerWidth = this.config.containerWidth || 1;
    const containerHeight = this.config.containerWidth || 1;

    this.particles.forEach((particle) => {
      particle.containerWidth = containerWidth
      particle.containerHeight = containerHeight
    })
  }

  moveParticle(particle:Circle|Box, mouseX:number, mouseY:number) {
    
    if (!this.canvas) return;

    let nextX = mouseX
    let nextY = mouseY

    const canvasHeight = this.canvas.height
    const canvasWidth =  this.canvas.width
    const containerHeight = this.config.containerHeight || 1
    const containerWidth = this.config.containerWidth || 1

    const clipX = (canvasWidth / 2) - (containerWidth / 2)
    const clipY = (canvasHeight / 2) - (containerHeight / 2)

    const boundWidth = clipX + containerWidth
    const boundHeight = clipY + containerHeight
    const boundingBox = particle.getBoundingBox(nextX, nextY);

    if (!particle.isCircle) { 
      nextX = boundingBox.left
      nextY = boundingBox.top
    }

    if (boundingBox.left < clipX) {
      nextX = clipX + (particle.isCircle ? particle.radius : 0)
    } else if (boundingBox.right > boundWidth) {
      nextX = boundWidth - (particle.isCircle ? particle.radius : particle.width) 
    }

    if (boundingBox.top <= clipY) {
      nextY = clipY +  (particle.isCircle ? particle.radius : 0) + 2;
    } else if (boundingBox.bottom > boundHeight) {
      nextY = boundHeight - (particle.isCircle ? particle.radius : particle.height) + 2;
    }

    particle.x = nextX
    particle.y = nextY
  }

  handleTool(tool: string, inBounds:any) {
    this.addObject({
      type: tool,
      position: inBounds
    });
  }

  setParticleProps(newParticle:ParticleProps) {
    const particle = this.particles.find((p) => newParticle.id === p.id)
    if(!particle) return;
    particle.setConfig(newParticle);
  }

  checkWindowBouds(pageX:number, pageY:number, particle:ParticleType|null = null) {
    if (!this.canvas) {
      return
    }

    const windowHeight = this.canvas.height
    const windowWidth = this.canvas.width

    let boundingBox = {
      left: pageX,
      right: pageX,
      top: pageY,
      bottom: pageY
    }

    if (particle) {
      boundingBox = particle.getBoundingBox()
    }
    const containerHeight = this.config.containerHeight || 1
    const containerWidth = this.config.containerWidth || 1
    const canvasLeft = windowWidth / 2 - containerWidth / 2
    const canvasRight = canvasLeft + containerWidth
    const canvasTop = windowHeight / 2 - containerHeight / 2
    const canvasBottom = canvasTop + containerHeight
    const canvasPosition = this.canvas.getBoundingClientRect()

    let inbound = true
    if (
      boundingBox.left < canvasLeft || 
      boundingBox.right > canvasRight || 
      boundingBox.top < canvasTop || 
      boundingBox.bottom > canvasBottom
    ) {
      inbound = false
    }

    const x = pageX - canvasPosition.left;
    const y = pageY - canvasPosition.top;

    return { inbound, x, y }
  }

  setCanvas() {
    this.canvas = document.getElementById(this.canvasId)
    this.ctx = this.canvas?.getContext('2d')
  }

  setCanvasSize(setWidth:number|null = null) {
    this.setCanvas();
    if (!this.canvas) {
      return;
    }
    const container = document.getElementById('canvas-container');

    if (!container) return;

    let width = container.clientWidth;
    const height = container.clientHeight;

    if (setWidth) {
      width = setWidth;
    }
    
    this.canvas.setAttribute('width', width.toString())
    this.canvas.setAttribute('height', height.toString())

    this.config.canvasMaxWidth = Number(width);
    this.config.canvasMaxHeight = Number(height);

    const containerHeight = this.config.containerHeight || 1
    const containerWidth = this.config.containerWidth || 1

    if (containerWidth > width) {
      this.config.containerWidth = width
    }
    if (containerHeight > height) {
      this.config.containerHeight = height
    }

    this.applyConfig(this.config);
  }
  
  applyConfig(config: Config, reload:boolean = false) {
    this.config = config
    this.config.canvasMaxWidth = Number(config.canvasMaxWidth);
    this.config.canvasMaxHeight = Number(config.canvasMaxHeight);
    this.selectedProfile = config.profileName

    this.particles.forEach((p) => {
      p.containerWidth = Number(this.config.containerWidth)
      p.containerHeight = Number(this.config.containerWidth)
    })
    if (reload) {
      this.reset(this.config)
    }
  }

  determineDirection(x1:number, y1:number, x2:number, y2:number) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return {
      x: Math.tanh(deltaX), y: Math.tanh(deltaY)
    }
  }

}