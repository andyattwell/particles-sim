
export type Config = {
  particles?: any
  profileName?: string
  particleAmmount?: number
  containerWidth?: number
  canvasMaxWidth?: number
  containerHeight?: number
  canvasMaxHeight?: number
}
export type ParticleProps = {
  id?: number
  type: string
  mass?: number|string
  friction?: number|string
  attractionForce?: number|string
  collitionForce?: number|string
  gravityForce?: number|string
  radius?: number|string
  width?: number|string
  height?: number|string
  containerHeight?: number|string
  containerWidth?: number|string
  color?: 'string'
  isCircle?: boolean
  x?: number
  y?: number
  position?: {
    x: number
    y: number
  }
}

export type ParticleType = {
  id?: number,
  mass?: number
  friction?: number
  attractionForce?: number
  collitionForce?: number
  gravityForce?: number
  radius: number
  width: number
  height: number
  containerHeight: number
  containerWidth: number
  isDragging: boolean
  isClicked: Function
  deselect: Function
  applyForce: Function
  select: Function
  getBoundingBox: Function
  update: Function
  draw: Function
  setConfig: Function
  color?: 'string'
  isCircle: boolean
  x: number
  y: number
  position?: {
    x: number
    y: number
  }
}

export type Position = {
  x: number
  y: number
}