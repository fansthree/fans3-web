import { customElement, TailwindElement, html, when, property } from '../shared/TailwindElement'
import { bridgeStore, StateController } from '@fans3/ethers/src/useBridge'
import { screenStore } from '@fans3/core/src/screen'
import { shortAddress } from '@fans3/ethers/src/utils'
// Components
import '../link'

import style from './address.css?inline'
@customElement('ui-address')
export class UIAddress extends TailwindElement(style) {
  bindBridge: any = new StateController(this, bridgeStore)
  bindScreen: any = new StateController(this, screenStore)
  @property() address?: string // !!! if not defined, use current wallet address
  @property({ type: Boolean }) short = false // if false, auto short address
  @property() href?: string

  get addr() {
    return typeof this.address === 'string' ? this.address : bridgeStore.bridge.account
  }
  get isLink() {
    return typeof this.href === 'string'
  }
  get showAddr() {
    return this.short || screenStore.screen.isMobi ? shortAddress(this.addr) : this.addr
  }

  override render() {
    return html`${when(
      this.isLink,
      () => html`<ui-link href=${this.href}>${this.showAddr}</ui-link>`,
      () => html`${this.showAddr}`
    )}`
  }
}
