<script lang="ts">

type Particle = {
  id?: number,
  isCircle?: boolean,
  mass?: number
  friction?: number
  attractionForce?: number
  collitionForce?: number
  gravityForce?: number
  radius?: number
  width?: number
  height?: number
}

export default {
  props: ['particleData'],
  data() {
    const particle: Particle = {};
    return {
      particle: particle
    }
  },
  mounted() {
    this.particle = {
      id: this.particleData.id,
      isCircle: this.particleData.isCircle,
      mass: this.particleData.mass,
      friction: this.particleData.friction,
      attractionForce: this.particleData.attractionForce,
      collitionForce: this.particleData.collitionForce,
      gravityForce: this.particleData.gravityForce,
      radius: this.particleData.radius,
      width: this.particleData.width,
      height: this.particleData.height,
    }
  },
  watch: {
    particleData(particle) {
      this.particle = {
        id: particle.id,
        isCircle: particle.isCircle,
        mass: particle.mass,
        friction: particle.friction,
        attractionForce: particle.attractionForce,
        collitionForce: particle.collitionForce,
        gravityForce: particle.gravityForce,
        radius: particle.radius,
        width: particle.width,
        height: particle.height,
      }
    }
  },
  methods: {
    updateParticle() {
      this.$emit('update', {...this.particle})
    },
  }
}
</script>

<template>
  <div>
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
  </div>
</template>