import { State, property, StateController } from '@lit-app/state'
import emitter from './emitter'

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export const match = (v: number) => window.matchMedia(`(max-width: ${v}px)`).matches

type Screen = {
  isMobi: boolean
  md: boolean
  ratio: number
  ts: number
  interacted: boolean
}
export const screen: Screen = {
  isMobi: match(breakpoints.lg),
  md: match(breakpoints.md),
  ratio: window.devicePixelRatio ?? 2,
  ts: 1,
  interacted: false
}

class ScreenStore extends State {
  @property({ value: screen, type: Object }) screen!: Screen
  constructor() {
    super()
    const ro = new ResizeObserver(() => {
      this.screen.ts++
      this.screen.isMobi = match(breakpoints.lg)
      this.screen.md = match(breakpoints.md)
      emitter.emit('force-request-update')
    })
    ro.observe(document.documentElement)
  }
  get isMobi() {
    return this.screen.isMobi
  }
  get md() {
    return this.screen.md && this.screen.ts
  }
}
export const screenStore = new ScreenStore()

window.addEventListener('resize', () => (screen.ratio = window.devicePixelRatio), { passive: true })

export const setInteracted = () => {
  screen.interacted = true
  window.removeEventListener('keydown', setInteracted)
  window.removeEventListener('click', setInteracted)
}
window.addEventListener('keydown', setInteracted, { once: true })
window.addEventListener('click', setInteracted, { once: true })

export default screen
