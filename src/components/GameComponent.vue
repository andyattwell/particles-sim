<script lang="ts">
  import Game from '../utils/Game'
  import ControlPanel from './ControlPanel.vue'
  import type { Config, ParticleProps } from '../types'
  import Settings, { INITIAL_GAME_CONFIG } from '@/utils/Settings'
  import type Particle from '@/utils/Particle'

  export default {
    components: {
      ControlPanel
    },
    data() {
      const profiles: Array<Config> = []
      const settingsController = new Settings()
      let settings: Config = INITIAL_GAME_CONFIG;
      let selectedObject: Particle|undefined;
      let selectedTool: ParticleProps|undefined;
      return {
        containerSize: 500,
        game: new Game('game-canvas'),
        selectedTool: selectedTool,
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
        profiles: profiles,
        settings: settings,
        selectedProfile: 'Default',
        settingsController
      }
    },
    mounted() {
      this.startGame()
      this.addListeners()
      
    },
    methods: {
      startGame() {
        const settings = Settings.getProfile(this.selectedProfile)
        if (settings) {
          this.settings = settings
        }
        setTimeout(() => {
          this.game.start(settings)
        }, 200)
      },
      pauseGame() {
        this.isPlaying = this.game.pause()
      },
      updateConfig(config:Config) {
        this.game.applyConfig(config)
        this.resizeContainer(config.panelWidth);
        Settings.updateProfile(config.profileName, config, this.game.particles)
      },
      updateParticle(particle:ParticleProps) {
        this.game.setParticleProps(particle)
      },
      resizeContainer(panelWidth:number|undefined) {
        this.containerSize = window.innerWidth - (panelWidth || 0)
        this.game.setCanvasSize(this.containerSize)
      },
      addListeners() {
        const self = this

        window.addEventListener('resize', () => {
          // self.resizeContainer();
          self.game.setCanvasSize(this.containerSize)
        })

        document.addEventListener('mousedown', (event) => {
          if (event.target !== self.game.canvas) {
            this.selectedTool = undefined
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
          self.changeTool(undefined)
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
          (p:Particle) => p.isClicked(inBounds)
        )

        if (particle) {
          this.mouse.startX = inBounds.x
          this.mouse.startY = inBounds.y
          this.mouse.isMouseDown = true

          if (this.selectedObject && this.selectedObject.deselect) {
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
        }
        this.selectedObject = undefined
        this.selectedTool = undefined
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
      changeTool(tool:ParticleProps|undefined) {
        this.selectedTool = tool
        this.selectedObject = tool
      },
      saveParticle(particle:ParticleProps) {
        this.$emit('save-particle', particle)
        Settings.saveParticle(particle)
      },
      changeProfile(profileName:string) {
        // this.settingsController.changeProfile(profileName)
        const profile = Settings.getProfile(profileName)
        if (profile) {
          this.settings = profile
          this.game.config = this.settings
        }
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
      @saveParticle="saveParticle"
      @changeProfile="changeProfile"
      :selectedTool="selectedTool"
      :selectedObject="selectedObject"
      @changeTool="changeTool"
      :settings="settings"
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