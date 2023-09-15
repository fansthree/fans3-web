// Global Event Emitter

export type EventEmitter = {
  on: Function
  off: Function
  once: Function
  emit: Function
}

const eventTarget = new EventTarget()

const emitter: EventEmitter = {
  on: (type: string, listener: EventListener, options = {}) => {
    eventTarget.addEventListener(type, listener, options)
    return () => eventTarget.removeEventListener(type, listener)
  },
  off: (type: string, listener: EventListener) => {
    eventTarget.removeEventListener(type, listener)
  },
  once: (type: string, listener: EventListener, options = {}) => {
    eventTarget.addEventListener(type, listener, { ...options, once: true })
    return () => eventTarget.removeEventListener(type, listener)
  },
  emit: <T>(type: string, detail?: T, options = {}) => {
    eventTarget.dispatchEvent(new CustomEvent(type, { detail, ...options }))
  }
}

export const emitErr = (err: any) => {
  if (err.code === 4001) return
  emitter.emit('error', err)
}

export default emitter
