import { TailwindElement, html, customElement, when, state, until } from '@fans3/ui/src/shared/TailwindElement'
import { bridgeStore, StateController, getContract, getAccount } from '@fans3/ethers/src/useBridge'

import { goto } from '@fans3/ui/src/shared/router'
// Components
import '@fans3/ui/src/connect-wallet/btn'

import logo from '~/assets/logo.svg'

@customElement('view-ex')
export class ViewEx extends TailwindElement({}) {
  bindBridge: any = new StateController(this, bridgeStore)
  @state() twitter = ''
  @state() shareHolder = ''

  @state()
  private supply = getContract('Fans3Shares', { address: '0xa026b720ec05f37e161c65bbe39fda5e0f6ebb9f' }).then(
    (contract) => {
      return contract.sharesSupply(this.shareHolder).then((supply) => {
        console.log(supply)
        return supply
      })
    }
  )

  get account() {
    return bridgeStore.account
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
        <div class="my-4 ${when(!this.twitter, () => 'hidden')}">Twitter: ${this.twitter}</div>
        <div class="my-4">
          You are viewing ${this.shareHolder}'s shares
          (${until(this.supply, html`<i class="text-2xl mdi mdi-loading"></i>`)} holding)
        </div>
        <div class="my-4 ${when(this.account, () => 'hidden')}">Connect your wallet to buy/sell shares</div>
        <div class="my-4 ${when(this.twitter, () => 'hidden')}">
          <ui-button sm class="my-2" @click=${this.link}>Link your twitter to buy/sell shares</ui-button>
        </div>
        <div class="my-4 ${when(!this.twitter, () => 'hidden')}">
          Buy:
          <ui-button sm class="my-2" @click=${this.buy}>Link</ui-button>
        </div>
        <div class="my-4 ${when(!this.twitter, () => 'hidden')}">
          Sell:
          <ui-button sm class="my-2" @click=${this.sell}>Link</ui-button>
        </div>
      </div>
    </div>`
  }
}
