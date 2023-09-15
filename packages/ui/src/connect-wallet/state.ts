import { customElement, TailwindElement, html, property, when, unsafeHTML } from '../shared/TailwindElement'
import { bridgeStore, StateController } from '@fans3/ethers/src/useBridge'
import { WalletState } from '@fans3/ethers/src/wallet'
import '../button'

import style from './state.css?inline'

@customElement('connect-wallet-state')
export class ConnectWalletState extends TailwindElement(style) {
  bindBridge: any = new StateController(this, bridgeStore)
  @property() opts: any = {}

  get bridge() {
    return bridgeStore.bridge
  }
  get notInstalled() {
    return this.bridge.state === WalletState.NOT_INSTALLED
  }
  get icons() {
    const [
      success = '<i class="mdi mdi-check"></i>',
      failed = '<i class="mdi mdi-close"></i>',
      wait = '<i class="mdi mdi-loading"></i>'
    ] = this.opts.icons ?? []
    return { success, failed, wait }
  }
  get state() {
    let [icon, css] = ['', '']
    switch (this.bridge.state) {
      case WalletState.CONNECTING:
      case WalletState.INSTALLING:
        icon = this.icons.wait
        css = 'wait'
        break
      case WalletState.CONNECTED:
        icon = this.icons.success
        css = 'success'
        break
      case WalletState.DISCONNECTED:
        icon = this.icons.failed
        css = 'failed'
        break
      case WalletState.NOT_INSTALLED:
        icon = this.icons.failed
        css = 'failed'
        break
    }
    return { icon, css }
  }

  override render() {
    return html`<span class="connect-wallet-state ${this.state.css}">
      ${when(
        this.notInstalled,
        () =>
          html`<ui-button
            class="mt-4"
            @click=${() => this.bridge.install()}
            class="install uri connect-wallet-state-text"
            >${this.bridge.wallet.installText}</ui-button
          >`,
        () => html`
          <span class="connect-wallet-icon mr-2 text-xl">${unsafeHTML(this.state.icon)}</span>
          <span class="connect-wallet-state-text">${bridgeStore.stateTitle}</span>
        `
      )}
    </span>`
  }
}
