<script lang="ts">
  import Game from '../utils/Game'
  import ControlPanel from './ControlPanel.vue'
  import type { Config, ParticleProps } from '../types'
  import Circle from '../utils/Circle'
  import Box from '../utils/Box'

  export default {
    components: {
      ControlPanel
    },
    data() {
      let selectedObject: Circle|Box|undefined;
      return {
        containerSize: 500,
        game: new Game('game-canvas'),
        selectedTool: '',
        selectedObject: selectedObject,
        mouse: {
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0,
          lastX: 0,
          lastY: 0,
          isMouseDown: false
        },
        isPlaying: false,
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
      updateConfig(config:Config) {
        this.game.applyConfig(config)
        this.game.setCanvasSize()
      },
      updateParticle(particle:ParticleProps) {
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
            self.handleClick(event)
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
          self.selectedObject = undefined;
        })

        document.addEventListener('keydown', (event) => {
          if (event.key === 'Escape') {
            self.pauseGame()
            this.$emit('pause', this.isPlaying)
          }
        })
      },
      handleClick(event:MouseEvent) {
        let inBounds = this.game.checkWindowBouds(event.clientX, event.clientY)
        if (!inBounds?.inbound) {
          return
        }

        if (this.selectedTool) {
          this.game.handleTool(this.selectedTool, inBounds)
          return;
        }

        const particle = this.game.particles.find(
          (p:Circle|Box) => p.isClicked(inBounds)
        )

        if (particle) {
          this.mouse.startX = inBounds.x
          this.mouse.startY = inBounds.y
          this.mouse.isMouseDown = true

          if (this.selectedObject && particle.id !== this.selectedObject.id) {
            this.selectedObject.deselect();
          }

          particle.select();
          particle.isDragging = true
          this.selectedObject = particle;
          return this.selectedObject
        }

        return false;
      },
      handleRightClick() {
        if (this.selectedObject) {
          this.selectedObject.deselect()
          this.selectedObject = undefined
        }
      },
      handleMouseUp(event:MouseEvent) {
        if (!this.mouse.isMouseDown || !this.selectedObject) return;

        this.mouse.endX = event.clientX;
        this.mouse.endY = event.clientY;
        this.mouse.isMouseDown = false;
        if (this.selectedObject) {
          this.selectedObject.isDragging = false
        }

        // const direction = this.determineDirection(this.mouse.startX, this.mouse.startY, this.mouse.endX, this.mouse.endY);
        // this.selectedParticle?.applyForce(10, {
        //   x: direction.x * 2,
        //   y: direction.y * 2
        // });
        // this.selectedParticle = null
      },
      handleMouseMove(event:MouseEvent) {

        if (this.selectedTool) {
          return;
        }

        if (this.selectedObject && this.selectedObject.isDragging) {
          this.game.moveParticle(this.selectedObject, event.clientX, event.clientY)
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
      @changeTool="changeTool"
      :settings="game.config"  
    />
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