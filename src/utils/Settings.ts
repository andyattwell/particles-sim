import type { Config, ParticleProps } from "@/types"
import type Particle from "./Particle"
// import type Game from "./Game"

export const INITIAL_GAME_CONFIG = {
  profileName: 'Default',
  containerWidth: 300,
  containerHeight: 300,
  canvasMaxWidth: 500,
  canvasMaxHeight: 500,
  panelWidth: 300,
  particles: []
}

export default class Settings {
  profiles:Array<Config> = []
  selectedProfile: string = ''
  particleTypes: Array<Particle> = []

  constructor() {
    const { profiles, selectedProfile } = Settings.loadSavedConfig()
    this.profiles = profiles
    this.selectedProfile = selectedProfile
  }

  static getProfiles () {
    return Settings.loadSavedConfig().profiles
  }

  static getProfile (profileName:string) {
    const { profiles } = Settings.loadSavedConfig()
    return profiles?.find((p) => p.profileName == profileName)
  }

  static deleteProfile(profileName:string) {
    let profiles  = Settings.loadSavedConfig().profiles
      .filter((p) => p.profileName !== profileName)

    if (profiles.length == 0) {
      profiles = [INITIAL_GAME_CONFIG]
    }

    this.saveToLocalStorage(profiles, "default")

  }

  changeProfile (profileName:string) {
    this.selectedProfile = profileName
  }

  static updateProfile(profileName:string, newSettings:Config, particles:Array<ParticleProps> = []) {
    
    let data = Settings.loadSavedConfig().profiles;
    const config = data.find((p) => p.profileName == profileName);

    if (!config) {
      data.push(newSettings) 
      this.saveToLocalStorage(data, profileName)
      return
    }
    const parts:Array<ParticleProps> = []
    if (particles && particles.length > 0) {
      particles.forEach((particle:ParticleProps) => {
        parts.push({
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
          isCircle: particle.isCircle,
          x: particle.x,
          y: particle.y,
          position: {
            x: particle.x || 0,
            y: particle.y || 0
          }
        })
      })
    }
    newSettings.particles = parts
    data = data.map((p) => {
      if (p.profileName === profileName) {
        return newSettings
      }
      return p
    })
    console.log(profileName, {data, newSettings})
    this.saveToLocalStorage(data, profileName)
  }

  static saveToLocalStorage(profiles:Array<Config>, selectedProfile:string) {
    localStorage.setItem('partsim-config', JSON.stringify({
      profiles: profiles, selectedProfile: selectedProfile
    }))
  }

  static loadSavedConfig() {

    let profiles: Array<Config> = [];
    let selectedProfile:string = 'Default';

    try {
      const lsitem = localStorage.getItem('partsim-config')
      const storeData = lsitem ? JSON.parse(lsitem) : {}
      profiles = storeData.profiles
      selectedProfile = storeData.selectedProfile
    } catch (error) {
      console.error('Error loading data:', error)
    }

    return {
      profiles, selectedProfile
    }
  }

  static reloadConfig() {
    localStorage.removeItem('partsim-config')
  }

  static saveParticle(particle:ParticleProps) {
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
      isCircle: particle.isCircle,
      x: particle.x,
      y: particle.y
    }

    const exists = particles.find((p:ParticleProps) => p.name === particle.name)
    if (!exists) {
      particles.push(particleData)
    } else {
      Object.assign(exists, particleData);
    }

    localStorage.setItem('partsim-particles', JSON.stringify(particles))
    return this.loadParticles()
  }

  static loadParticles() : Array<ParticleProps|any> {
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
    return particles
  }

  static deleteParticle(particle:ParticleProps) {
    const particles = this.loadParticles().filter((p:ParticleProps) => p.name !== particle.name)
    localStorage.setItem('partsim-particles', JSON.stringify(particles))
    this.loadParticles()
  }
}