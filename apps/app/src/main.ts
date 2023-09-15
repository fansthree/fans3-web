import AppRoot from '@fans3/ui/src/shared/AppRoot.ethers'
import emitter from '@fans3/core/src/emitter'
import { routerPathroot } from '@fans3/ui/src/shared/router'
import { routes } from '~/router'
import { TailwindElement, html, customElement, state, when } from '@fans3/ui/src/shared/TailwindElement'
// Components
import '@fans3/ui/src/link'

@customElement('app-main')
export class AppMain extends TailwindElement('') {
  @state() inRoot = false

  chkView = () => {
    this.inRoot = routerPathroot() === '/'
  }

  connectedCallback() {
    super.connectedCallback()
    this.chkView()
    emitter.on('router-change', this.chkView)
  }
  disconnectedCallback() {
    super.disconnectedCallback()
    emitter.off('router-change', this.chkView)
  }

  render() {
    return html`
      <main class="app-main p-4">
        <slot></slot>
      </main>`
  }
}

AppRoot({ routes })
