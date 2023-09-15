// Polyfills
import 'urlpattern-polyfill' // Safari 15
import '@webcomponents/webcomponentsjs/webcomponents-loader.js'
import 'lit/polyfill-support.js'
//
import { TailwindElement, html, customElement } from './TailwindElement'
import type { RouteConfig } from '@lit-labs/router'
import { fallbackRender, fallbackEnter } from './router/fallback'
import { Router, routerGuard } from './router'
import emitter from '@fans3/core/src/emitter'
import { debounce } from '@fans3/ethers/src/utils'

import '~/variables-override.css' // -> /apps/*/src/variables-override.css
import '../c/g.css'

export default function ({ routes = <RouteConfig[]>[], hashMode = false } = {}) {
  routerGuard.inject()
  // App Root
  @customElement('app-root')
  class AppRoot extends TailwindElement('') {
    _router: any = routerGuard.init(
      new Router(this, routes, {
        hashMode,
        fallback: {
          render: fallbackRender,
          enter: async (params) => await fallbackEnter(this._router, params)
        }
      })
    )

    // Trick for @lit-app/state
    forceUpdate = debounce(() => this.requestUpdate(), 100)
    constructor() {
      super()
      emitter.on('force-request-update', () => this.forceUpdate())
    }

    connectedCallback() {
      super.connectedCallback()
    }

    render() {
      return html`<app-main>${this._router.outlet()}</app-main>`
    }
  }
  return AppRoot
}
