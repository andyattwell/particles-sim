import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import ControlPanel from '../GameComponent.vue'

describe('GameComponent', () => {
  it('renders properly', () => {
    const wrapper = mount(ControlPanel)
    console.log({wrapper})
    expect(wrapper.text()).toContain('Settings')
  })
})
