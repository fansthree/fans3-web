import { TailwindElement, html, customElement, when, classMap, state } from '@fans3/ui/src/shared/TailwindElement'
import { bridgeStore, StateController } from '@fans3/ethers/src/useBridge'
import { goto } from '@fans3/ui/src/shared/router'
// Components
import '@fans3/ui/src/connect-wallet/btn'

import logo from '~/assets/logo.svg'

@customElement('view-ex')
export class ViewEx extends TailwindElement({}) {
  bindBridge: any = new StateController(this, bridgeStore)
  @state() twitter = ''

  get account() {
    return bridgeStore.account
  }

  get twClasses() {
    return { hidden: !this.account }
  }

  get buyClasses() {
    return { hidden: !this.twitter }
  }

  get sellClasses() {
    return { hidden: !this.twitter }
  }

  link() {}

  buy() {}

  sell() {}

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
        <div class="my-4 ${classMap(this.buyClasses)}">
          Buy:
          <ui-button sm class="my-2" @click=${this.buy}>Link</ui-button>
        </div>
        <div class="my-4 ${classMap(this.sellClasses)}">
          Sell:
          <ui-button sm class="my-2" @click=${this.sell}>Link</ui-button>
        </div>
      </div>
    </div>`
  }
}
