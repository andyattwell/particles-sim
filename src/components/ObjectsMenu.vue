
<script lang="ts">
  export default {
    props: ['selectedTool'],
    data() {
      return {}
    },
    methods: {
      selectItem(item: string) {
        this.$emit('select', item)
      }
    }
  }
</script>
<template>
  <div>
    <div class="list-group">
      <a href="#" 
        class="list-group-item list-group-item-action" 
        :class="{'active' : selectedTool === 'particle'}"  
        :aria-current="selectedTool === 'particle'"
        @click="selectItem('particle')">
        Particle
      </a>
      <a href="#" class="list-group-item list-group-item-action" 
        :class="{'active' : selectedTool === 'box'}"  
        :aria-current="selectedTool === 'box'"
        @click="selectItem('box')">Box</a>
    </div>

    <!-- <div class="box-min"></div> -->
  </div>
</template>
<style>

</style>