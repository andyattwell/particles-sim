<script lang="ts">
  import Game from './components/GameComponent.vue'
  import StartMenu from './components/StartMenuComponent.vue'

  export default {
    components: {
      Game, StartMenu
    },
    data() {
      return {
        paused: true,
        started: false,
      }
    },
    mounted() {
      document.querySelector('html')?.setAttribute('data-bs-theme', 'dark')
    },
    methods: {
      startGame(payload) {
        this.started = true
        this.paused = false

        if (payload?.restart) {
          return this.$refs.game?.startGame();
        }

        if (this.$refs.game) {
          this.$refs.game.pauseGame()
        }
      },
      pauseGame(isPlaying) {
        this.paused = !isPlaying
      }
    }
  }
</script>

<template>
  <div>
    <StartMenu v-if="paused" @start="startGame" :started="started"></StartMenu>
    <Game ref="game" v-if="started" @pause="pauseGame"></Game>
  </div>
</template>
