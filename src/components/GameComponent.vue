<script lang="ts">
  import Game from '../utils/Game.js'
  import ControlPanel from './ControlPanel.vue'

  export default {
    components: {
      ControlPanel
    },
    data() {
      return {
        containerSize: 500,
        game: new Game('game-canvas'),
        selectedTool: '',
        selectedObject: null,
        mouse: {}
      }
    },
    mounted() {
      this.startGame()
      this.addListeners()
    },
    methods: {
      startGame() {
        this.game.start()
      },
      pauseGame() {
        this.isPlaying = this.game.pause()
      },
      updateConfig(config) {
        this.game.applyConfig(config)
        this.game.setCanvasSize()
      },
      updateParticle(particle:Particle) {
        this.game.setParticleProps(particle)
      },
      resizeContainer() {
        const lsWidth = document.getElementById('particle-controls')?.clientWidth
        this.containerSize = window.innerWidth - (lsWidth || 0)
        if (this.game) {
          this.game.setCanvasSize(this.containerSize)
        };
      },
      addListeners() {
        const self = this

        window.addEventListener('resize', () => {
          self.resizeContainer();
        })

        document.addEventListener('mousedown', (event) => {
          if (event.target !== self.game.canvas) {
            this.selectedTool = ''
            return
          }
          event.preventDefault()
          if (event.button === 0) {
            const selected = self.handleClick(event)
            if (selected) {
              this.selectedObject = selected
              this.selectedObject.isDragging = true;
            }
            
            document.addEventListener('mousemove', mouseMove)
          }
          return false;
        })

        const mouseMove = (event:MouseEvent) => {
          self.handleMouseMove(event)
        }
        document.addEventListener('mouseup', (event) => {
          if (event.target === self.game.canvas) {
            self.handleMouseUp(event)
          }
          event.preventDefault()
          document.removeEventListener('mousemove', mouseMove)
          return false;
        })

        document.addEventListener('contextmenu', function(event) {
          if (event.target !== self.game.canvas) {
            return
          }
          event.preventDefault();
          // Your custom logic here
          self.changeTool('')
          self.handleRightClick();
          self.selectedObject = null;
        })

        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            self.pauseGame()
            this.$emit('pause', this.isPlaying)
          }
        })
      },
      handleClick(event) {
        let inBounds = this.game.checkWindowBouds(event.clientX, event.clientY)
        if (!inBounds.inbound) {
          return
        }

        if (this.selectedTool) {
          this.game.handleTool(this.selectedTool, inBounds)
          return;
        }

        const particle = this.game.particles.find((p) => p.isClicked(inBounds))

        this.mouse.startX = inBounds.x
        this.mouse.startY = inBounds.y
        this.mouse.isMouseDown = true

        if (particle) {

          if (this.selectedParticle && particle.id !== this.selectedParticle.id) {
            this.selectedParticle.deselect();
          }

          this.selectedParticle = particle;
          // this.selectedParticle.isDragging = true;
          this.selectedParticle.select();
          return this.selectedParticle
        }

        return false;
      },
      handleRightClick() {
        if (this.selectedParticle) {
          this.selectedParticle.deselect()
          this.selectedParticle = null
        }
      },
      handleMouseUp(event) {
        if (!this.mouse.isMouseDown || !this.selectedParticle) return;

        this.mouse.endX = event.clientX;
        this.mouse.endY = event.clientY;
        this.mouse.isMouseDown = false;
        if (this.selectedParticle) {
          this.selectedParticle.isDragging = false
        }

        // const direction = this.determineDirection(this.mouse.startX, this.mouse.startY, this.mouse.endX, this.mouse.endY);
        // this.selectedParticle?.applyForce(10, {
        //   x: direction.x * 2,
        //   y: direction.y * 2
        // });
        // this.selectedParticle = null
      },
      handleMouseMove(event) {

        if (this.selectedTool) {
          return;
        }

        if (this.selectedParticle && this.selectedParticle.isDragging) {
          this.game.moveParticle(this.selectedParticle, event.clientX, event.clientY)
        }

        if (this.mouse.isMouseDown) {
          this.mouse.lastX = this.mouse.startX;
          this.mouse.lastY = this.mouse.startY;
        }
      },
      changeTool(tool:string) {
        this.selectedTool = tool;
      }
    }
    
  }
</script>
<template>
  <div>
    <div ref="container" id="canvas-container" :style="{ width: containerSize + 'px'}">
      <canvas id="game-canvas"></canvas>
    </div>
    <ControlPanel 
      @resize="resizeContainer"
      @update="updateConfig"
      @updateParticle="updateParticle"
      :selectedTool="selectedTool"
      :selectedObject="selectedObject"
      @changeTool="changeTool"/>
  </div>
</template>
<style scoped>
  :root {
    --controls-width: 400px;
    display: block;
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
  }
  #canvas-container {
    top: 0;
    left: 0;
    position: absolute;
    height: 100vh;
  }

  canvas {
    position: relative;
  }
</style>