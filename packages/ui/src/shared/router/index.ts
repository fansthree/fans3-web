// Router Guard for @lit-labs/router
import emitter from '@fans3/core/src/emitter'
import { Router } from '@lit-labs/router'
export { Router }

const bareOrigin = (url: string) => url.replace(location.origin, '')
const match = (url: any) => bareOrigin(encodeURIComponent(location.href)) === bareOrigin(url)

export const routerPathname = (path = location.href) => routerGuard.router.getPathname(path)
export const routerPathroot = (path?: string) => routerGuard.router.getPathroot(path)

export const scrollTop = (y = 0) => setTimeout(() => globalThis.scrollTo(0, y))

// Trick for @lit-labs/router
export const routerGuard = {
  router: <Router | any>undefined,
  injected: false,
  inject: () => {
    if (routerGuard.injected) return
    routerGuard.injected = true
    const { pushState, replaceState } = history
    const emitRouterChange = (url: any) => {
      setTimeout(() => {
        emitter.emit('router-change', url)
        scrollTop()
      })
    }
    // Hijack
    history.pushState = function (state, key, url) {
      pushState.apply(history, [state, key, url])
      emitRouterChange(url)
    }
    history.replaceState = function (state, key, url) {
      replaceState.apply(history, [state, key, url])
      emitRouterChange(url)
    }
    // Proto Listener
    globalThis.addEventListener('popstate', () => emitRouterChange(location.href))
    globalThis.addEventListener('pushstate', () => emitRouterChange(location.href))
    // Router Listener
    emitter.on('router-goto', (e: CustomEvent) => {
      setTimeout(() => routerGuard.goto(e.detail))
    })
    emitter.on('router-replace', (e: CustomEvent) => {
      setTimeout(() => routerGuard.replace(e.detail))
    })
  },
  goto: (path: string) => {
    if (match(path)) return
    history.pushState({}, '', routerGuard.router.path2href(path))
    routerGuard.router.goto(path)
  },
  replace: (path: string) => {
    if (match(path)) return
    history.replaceState({}, '', routerGuard.router.path2href(path))
    routerGuard.router.goto(path)
  },
  init: (_router: Router) => {
    return (routerGuard.router = _router)
  }
}

export const goto = routerGuard.goto
export const replace = routerGuard.replace
export default routerGuard
