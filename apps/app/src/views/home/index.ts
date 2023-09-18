import { TailwindElement, html, customElement, when, state, until, repeat } from '@fans3/ui/src/shared/TailwindElement'
import { bridgeStore, getContract, StateController } from '@fans3/ethers/src/useBridge'
// Components
import '@fans3/ui/src/connect-wallet/btn'

// Style
import style from './index.css?inline'
import logo from '~/assets/logo.svg'
import { CONTRACT_ADDRESS } from '~/constants'

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
  private updateSupply = getContract('Fans3Shares', { address: CONTRACT_ADDRESS }).then((contract) => {
    return contract
      .sharesSupply(this.account)
      .then((supply) => {
        this.supply = supply
        return supply
      })
      .catch(() => {
        return 0
      })
  })

  link() {
    this.twitter = 'VitalikButerin'
  }

  async create() {
    this.creating = true
    try {
      let contract = await getContract('Fans3Shares', { address: CONTRACT_ADDRESS })
      let price = await contract.getBuyPriceAfterFee(this.account, 1)
      let tx = await contract.buyShares(this.account, 1, { value: price })
      await tx.wait()
      this.updateSupply
    } catch (e) {
      this.err = e
    }
    this.creating = false
  }

  holding(item: any) {
    return getContract('Fans3Shares', { address: CONTRACT_ADDRESS }).then((contract) => {
      return contract
        .sharesBalance(this.account, item)
        .then((balance) => {
          return balance
        })
        .catch(() => {
          return 0
        })
    })
  }

  @state()
  private holders = getContract('Fans3Shares', { address: CONTRACT_ADDRESS }).then((contract) => {
    return contract.getFansOfSubject(this.account).then((fans) => {
      return html`<ul>
        ${repeat(fans, (item) => html` <li>${item}: ${until(this.holding(item))}</li>`)}
      </ul>`
    })
  })

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
            html`<ui-button href="/x/${this.account}" class="my-2" sm>Link to buy my share</ui-button>
              <div class="my-4">
                <span class="my-2"
                  >${until(this.updateSupply, html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)} holdings</span
                ><br />
                ${when(
                  this.supply,
                  () => html`${until(this.holders, html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}`,
                  () =>
                    html` <ui-button sm class="my-2 " ?disabled=${this.creating} @click=${this.create}
                      >Create${when(this.creating, () => html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}</ui-button
                    >`
                )}
              </div>`
        )}
      </div>
    </div>`
  }
}
