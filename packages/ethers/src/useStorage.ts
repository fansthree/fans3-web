import { getEnvKey } from './useBridge'

const now = () => new Date().getTime()
export const useStorage = async (name: string, { store = localStorage, withoutEnv = false, ttl = 0 } = {}) => {
  const withExpire = ttl > 0
  let saved = null
  const get = async () => {
    const itemKey = await getEnvKey(name, withoutEnv)
    saved = store.getItem(itemKey)
    if (saved) {
      saved = JSON.parse(saved)
      //
      if (withExpire) {
        const { ex, data } = saved
        if (now > ex) {
          remove()
          return null
        }
        return data
      }
    }
    return saved
  }
  const set = async (data: unknown, { merge = false } = {}) => {
    const key = await getEnvKey(name, withoutEnv)
    if (merge) data = Object.assign((await get()) ?? {}, data)
    const val = withExpire ? { data, ex: now() + ttl } : data
    store.setItem(key, JSON.stringify(val))
  }
  const remove = async () => store.removeItem(await getEnvKey(name, withoutEnv))
  let listener: EventListener
  return {
    get,
    set,
    remove,
    on: (fn: EventListener) => {
      if (listener != fn) listener = fn
      window.addEventListener('storage', listener)
    },
    off: () => {
      if (listener) window.removeEventListener('storage', listener)
    }
  }
}
