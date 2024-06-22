<script lang="ts">
import type { ParticleProps } from '@/types';


export default {
  props: ['particleData'],
  data() {
    const particle: ParticleProps = {};
    return {
      particle: particle
    }
  },
  mounted() {
    this.particle = {...this.particleData}
  },
  watch: {
    particleData(particle) {
      this.particle = {...particle}
    }
  },
  methods: {
    updateParticle() {
      this.$emit('update', {...this.particle})
      if (!this.particle.id) {
        this.$emit('save', this.particle)
      }
    },
    saveParticle() {
      this.$emit('save', this.particle)
    }
  }
}
</script>

<template>
  <div>
    <div class="row mb-3">
      <label for="mass" class="col-4 text-end">ID</label>
      <div class="col-5">
        <input 
          type="text" 
          class="form-control" 
          v-model="particle.id"
          disabled 
        />
      </div>
    </div>
    <div class="row mb-3">
      <label for="mass" class="col-4 text-end">Name</label>
      <div class="col-5">
        <input 
          type="text" 
          class="form-control" 
          @change="updateParticle"
          v-model="particle.name" 
        />
      </div>
    </div>

    <div class="row mb-3">
      <label for="mass" class="col-4 text-end">Mass</label>
      <div class="col-5">
        <input 
          type="range" 
          step="0.01"
          min="-0"
          max="5"
          class="form-range" 
          @input="updateParticle" 
          v-model="particle.mass" 
        />
      </div>
      <div class="col-3">
        <input
          type="number"
          step="0.01"
          min="-0"
          max="5"
          class="form-control form-control-sm particle-controls"
          v-model="particle.mass"
          @input="updateParticle"
        />
      </div>
    </div>

    <!-- Radius -->
    <div class="row mb-3" v-if="particle.isCircle">
      <label for="radius" class="col-4 text-end">Radius</label>
      <div class="col-5">
        <input
          type="range"
          min="3"
          max="80"
          class="form-range"
          @input="updateParticle"
          v-model="particle.radius"
        />
      </div>

      <div class="col-3">
        <input
          type="number"
          step="1"
          class="form-control form-control-sm particle-controls"
          @input="updateParticle"
          :value="particle.radius"
        />
      </div>
    </div>

    <!-- Width / Height -->
    <div class="row mb-3" v-if="!particle.isCircle">
      <label for="radius" class="col-4 text-end">Width</label>
      <div class="col-5">
        <input
          type="range"
          min="3"
          max="80"
          class="form-range"
          @input="updateParticle"
          v-model="particle.width"
        />
      </div>

      <div class="col-3">
        <input
          type="number"
          step="1"
          min="3"
          max="80"
          class="form-control form-control-sm particle-controls"
          @input="updateParticle"
          :value="particle.width"
        />
      </div>
    </div>

    <div class="row mb-3" v-if="!particle.isCircle">
      <label for="radius" class="col-4 text-end">Height</label>
      <div class="col-5">
        <input
          type="range"
          min="3"
          max="80"
          class="form-range"
          @input="updateParticle"
          v-model="particle.height"
        />
      </div>

      <div class="col-3">
        <input
          type="number"
          step="1"
          min="3"
          max="80"
          class="form-control form-control-sm particle-controls"
          @input="updateParticle"
          :value="particle.height"
        />
      </div>
    </div>

    <div class="row mb-3">
      <label for="attractionForce" class="col-4 text-end">Attraction</label>
      <div class="col-5">
        <input
          type="range"
          step="0.1"
          min="0"
          max="50"
          class="form-range"
          @input="updateParticle"
          v-model="particle.attractionForce"
        />
      </div>
      <div class="col-3">
        <input
          type="number"
          step="0.1"
          min="0"
          max="50"
          class="form-control form-control-sm particle-controls"
          @change="updateParticle"
          v-model="particle.attractionForce"
        />
      </div>
    </div>

    <div class="row mb-3">
      <label for="gravityForce" class="col-4 text-end">Gravity</label>
      <div class="col-5">
        <input
          type="range"
          min="-0.15"
          max="0.15"
          step="0.0001"
          class="form-range"
          @input="updateParticle"
          v-model="particle.gravityForce"
        />
      </div>
      <div class="col-3">
        <input
          type="number"
          step="0.0001"
          min="-0.15"
          max="0.15"
          class="form-control form-control-sm particle-controls"
          @input="updateParticle"
          v-model="particle.gravityForce"
        />
      </div>
    </div>

    <div class="row mb-3">
      <label for="collitionForce" class="col-4 text-end">Collition</label>
      <div class="col-5">
        <input 
          type="range" 
          class="form-range" 
          step="0.001"
          min="0"
          max="5"
          v-model="particle.collitionForce" 
          @input="updateParticle"
        />
      </div>
      <div class="col-3">
        <input
          type="number"
          step="0.001"
          min="0"
          max="2"
          class="form-control form-control-sm particle-controls"
          @input="updateParticle"
          v-model="particle.collitionForce"
        />
      </div>
    </div>

    <div class="row mb-3">
      <label for="friction" class="col-4 text-end">Friction</label>
      <div class="col-5">
        <input
          type="range"
          step="0.001"
          min="-1"
          max="1"
          class="form-range"
          @input="updateParticle"
          v-model="particle.friction"
        />
      </div>
      <div class="col-3">
        <input
          type="number"
          step="0.001"
          class="form-control form-control-sm particle-controls"
          @input="updateParticle"
          v-model="particle.friction"
        />
      </div>
    </div>

    
    <div class="row mb-3">
      <label for="friction" class="col-4 text-end">Color</label>
      <div class="col-5">
        <input
          type="text"
          class="form-control form-control-sm particle-controls"
          @change="updateParticle"
          v-model="particle.baseColor"
        />
      </div>
    </div>

    <div class="row justify-content-center align-items-center g-2">
      <div class="col">
        <a
          name=""
          id=""
          class="btn btn-primary"
          href="#"
          role="button"
          @click.prevent="saveParticle"
          >Save</a
        >
      </div>
    </div>
    
  </div>
</template>