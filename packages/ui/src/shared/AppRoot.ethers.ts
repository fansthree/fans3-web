import AppRoot from './AppRoot'
import useBridge, { bridgeStore, StateController } from '@fans3/ethers/src/useBridge'
import { html, keyed } from './TailwindElement'
import type { RouteConfig } from '@lit-labs/router'

useBridge()

export default function ({ routes = <RouteConfig[]>[] } = {}) {
  class AppRootEthers extends AppRoot({ routes }) {
    bindBridge: any = new StateController(this, bridgeStore)
    override render() {
      return html`${keyed(bridgeStore.key, html`<app-main>${this._router.outlet()}</app-main>`)}`
    }
  }
  return AppRootEthers
}
