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
  selectedProfile

  deleteProfile(profileName) {
    this.profiles = this.profiles.filter((p) => p.profileName !== profileName)

    this.saveToLocalStorage(this.profiles, 'Default')
    if (this.profiles.length == 0) {
      this.profiles = [INITIAL_GAME_CONFIG]
    }
  }

  getProfile (profileName) {
    return this.profiles.find((p) => p.profileName == profileName)
  }

  changeProfile (profileName) {
    let config = this.getProfile(profileName)
    if (!config) {
      return
    }
    this.selectedProfile = config
  }

  updateProfile(profileName, newSettings) {
    let config = this.getProfile(profileName)
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
      const lsitem = localStorage.getItem('partsim-config');
      const storeData = JSON.parse(lsitem);
      if (!storeData?.profiles) return false;
      
      this.profiles = storeData?.profiles
      if (this.profiles.length && storeData.selectedProfile) {
        this.changeProfile(storeData.selectedProfile)
      } else {
        this.reloadConfig()
      }
      if (!storeData) {
        return;
      }
    } catch (error) {
      console.error('Error loading data:', error)
      return
    }
  }

  reloadConfig() {
    localStorage.removeItem('partsim-config')
    this.game.applyConfig(INITIAL_GAME_CONFIG)
  }
}