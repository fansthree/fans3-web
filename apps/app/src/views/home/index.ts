import { TailwindElement, html, customElement, when, state, until, repeat } from '@fans3/ui/src/shared/TailwindElement'
import { bridgeStore, getContract, StateController } from '@fans3/ethers/src/useBridge'
// Components
import '@fans3/ui/src/connect-wallet/btn'

// Style
import style from './index.css?inline'
import logo from '~/assets/logo.svg'
import { API_URL } from '~/constants'
import { sleep } from '@fans3/ethers/src/utils'
import { SECOND } from '@fans3/core/src/constants/time'
import { shareBalance, twitterName } from '~/utils'
import emitter from '@fans3/core/src/emitter'

@customElement('view-home')
export class ViewHome extends TailwindElement(style) {
  bindBridge: any = new StateController(this, bridgeStore)
  @state() twitter: any
  @state() creating = false
  @state() linking = true
  @state() err: any
  @state() supply = 0

  get account() {
    return bridgeStore.account
  }

  connectedCallback() {
    super.connectedCallback()
    emitter.on('wallet-changed', async () => {
      this.linking = true
      this.twitter = ''
      await this.updateTwitter()
    })
  }

  updateTwitter() {
    if (!this.account) return Promise
    return fetch(API_URL + '/user?address=' + this.account)
      .then((blob) => blob.json())
      .then((data) => {
        this.twitter = data
        return ''
      })
      .finally(() => {
        this.linking = false
      })
  }

  @state()
  private updateSupply = getContract('Fans3Shares').then((contract) => {
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

  async link() {
    this.linking = true
    while (true) {
      try {
        let twitter = await fetch(API_URL + '/user?address=' + this.account, { mode: 'no-cors' })
        this.twitter = await twitter.json()
        return
      } catch (e) {
        console.log(e)
      }
      await sleep(SECOND)
    }
  }

  async create() {
    this.creating = true
    try {
      let contract = await getContract('Fans3Shares')
      let price = await contract.getBuyPriceAfterFee(this.account, 1)
      let tx = await contract.buyShares(this.account, 1, { value: price })
      await tx.wait()
      this.updateSupply
    } catch (e) {
      this.err = e
    }
    this.creating = false
  }

  @state()
  private holders = getContract('Fans3Shares').then((contract) => {
    return contract.getFansOfSubject(this.account).then((fans) => {
      return html`<ul>
        ${repeat(
          fans,
          (item) =>
            html` <li>
              ${item}(${until(twitterName(item), html`<i class="text-sm mdi mdi-loading"></i>`)}):
              ${until(shareBalance(this.account, item), html`<i class="text-sm mdi mdi-loading"></i>`)}
            </li>`
        )}
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
        ${when(this.account && !this.twitter, () => {
          this.updateTwitter()
          return html`<div class="my-4">
            Link your twitter to continue
            <ui-button
              href="${API_URL}/login?address=${this.account}"
              @click=${this.link}
              class="ml-2 uppercase ${when(this.twitter, () => 'hidden')}"
              ?disabled=${this.linking}
              sm
              >${when(
                this.linking,
                () => html`<i class="ml-2 text-sm mdi mdi-loading"></i>`,
                () => 'Link'
              )}</ui-button
            >
          </div>`
        })}
        ${when(
          this.account && this.twitter,
          () =>
            html`<div class="my-4">Twitter: ${this.twitter.name}</div>
              <ui-link link href="/x/${this.account}" class="my-2">Link to buy my share</ui-link>
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
