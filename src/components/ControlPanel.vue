<script lang="ts">
import ObjectsMenu from './ObjectsMenu.vue'
type Config = {
  particles?: any
  profileName?: string
  particleAmmount?: number
  containerWidth?: number
  canvasMaxWidth?: number
  containerHeight?: number
  canvasMaxHeight?: number
}

type Particle = {
  id?: number,
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
  props: ['gameControls', 'selectedTool', 'selectedObject'],
  components: {
    ObjectsMenu
  },
  data() {
    const particle: Particle = {};
    const config: Config = {}
    return {
      config: config,
      panelWidth: 600,
      isDragging: false,
      startX: 0,
      currentTab: 'profile',
      particle: particle
    }
  },
  mounted() {
    const self = this
    self.setPanelSize();
    
    
    // setTimeout(() => {
    //   // self.gameControls.start();
    // }, 500)

  },
  computed: {
    selectedProfile() {
      return this.gameControls?.selectedProfile || 'Default'
    },
    // config() {
    //   return this.gameControls?.profiles.find((profile:Config) => {
    //     return profile.profileName === this.selectedProfile
    //   })
    // },
    profiles() {
      return this.gameControls?.profiles || [];
    }
  },
  watch: {
    selectedObject: {
      handler(newVal) {
        this.particle = newVal
      },
      deep: true
    },
    gameControls: {
      handler(gameControls) {
        if (!gameControls) return;
        this.config = gameControls.config
      }
    },
    config: {
      handler(newVal) {
        if (!newVal.selectedProfile) {
          if (newVal !== this.config) {
            this.gameControls.saveConfig({ ...this.config, ...newVal })
          }
        }
      },
      deep: true
    }
  },
  methods: {
    updateConfig() {
      this.gameControls.saveConfig(this.config)
      this.gameControls.setCanvasSize()
    },
    updateParticle() {
      this.gameControls.setParticleProps({
        ...this.selectedObject,
        ...this.particle
      })
      // this.gameControls.saveConfig(this.config)
      // this.gameControls.setCanvasSize()
    },
    changeTab(tab:string) {
      this.currentTab = tab
    },
    selectTool(tool:string) {
      this.$emit('changeTool', tool)
    },
    setPanelSize() {
      // this.panelWidth = window.innerWidth - this.containerSize;
      let lsWidth:any = localStorage.getItem('partsim-panelWidth');
      if (!lsWidth || lsWidth === '') {
        lsWidth = document.getElementById('particle-controls')?.clientWidth;
      }
      this.panelWidth = parseInt(lsWidth)
      this.$emit('resize', this.panelWidth)
    },
    changeProfile() {
      if (this.selectedProfile === 'New') {
        return this.addProfile()
      }
      this.gameControls.changeProfile(this.selectedProfile)
      // this.selectedProfile = this.selectedProfile
      // this.profiles = this.gameControls.profiles;
      // this.config = this.gameControls.config;
    },
    addProfile() {
      const regex = /^New profile\s*\d*$/i;
      const same = this.profiles.filter((p:Config) => {
        return p.profileName && regex.test(p.profileName);
      });
      const sameCount = same.length > 0 ? ' ' + (same.length + 1) : ''
      const newConfig:Config = {
        ...this.config,
        profileName: 'New profile' + sameCount
      }
      // this.profiles.push(newConfig)
      this.gameControls.saveConfig(newConfig)
      // this.config = this.gameControls.config
      // this.selectedProfile = this.gameControls.selectedProfile
      // this.profiles = this.gameControls.profiles
    },
    deleteConfig() {
      this.gameControls.deleteConfig(this.selectedProfile)
      // this.profiles = this.gameControls.profiles
      // this.config = this.gameControls.config
      // this.selectedProfile = this.gameControls.selectedProfile
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
        this.gameControls.setCanvasSize();
        this.config = this.gameControls.config
        this.panelWidth = next;
        this.startX = event.clientX
      }
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
      <div class="p-2 pt-0">
        <div class="card p-2 pt-0">
          <h1 class="card-title">Settings</h1>
          
          <ul class="nav nav-tabs">
            <li class="nav-item">
              <a class="nav-link" 
                :class="{'active': currentTab === 'profile' }" 
                href="#"
                @click.prevent="changeTab('profile')">Profile</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" 
                href="#" 
                :class="{'active': currentTab === 'objects' }"
                @click.prevent="changeTab('objects')">Objects</a>
            </li>
          </ul>

          <!-- Particles profile config -->
          <div class="card-body" v-if="currentTab === 'profile'">
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
                    <option 
                      v-for="profile in profiles" 
                      :value="profile.profileName" 
                      :key="profile.profileName">
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
              <div v-if="config">
                <div class="row mb-3">
                  <label for="profileName" class="col-4 text-end">Profile name</label>
                  <div class="col-8">
                    <input
                      type="text"
                      class="form-control form-control-sm particle-controls"
                      v-model="config.profileName"
                      @change="updateConfig"
                    />
                  </div>
                </div>
                <div class="row mb-3">
                  <label for="containerWidth" class="col-4 text-end">Width</label>
                  <div class="col-5">
                    <input
                      type="range"
                      min="100"
                      :max="config.canvasMaxWidth"
                      class="form-range"
                      v-model="config.containerWidth"
                      @input="updateConfig"
                    />
                  </div>
                  <div class="col-3">
                    <input
                      type="number"
                      step="1"
                      min="100"
                      :max="config.canvasMaxWidth"
                      class="form-control form-control-sm particle-controls"
                      v-model="config.containerWidth"
                      @input="updateConfig"
                    />
                  </div>
                </div>
                <div class="row mb-3">
                  <label for="containerHeight" class="col-4 text-end">Height</label>
                  <div class="col-5">
                    <input
                      type="range"
                      min="100"
                      :max="config.canvasMaxHeight"
                      class="form-range"
                      v-model="config.containerHeight"
                      @input="updateConfig"
                    />
                  </div>
                  <div class="col-3">
                    <input
                      type="number"
                      step="1"
                      min="100"
                      :max="config.canvasMaxHeight"
                      class="form-control form-control-sm particle-controls"
                      v-model="config.containerHeight"
                      @input="updateConfig"
                    />
                  </div>
                </div>
              </div>

              <div v-if="particle && particle.id">
              
                <div class="row mb-3">
                  <label for="mass" class="col-4 text-end">Mass</label>
                  <div class="col-5">
                    <input type="range" class="form-range" @change="updateParticle" v-model="particle.mass" />
                  </div>
                  <div class="col-3">
                    <input
                      type="number"
                      step="0.01"
                      class="form-control form-control-sm particle-controls"
                      v-model="particle.mass"
                      @change="updateParticle"
                    />
                  </div>
                </div>
                <div class="row mb-3">
                  <label for="radius" class="col-4 text-end">Size</label>
                  <div class="col-5">
                    <input
                      type="range"
                      min="3"
                      max="50"
                      class="form-range"
                      @change="updateParticle"
                      v-model="particle.radius"
                    />
                  </div>
                  <div class="col-3">
                    <input
                      type="number"
                      step="1"
                      class="form-control form-control-sm particle-controls"
                      @change="updateParticle"
                      :value="particle.radius"
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
                      @change="updateParticle"
                      v-model="particle.attractionForce"
                    />
                  </div>
                  <div class="col-3">
                    <input
                      type="number"
                      step="0.010"
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
                      @change="updateParticle"
                      v-model="particle.gravityForce"
                    />
                  </div>
                  <div class="col-3">
                    <input
                      type="number"
                      step="0.0001"
                      class="form-control form-control-sm particle-controls"
                      @change="updateParticle"
                      v-model="particle.gravityForce"
                    />
                  </div>
                </div>
                <div class="row mb-3">
                  <label for="collitionForce" class="col-4 text-end">Collition</label>
                  <div class="col-5">
                    <input type="range" class="form-range" v-model="particle.collitionForce"  @change="updateParticle"/>
                  </div>
                  <div class="col-3">
                    <input
                      type="number"
                      step="0.001"
                      class="form-control form-control-sm particle-controls"
                      @change="updateParticle"
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
                      @change="updateParticle"
                      v-model="particle.friction"
                    />
                  </div>
                  <div class="col-3">
                    <input
                      type="number"
                      step="0.001"
                      class="form-control form-control-sm particle-controls"
                      @change="updateParticle"
                      v-model="particle.friction"
                    />
                  </div>
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

          <div class="card-body" v-if="currentTab === 'objects'">
            <ObjectsMenu @select="selectTool" :selectedTool="selectedTool"/>
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
  width: 4px;
  background-color: #ffe600;;
  cursor: e-resize;
}
</style>
