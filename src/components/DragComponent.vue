<template>
  <div class="slider" @mousedown="startDrag"></div>
</template>
<script lang="ts">
export default {
  data() {
    return {
      isDragging: false,
      startX: 0,
      startY: 0
    }
  },
  methods: {
    startDrag (event:any) {
      this.isDragging = true;
      this.startX = event.clientX;

      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },
    onDrag(event:any) {
      if (!this.isDragging) return;
      this.$emit('drag', {
        x: this.startX - event.clientX,
        y: this.startY - event.clientY
      })
      this.startX = event.clientX
      this.startY = event.clientY
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    }
  }
}
</script>
<style scoped>
.slider {
  display: block;
  content:"";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background-color: #ffe600;;
  cursor: e-resize;
}
</style>