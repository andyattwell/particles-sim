<script lang="ts">

  export default {
    props: ['started'],
    methods: {
      start() {
        this.$emit('start');
      },
      restart() {
        this.$emit('start', { restart: true });
      }
    }
  }
</script>

<template>
  <div class="start-menu-container">
    <div id="start-menu">
      <div class="card">
        <div class="card-body">
          <h4 class="card-title text-center">Start Menu</h4>
          <div class="list-group">
            <a href="#" @click="start" class="list-group-item list-group-item-action active text-center">
              {{ started ? 'Continue' : 'Start' }}
            </a>
            <a href="#" @click="restart" class="list-group-item list-group-item-action text-center">
              Restart
            </a>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
  .start-menu-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255,255,255, 0.8);
    z-index: 100;
  }
  #start-menu {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>