import { TailwindElement, html, customElement, when, classMap, state } from '@fans3/ui/src/shared/TailwindElement'
import { bridgeStore, StateController } from '@fans3/ethers/src/useBridge'
import { goto } from '@fans3/ui/src/shared/router'
// Components
import '@fans3/ui/src/connect-wallet/btn'

// Style
import style from './index.css?inline'
import logo from '~/assets/logo.svg'

@customElement('view-home')
export class ViewHome extends TailwindElement(style) {
  bindBridge: any = new StateController(this, bridgeStore)
  @state() twitter = ''

  get account() {
    return bridgeStore.account
  }

  get twClasses() {
    return { hidden: !this.account }
  }

  get createClasses() {
    return { hidden: !this.twitter }
  }

  link() {}

  create() {}

  render() {
    return html`<div class="home">
      <div class="ui-container my-4">
        <img class="w-24 object-contain select-none pointer-events-none" src="${logo}" />
      </div>
      <div class="ui-container">
        <div class="my-4">
          Wallet Address:
          <connect-wallet-btn></connect-wallet-btn>
        </div>
        <div class="my-4 ${classMap(this.twClasses)}">
          Twitter:
          <ui-button sm class="my-2" @click=${this.link}>Link</ui-button>
        </div>
        <div class="my-4 ${classMap(this.createClasses)}">
          Create:
          <ui-button sm class="my-2" @click=${this.create}>Link</ui-button>
        </div>
      </div>
    </div>`
  }
}
