import { TailwindElement, html, customElement, when, state, until } from '@fans3/ui/src/shared/TailwindElement'
import { bridgeStore, getContract, StateController } from '@fans3/ethers/src/useBridge'
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
  @state() creating = false
  @state() err: any
  @state() supply = 0

  get account() {
    return bridgeStore.account
  }

  @state()
  private updateSupply = getContract('Fans3Shares', { address: '0xa026b720ec05f37e161c65bbe39fda5e0f6ebb9f' }).then(
    (contract) => {
      return contract
        .sharesSupply(this.account)
        .then((supply) => {
          this.supply = supply
          return supply
        })
        .catch(() => {
          return 0
        })
    }
  )

  link() {
    this.twitter = 'VitalikButerin'
  }

  async create() {
    this.creating = true
    try {
      let contract = await getContract('Fans3Shares', { address: '0xa026b720ec05f37e161c65bbe39fda5e0f6ebb9f' })
      let price = await contract.getBuyPriceAfterFee(this.account, 1)
      let tx = await contract.buyShares(this.account, 1, { value: price })
      await tx.wait()
    } catch (e) {
      this.err = e
    }
    this.creating = false
  }

  render() {
    return html`<div class="home">
      <div class="ui-container my-4">
        <img class="w-24 object-contain select-none pointer-events-none" src="${logo}" />
      </div>
      <div class="ui-container">
        ${when(this.err, () => html`<span class="text-red-500">${this.err}</span>`)}
        <div class="my-4">
          Wallet Address:
          <connect-wallet-btn></connect-wallet-btn>
        </div>
        <div class="my-4 ${when(this.twitter, () => 'hidden')}">
          Link your twitter to continue
          <!-- <ui-button href="http://147.139.3.9:8000/login" class="ml-2" sm>Link</ui-button> -->
          <ui-button @click=${this.link} class="ml-2" sm>Link</ui-button>
        </div>
        <div class="my-4 ${when(!this.twitter, () => 'hidden')}">Twitter: ${this.twitter}</div>
        ${when(
          this.account && this.twitter,
          () =>
            html`<div class="my-4">
              ${until(this.updateSupply, html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)} holdings<br />
              <ui-button
                sm
                class="my-2 ${when(this.supply, () => 'hidden')}"
                ?disabled=${this.creating}
                @click=${this.create}
                >Create${when(this.creating, () => html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}</ui-button
              >
            </div>`
        )}
      </div>
    </div>`
  }
}
