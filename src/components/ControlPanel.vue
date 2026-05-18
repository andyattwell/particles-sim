<script lang="ts">
import ObjectsMenu from './ObjectsMenu.vue'
import ParticleForm from './ParticleForm.vue'
import DragComponent from './DragComponent.vue'
import type { Config, ParticleProps } from '../types'
import Settings, { INITIAL_GAME_CONFIG } from '@/utils/Settings';

export default {
  props: ['selectedTool', 'selectedObject', 'settings'],
  components: {
    ObjectsMenu, ParticleForm, DragComponent
  },
  data() {
    let particle: ParticleProps|undefined
    const config: Config = INITIAL_GAME_CONFIG;
    return {
      selectedProfile: 'Default',
      isDragging: false,
      startX: 0,
      currentTab: 'profile',
      particle: particle,
      config: config
    }
  },
  mounted() {
    const self = this
    // this.updateConfig()
    
    setTimeout(() => {
      self.setPanelSize();
    }, 1)

    
  },
  watch: {
    selectedObject: {
      handler(newVal) {
        this.particle = newVal
      },
    },
    settings: {
      handler(settings) {
        if (!this.settings) {
          this.config = {...settings}
        }
      }
    },
  },
  computed: {
    profiles() {
      return Settings.getProfiles();
    }
  },
  methods: {
    updateConfig() {
      const containerWidth = Number(this.config?.containerWidth);
      const containerHeight = Number(this.config?.containerHeight);
      const canvasMaxWidth = Number(containerWidth);
      const canvasMaxHeight = Number(containerHeight);
      const panelWidth = Number(this.config?.panelWidth);
      // console.log({...this.config})
      const settings = {
        ...this.config,
        containerWidth,
        containerHeight,
        canvasMaxWidth,
        canvasMaxHeight,
        panelWidth,
      }
      this.$emit('update', settings)
    },
    updateParticle(particle:ParticleProps) {
      this.$emit('update-particle', particle)
    },
    saveParticle(particle:ParticleProps) {
      this.$emit('save-particle', particle)
    },
    changeTab(tab:string) {
      this.currentTab = tab
    },
    selectTool(particle:ParticleProps) {
      this.$emit('changeTool', particle)
    },
    setPanelSize() {
      this.updateConfig()
      // this.$emit('resize', this.panelWidth)
    },
    changeProfile() {
      if (this.selectedProfile === 'New') {
        return this.addProfile()
      }
      const conf = Settings.getProfile(this.selectedProfile)
      this.$emit('update', conf)
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
      // this.config = newConfig
      this.selectedProfile = newConfig.profileName || ''
      this.$emit('update', newConfig)

    },
    deleteConfig() {
      // this.profiles = this.profiles.filter((p) => p.profileName !== this.selectedProfile)
      // this.config = this.profiles[0];
      // this.selectedProfile = this.config.profileName || ''
      this.$emit('deleteProfile', this.selectedProfile)
    },
    onDrag(position: any) {
      const next = this.config.panelWidth + position.x;
      if (next >= 300 && next <= 800) {
        this.config.panelWidth = next
        // this.$emit('resize', next)
        this.updateConfig()
      }
    },
  }
}
</script>

<template>
  <div class="p-3" id="particle-controls" :style="{'width': config.panelWidth + 'px'}">
    <!-- <div class="particle-controls-slider" @mousedown="startDrag"></div> -->
    <DragComponent @drag="onDrag"></DragComponent>
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
        <ObjectsMenu @select="selectTool" :selectedTool="selectedTool" :config="config"/>
      </div>

    </div>

    <!--  Particle detail -->
    <div class="card p-2 mt-3" v-if="particle">
      <h1 class="card-title">Particles settings</h1>
       <div class="card-body">
          <ParticleForm 
            :particleData="particle" 
            @update="updateParticle"
            @save="saveParticle"
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

</style>
