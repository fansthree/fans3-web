import { customElement, TailwindElement, html, when, state, classMap } from '../shared/TailwindElement'
import { animate } from '@lit-labs/motion'
import { bridgeStore, StateController } from '@fans3/ethers/src/useBridge'
import { screenStore } from '@fans3/core/src/screen'
// Components
import '../link'

import style from './network-warning.css?inline'
@customElement('network-warning')
export class NetworkWarning extends TailwindElement(style) {
  bindBridge: any = new StateController(this, bridgeStore)
  bindScreen: any = new StateController(this, screenStore)
  @state() pending = false

  get bridge() {
    return bridgeStore.bridge
  }
  get network() {
    return this.bridge.network
  }
  get txt() {
    if (this.network.unSupported) `Please connect to the Mainnet}.`
    if (this.network.mainnetOffline) return `Mainnet is not supported yet`
    if (!this.network.isMainnet) return `Note: You are currently connected to the ${this.bridge.network.title}`
    return ''
  }
  get shown() {
    return this.network.disabled || !this.network.isMainnet
  }

  async switch() {
    this.pending = true
    await this.bridge.switchNetwork(this.network.default.chainId)
    this.pending = false
  }
  toggle(del = false) {
    const { style } = document.documentElement
    const attr = '--networkWarnH'
    del || !this.shown ? style.removeProperty(attr) : style.setProperty(attr, `${screenStore.md ? 48 : 24}px`)
  }
  fit = () => {
    this.toggle()
  }
  ro = new ResizeObserver(this.fit)

  connectedCallback() {
    super.connectedCallback()
    this.toggle()
    this.ro.observe(document.documentElement)
  }
  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.toggle(true)
    this.ro.disconnect()
  }

  override render() {
    if (!this.shown) return
    return html`<span
      class="network-warning overflow-hidden w-full flex text-red-600 items-center px-2 justify-center text-center bg-orange-200 ${classMap(
        { shown: this.shown }
      )}"
      ${animate({ guard: () => this.shown, properties: ['opacity', 'height', 'visibility'] })}
    >
      <span>${this.txt}</span>
      ${when(
        !this.network.isDefaultNet,
        () =>
          html`<ui-link ?disabled=${this.pending} text class="ml-1" @click=${this.switch}
            >Switch to ${this.network.default.title}</ui-link
          >`
      )}
    </span>`
  }
}
