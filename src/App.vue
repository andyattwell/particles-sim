<script lang="ts">
import ControlPanel from './components/ControlPanel.vue'

export default {
  components: {
    ControlPanel
  },
  data() {
    return {
      containerSize: 500
    }
  },
  mounted() {
    document.querySelector('html')?.setAttribute('data-bs-theme', 'dark')
    this.resizeContainer(600)
  },
  methods: {
    resizeContainer(diff:number) {
      this.containerSize = window.innerWidth - diff
    }
  }
}
</script>

<template>
  <div>
    <div ref="container" id="canvas-container" :style="{ width: containerSize + 'px'}">
      <canvas id="game-canvas"></canvas>
    </div>
    <ControlPanel @resize="resizeContainer" :containerSize="containerSize"/>
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
body {
    margin: 0;
    background-color: #181818;
}
#canvas-container {
  /* height: 100%; */
  top: 0;
  left: 0;
  position: absolute;
  /* display: flex;
  justify-content: center; */
  /* align-items: center; */
  height: 100vh;
}

canvas {
    position: relative;
    border: 3px solid #ffffff;
}

</style>
