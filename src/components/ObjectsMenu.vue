
<script lang="ts">
import type { ParticleProps } from '@/types';
import Settings from '@/utils/Settings';
  export default {
    props: ['selectedTool'],
    data() {
      return {
        objectTypes: [
          {
            name: 'Circle',
            type: 'circle',
            color: 'red'
          },
          {
            name: 'Box',
            type: 'box',
            color: 'blue'
          },
        ]
      }
    },
    computed: {
      savedParticles() {
        return Settings.loadParticles() 
      }
    },
    mounted(){
    },
    methods: {
      selectItem(item: any) {
        this.$emit('select', item)
      },
      deleteParticle(particle: ParticleProps) {
        Settings.deleteParticle(particle) 
      }
    }
  }
</script>
<template>
  <div>
    <div class="list-group">
      <a href="#" 
        v-for="object in objectTypes"
        :key="object.type"
        class="list-group-item list-group-item-action" 
        :class="{'active' : selectedTool === object.type}"  
        :aria-current="selectedTool === object.type"
        @click="selectItem(object)">
        {{ object.type }}
      </a>
    </div>

    <h5 class="mt-3">Saved Particles</h5>

    <ul class="list-group saved-particles">
      <li class="list-group-item"
        :class="{active: particle.name === selectedTool?.name}"
        v-for="particle in savedParticles"
        :key="particle.type + particle.name"
      >
        <a href="#" @click.prevent="selectItem(particle)">
          {{ particle.type }} - {{ particle.name }}
        </a>

        <button
          type="button"
          class="btn btn-danger btn-sm float-end"
          @click="deleteParticle(particle)"
        >
          Delete
        </button>
        
      </li>
    </ul>
    <!-- <div class="box-min"></div> -->
  </div>
</template>
<style>
.list-group-item {
  text-transform: capitalize
}
</style>