<script lang="ts">
import ObjectsMenu from './ObjectsMenu.vue'
import ParticleForm from './ParticleForm.vue'
import DragComponent from './DragComponent.vue'

import type { Config } from '../types'
import type Box from '@/utils/Box'
import type Circle from '@/utils/Circle'

export default {
  props: ['selectedTool', 'selectedObject', 'settings'],
  components: {
    ObjectsMenu, ParticleForm, DragComponent
  },
  data() {
    let particle: Circle|Box|undefined
    let config: Config|undefined
    const profiles: Array<Config> = []
    return {
      selectedProfile: 'Default',
      profiles: profiles,
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
    this.config = {...this.settings}
  },
  watch: {
    selectedObject: {
      handler(newVal) {
        this.particle = newVal
      },
      deep: true
    },
    settings: {
      handler(settings) {
        if (!this.settings) {
          this.config = {...settings}
        }
      }
    },
  },
  methods: {
    updateConfig() {
      const containerWidth = Number(this.config?.containerWidth);
      const containerHeight = Number(this.config?.containerHeight);
      this.$emit('update', {
        ...this.config,
        containerWidth,
        containerHeight
      })
    },
    updateParticle(particle:Circle|Box) {
      this.$emit('update-particle', particle)
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
      const profile = this.profiles.find((p: Config) => p.profileName == this.selectedProfile);
      if (profile) {
        this.config = profile;
      }
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
      this.profiles.push(newConfig)
      this.config = newConfig
      this.selectedProfile = newConfig.profileName || ''
      this.$emit('update', newConfig)

    },
    deleteConfig() {
      this.profiles = this.profiles.filter((p) => p.profileName !== this.selectedProfile)
      this.config = this.profiles[0];
      this.selectedProfile = this.config.profileName || ''
    },
    onDrag(position: any) {
      const next = this.panelWidth + position.x;
      if (next >= 300 && next <= 800) {
        this.panelWidth = next
        this.$emit('resize', next)
      }
    },
  }
}
</script>

<template>
  <div class="p-3" id="particle-controls" :style="{'width': panelWidth + 'px'}">
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
        <ObjectsMenu @select="selectTool" :selectedTool="selectedTool"/>
      </div>

    </div>

    <!--  Particle detail -->
    <div class="card p-2 pt-0" v-if="particle && particle.id">
      <h1 class="card-title">Particles settings</h1>
       <div class="card-body">
          <ParticleForm 
            :particleData="particle" 
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

</style>
