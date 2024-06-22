import type { Config, ParticleProps } from "@/types"
import type Particle from "./Particle"

export const INITIAL_GAME_CONFIG = {
  profileName: 'Default',
  containerWidth: 300,
  containerHeight: 300,
  canvasMaxWidth: 500,
  canvasMaxHeight: 500,
  particles: []
}

export default class Settings {
  profiles = [INITIAL_GAME_CONFIG]
  selectedProfile: Config|undefined = INITIAL_GAME_CONFIG
  particleTypes: Array<Particle> = []

  deleteProfile(profileName:string) {
    this.profiles = this.profiles.filter((p) => p.profileName !== profileName)

    if (this.profiles.length == 0) {
      this.profiles = [INITIAL_GAME_CONFIG]
    }

    this.saveToLocalStorage()

  }

  getProfile (profileName:string) {
    return this.profiles.find((p) => p.profileName == profileName)
  }

  changeProfile (profileName:string) {
    this.selectedProfile = this.getProfile(profileName)
  }

  updateProfile(profileName:string, newSettings:Config) {
    const config = this.getProfile(profileName)
    if (!config) {
      return
    }
    Object.assign(config, newSettings);
    this.saveToLocalStorage()
  }

  saveToLocalStorage() {
    localStorage.setItem('partsim-config', JSON.stringify({
      profiles: this.profiles, selectedProfile: this.selectedProfile
    }))
  }

  loadSavedConfig() {
    try {
      const lsitem = localStorage.getItem('partsim-config')
      if (!lsitem) return
      const storeData = JSON.parse(lsitem)
      if (!storeData?.profiles) return
      
      this.profiles = storeData?.profiles

      if (storeData.selectedProfile) {
        this.changeProfile(storeData.selectedProfile)
      }
      
    } catch (error) {
      console.error('Error loading data:', error)
      return
    }
  }

  reloadConfig() {
    localStorage.removeItem('partsim-config')
  }

  saveParticle(particle:ParticleProps) {
    const particles = this.loadParticles()
    const particleData = {
      name: particle.name,
      type: particle.type,
      mass: particle.mass,
      friction: particle.friction,
      attractionForce: particle.attractionForce,
      collitionForce: particle.collitionForce,
      gravityForce: particle.gravityForce,
      radius: particle.radius,
      width: particle.width,
      height: particle.height,
      containerHeight: particle.containerHeight,
      containerWidth: particle.containerWidth,
      baseColor: particle.baseColor,
      color: particle.color,
      isCircle: particle.isCircle
    }

    const exists = particles.find((p:ParticleProps) => p.name === particle.name)
    if (!exists) {
      particles.push(particleData)
    } else {
      Object.assign(exists, particleData);
    }

    localStorage.setItem('partsim-particles', JSON.stringify(particles))
    this.loadParticles()
  }

  loadParticles() : Array<ParticleProps|any> {
    let particles = [];

    try {
      const savedParticles = localStorage.getItem('partsim-particles')
      if (!savedParticles) return []
      
      const storedParticles = JSON.parse(savedParticles)
      if (storedParticles && Array.isArray(storedParticles)) {
        particles = storedParticles
      }
    } catch (error) {
      console.log('error', error)
      return []
    }
    this.particleTypes = particles
    return particles

  }

  deleteParticle(particle:ParticleProps) {
    const particles = this.loadParticles().filter((p:ParticleProps) => p.name !== particle.name)
    localStorage.setItem('partsim-particles', JSON.stringify(particles))
    this.loadParticles()
  }
}