<script lang="ts">
import { GameControl, INITIAL_CONFIG } from '../utils/GameControl.js'

type Config = {
  profileName: string
  particleSize: number
  particleAmmount: number
  particleMass: number
  particleFriction: number
  attractionForce: number
  collitionForce: number
  gravityForce: number
  canvasWidth: number
  canvasMaxWidth?: number
  canvasHeight: number
  canvasMaxHeight?: number
}

const gameControls = new GameControl();

export default {
  // props: ['containerSize'],
  data() {
    const config: Config = INITIAL_CONFIG
    return {
      config: config,
      profiles: [] as Config[],
      selectedProfile: 'Default',
      gameControls: null,
      panelWidth: 600,
      isDragging: false,
      startX: 0,
    }
  },
  mounted() {
    const self = this
    self.setPanelSize();
    
    setTimeout(() => {
      self.selectedProfile = gameControls.selectedProfile
      self.profiles = gameControls.profiles
      self.config = gameControls.config
      gameControls.start();

    }, 500)


    window.addEventListener('resize', () => {
      gameControls.setCanvasSize();
      self.config = gameControls.config
    })

  },
  watch: {
    config: {
      handler(newVal) {
        if (!newVal.selectedProfile) {
          gameControls.saveConfig({ ...this.config, ...newVal })
        }
      },
      deep: true
    }
  },
  methods: {
    setPanelSize() {
      // this.panelWidth = window.innerWidth - this.containerSize;
      const lsWidth = localStorage.getItem('partsim-panelWidth');
      if (lsWidth) {
        this.panelWidth = parseInt(lsWidth)
        this.$emit('resize', this.panelWidth)
      }
    },
    changeProfile() {
      if (this.selectedProfile === 'New') {
        return this.addProfile()
      }
      gameControls.changeProfile(this.selectedProfile)
      // this.selectedProfile = this.selectedProfile
      this.profiles = gameControls.profiles;
      this.config = gameControls.config;
    },
    addProfile() {
      const regex = /^New profile\s*\d*$/i;
      const same = this.profiles.filter((p) => {
        return regex.test(p.profileName);
      });
      const sameCount = same.length > 0 ? ' ' + (same.length + 1) : ''
      const newConfig:Config = {
        ...INITIAL_CONFIG,
        profileName: 'New profile' + sameCount
      }
      // this.profiles.push(newConfig)
      gameControls.saveConfig(newConfig)
      this.config = gameControls.config
      this.selectedProfile = gameControls.selectedProfile
      this.profiles = gameControls.profiles
    },
    deleteConfig() {
      gameControls.deleteConfig(this.selectedProfile)
      this.profiles = gameControls.profiles
      this.config = gameControls.config
      this.selectedProfile = gameControls.selectedProfile
    },
    startDrag (event:any) {
      this.isDragging = true;
      this.startX = event.clientX;

      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },
    onDrag(event:any) {
      if (!this.isDragging) return;
      const next = this.panelWidth + this.startX - event.clientX;
      if (next >= 300 && next <= 800) {
        this.$emit('resize', next)
        gameControls.setCanvasSize();
        this.config = gameControls.config
        this.panelWidth = next;
        this.startX = event.clientX
      }
      // this.config.canvasWidth += this.startX - event.clientX
    },
    stopDrag() {
      this.isDragging = false;
      localStorage.setItem('partsim-panelWidth', this.panelWidth.toString());
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    }
  }
}
</script>

<template>
  <div id="particle-controls" :style="{'width': panelWidth + 'px'}">
    <div class="particle-controls-slider" @mousedown="startDrag"></div>
    <div class="">
      <div class="p-2">
        <div class="card p-2">
          <h1 class="card-title">Settings</h1>
          <div class="card-body">
            <form>
              <div class="row mb-3">
                <label for="selectedProfile" class="col-4 text-end">Profile</label>
                <div class="col-5">
                  <select
                    name="selectedProfile"
                    class="form-control form-control-sm particle-controls"
                    @change="changeProfile"
                    v-model="selectedProfile"
                  >
                    <option :value="profile.profileName" v-for="profile in profiles">
                      {{ profile.profileName }}
                    </option>
                    <option value="New">Create profile</option>
                  </select>
                </div>
                <div class="col-3 btn-group btn-group-sm" role="group">
                  <button class="btn btn-sm btn-primary" title="Add new profile" @click.prevent="addProfile">
                    +
                  </button>
                  <button class="btn btn-sm btn-secondary" title="Delete profile" @click.prevent="deleteConfig">
                    -
                  </button>
                </div>
              </div>
              <div class="row mb-3">
                <label for="profileName" class="col-4 text-end">Profile name</label>
                <div class="col-8">
                  <input
                    type="text"
                    class="form-control form-control-sm particle-controls"
                    v-model="config.profileName"
                  />
                </div>
              </div>
              <div class="row mb-3">
                <label for="canvasWidth" class="col-4 text-end">Width</label>
                <div class="col-5">
                  <input
                    type="range"
                    min="100"
                    :max="config.canvasMaxWidth"
                    class="form-range"
                    v-model="config.canvasWidth"
                  />
                </div>
                <div class="col-3">
                  <input
                    type="number"
                    step="1"
                    min="100"
                    :max="config.canvasMaxWidth"
                    class="form-control form-control-sm particle-controls"
                    v-model="config.canvasWidth"
                  />
                </div>
              </div>
              <div class="row mb-3">
                <label for="canvasHeight" class="col-4 text-end">Height</label>
                <div class="col-5">
                  <input
                    type="range"
                    min="100"
                    :max="config.canvasMaxHeight"
                    class="form-range"
                    v-model="config.canvasHeight"
                  />
                </div>
                <div class="col-3">
                  <input
                    type="number"
                    step="1"
                    min="100"
                    :max="config.canvasMaxHeight"
                    class="form-control form-control-sm particle-controls"
                    v-model="config.canvasHeight"
                  />
                </div>
              </div>
              <div class="row mb-3">
                <label for="particleAmmount" class="col-4 text-end">Particles</label>
                <div class="col-5">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    class="form-range"
                    v-model="config.particleAmmount"
                  />
                </div>
                <div class="col-3">
                  <input
                    type="number"
                    step="1"
                    class="form-control form-control-sm particle-controls"
                    v-model="config.particleAmmount"
                  />
                </div>
              </div>
              <div class="row mb-3">
                <label for="particleMass" class="col-4 text-end">Mass</label>
                <div class="col-5">
                  <input type="range" class="form-range" v-model="config.particleMass" />
                </div>
                <div class="col-3">
                  <input
                    type="number"
                    step="0.01"
                    class="form-control form-control-sm particle-controls"
                    v-model="config.particleMass"
                  />
                </div>
              </div>
              <div class="row mb-3">
                <label for="particleSize" class="col-4 text-end">Size</label>
                <div class="col-5">
                  <input
                    type="range"
                    min="3"
                    max="50"
                    class="form-range"
                    v-model="config.particleSize"
                  />
                </div>
                <div class="col-3">
                  <input
                    type="number"
                    step="0.001"
                    class="form-control form-control-sm particle-controls"
                    v-model="config.particleSize"
                  />
                </div>
              </div>
              <div class="row mb-3">
                <label for="attractionForce" class="col-4 text-end">Attraction</label>
                <div class="col-5">
                  <input
                    type="range"
                    step="0.010"
                    min="-100"
                    max="100"
                    class="form-range"
                    v-model="config.attractionForce"
                  />
                </div>
                <div class="col-3">
                  <input
                    type="number"
                    step="0.010"
                    class="form-control form-control-sm particle-controls"
                    v-model="config.attractionForce"
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
                    v-model="config.gravityForce"
                  />
                </div>
                <div class="col-3">
                  <input
                    type="number"
                    step="0.0001"
                    class="form-control form-control-sm particle-controls"
                    v-model="config.gravityForce"
                  />
                </div>
              </div>
              <div class="row mb-3">
                <label for="collitionForce" class="col-4 text-end">Collition</label>
                <div class="col-5">
                  <input type="range" class="form-range" v-model="config.collitionForce" />
                </div>
                <div class="col-3">
                  <input
                    type="number"
                    step="0.001"
                    class="form-control form-control-sm particle-controls"
                    v-model="config.collitionForce"
                  />
                </div>
              </div>
              <div class="row mb-3">
                <label for="particleFriction" class="col-4 text-end">Friction</label>
                <div class="col-5">
                  <input
                    type="range"
                    step="0.001"
                    min="-1"
                    max="1"
                    class="form-range"
                    v-model="config.particleFriction"
                  />
                </div>
                <div class="col-3">
                  <input
                    type="number"
                    step="0.001"
                    class="form-control form-control-sm particle-controls"
                    v-model="config.particleFriction"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <!-- <button class="btn btn-primary me-2" @click.prevent="addProfile">Add</button> -->
                  <!-- <button class="btn btn-danger" @click.prevent="deleteConfig">Delete</button> -->
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

#particle-controls {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  background-color: #000;
  /* border-left: 2px solid #ffe600; */
  padding-top: 10px;
  overflow-y: scroll;
}

.particle-controls-slider {
  display: block;
  content:"";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 2px;
  background-color: #ffe600;;
  cursor: e-resize;
}
</style>
