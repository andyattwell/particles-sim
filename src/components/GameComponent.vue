<script lang="ts">
  import { GameControl } from '../utils/GameControl.js'
  import ControlPanel from './ControlPanel.vue'
  export default {
      components: {
        ControlPanel
      },
      data() {
        const gameControl:GameControl|undefined = undefined;
        return {
          containerSize: 500,
          gameControls: gameControl,
          selectedTool: '',
          selectedObject: null
        }
      },
      watch: {
        paused() {
          // this.gameControls.pause();
        }
      },
      mounted() {
        this.gameControls = new GameControl('game-canvas')
        this.startGame()
        this.addListeners()
      },
      methods: {
        startGame() {
          this.gameControls.start()
        },
        pauseGame() {
          this.isPlaying = this.gameControls.pause()
        },
        resizeContainer() {
          const lsWidth = document.getElementById('particle-controls')?.clientWidth
          this.containerSize = window.innerWidth - (lsWidth || 0)
          if (this.gameControls) {
            this.gameControls.setCanvasSize()
          };
        },
        addListeners() {
          const self = this

          window.addEventListener('resize', () => {
            self.resizeContainer();
          })

          document.addEventListener('mousedown', (event) => {
            if (event.target !== self.gameControls.canvas) {
              this.selectedTool = ''
              this.gameControls.selectedTool = ''
              return
            }
            event.preventDefault()
            if (event.button === 0) {
              const selected = self.gameControls.handleClick(event)
              if (selected) {
                this.selectedObject = selected
                this.selectedObject.isDragging = true;
              }
              document.addEventListener('mousemove', mouseMove)
            }
            return false;
          })

          const mouseMove = (event:MouseEvent) => {
            self.gameControls.handleMouseMove(event)
          }
          document.addEventListener('mouseup', (event) => {
            if (event.target === self.gameControls.canvas) {
              self.gameControls.handleMouseUp(event)
            }
            event.preventDefault()
            document.removeEventListener('mousemove', mouseMove)
            return false;
          })

          document.addEventListener('contextmenu', function(event) {
            if (event.target !== self.gameControls.canvas) {
              return
            }
            event.preventDefault();
            // Your custom logic here
            self.changeTool('')
            self.gameControls.handleRightClick();
            self.selectedObject = null;
          })

          document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
              self.pauseGame()
              this.$emit('pause', this.isPlaying)
            }
          })
        },
        changeTool(tool:string) {
          this.selectedTool = tool;
          this.gameControls.selectedTool = tool;
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
      :gameControls="gameControls" 
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