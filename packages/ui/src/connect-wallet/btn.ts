import { customElement, TailwindElement, html, state, when, property, classMap } from '../shared/TailwindElement'
import { bridgeStore, StateController } from '@fans3/ethers/src/useBridge'
import emitter from '@fans3/core/src/emitter'
import { WalletState } from '@fans3/ethers/src/wallet'
// Components
import '../address'
import '../button'

import style from './btn.css?inline'

@customElement('connect-wallet-btn')
export class ConnectWalletBtn extends TailwindElement(style) {
  bindBridge: any = new StateController(this, bridgeStore)
  @property({ type: Boolean }) dropable = false

  @state() dialog = false
  @state() pending = false

  get account() {
    return bridgeStore.account
  }
  get addr() {
    return bridgeStore.bridge?.shortAccount
  }
  get scan() {
    return `${bridgeStore.bridge?.network.current.scan}/address/${bridgeStore.bridge?.account}`
  }
  get connecting() {
    return [WalletState.CONNECTING, WalletState.INSTALLING].includes(bridgeStore.bridge.state)
  }

  show = () => {
    if (this.dropable && this.account) {
    } else {
      this.connect()
    }
  }
  close() {
    this.pending = false
  }
  async connect() {
    this.pending = true
    try {
      await bridgeStore.bridge.select(0)
    } catch {
      this.close()
    }
    if (bridgeStore.bridge.isConnected) {
      this.close() // Auto close
      emitter.emit('wallet-connected')
    }
  }

  connectedCallback(): void {
    super.connectedCallback()
    emitter.on('connect-wallet', this.show)
  }
  disconnectedCallback(): void {
    super.disconnectedCallback()
    emitter.off('connect-wallet', this.show)
  }

  render() {
    // Connected
    if (this.account) return html`<ui-address slot="button" avatar short></ui-address>`
    // Not connected
    else
      return html`<ui-button ?pending=${this.pending} sm @click=${this.connect} theme="dark"
        >Connect ${when(this.pending, () => html`<i class="ml-1 mdi mdi-loading"></i>`)}</ui-button
      > `
  }
}
