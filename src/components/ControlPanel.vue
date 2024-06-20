<script lang="ts">
import ObjectsMenu from './ObjectsMenu.vue'
import ParticleForm from './ParticleForm.vue'
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
    ObjectsMenu, ParticleForm
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
    updateParticle(particle:Particle) {
      this.gameControls.setParticleProps(particle)
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
  <div class="p-3" id="particle-controls" :style="{'width': panelWidth + 'px'}">
    <div class="particle-controls-slider" @mousedown="startDrag"></div>
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

      <div class="card-body" v-if="currentTab === 'profile'">
        <!--  Profiles selector -->
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

        <!--  Global settings -->
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
      </div>

      <div class="card-body" v-if="currentTab === 'objects'">
        <ObjectsMenu @select="selectTool" :selectedTool="selectedTool"/>
      </div>

    </div>

    <!--  Particle detail -->
    <div class="card p-2 pt-0" v-if="particle && particle.id">
      <h1 class="card-title">Particles settings</h1>
       <div class="card-body">
          <ParticleForm 
            :particleData="particle" 
            :gameControls="gameControls"
            @update="updateParticle"
          ></ParticleForm>
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
