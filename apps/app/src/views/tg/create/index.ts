import {
  TailwindElement,
  html,
  customElement,
  when,
  state,
  until,
  repeat,
  choose
} from '@fans3/ui/src/shared/TailwindElement'
import { bridgeStore, getContract, StateController } from '@fans3/ethers/src/useBridge'
// Components
import '@fans3/ui/src/connect-wallet/btn'

// Style
import logo from '~/assets/logo.svg'
import { shareBalance, shareHolders, shareSupply } from '~/utils'
import emitter from '@fans3/core/src/emitter'

@customElement('tg-create')
export class TGCreate extends TailwindElement({}) {
  bindBridge: any = new StateController(this, bridgeStore)
  @state() creating = false
  @state() err: any
  @state() numSupply: number | undefined
  @state() numHolders: number | undefined

  get account() {
    return bridgeStore.account
  }

  get tgInfo() {
    return new URL(location.href).searchParams.get('tg')
  }

  @state()
  private holders = getContract('Fans3Shares').then((contract) => {
    return contract.getFansOfSubject(this.account).then((fans) => {
      return html`<ul>
        ${repeat(
          fans,
          (item) =>
            html` <li>
              ${item}: ${until(shareBalance(this.account, item), html`<i class="text-sm mdi mdi-loading"></i>`)}
            </li>`
        )}
      </ul>`
    })
  })

  async reloadSupply() {
    console.debug('got account', bridgeStore.account)
    if (!bridgeStore.account) return
    console.debug('load supply')
    this.numSupply = await shareSupply(bridgeStore.account)
    this.numHolders = await shareHolders(bridgeStore.account)
    this.requestUpdate()
  }

  connectedCallback(): void {
    super.connectedCallback()
    if (this.account) this.reloadSupply()
    else emitter.on('wallet-changed', this.reloadSupply.bind(this))
  }

  async create() {
    this.creating = true
    try {
      let contract = await getContract('Fans3Shares')
      let price = await contract.getBuyPriceAfterFee(this.account, 1)
      let tx = await contract.buyShares(this.account, 1, { value: price })
      await tx.wait()
      this.reloadSupply()
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
        <div class="my-4"><span>TG Group: ${this.tgInfo}</span></div>
        <div class="my-4">
          Wallet Address:
          <connect-wallet-btn></connect-wallet-btn>
        </div>
        ${when(
          this.account,
          () =>
            html`<ui-link link href="/tg/buy/${this.account}" class="my-2">Link to buy my share</ui-link>
              <div class="my-4">
                <p class="my-2">
                  shares:${when(
                    this.numSupply != undefined,
                    () => html`${this.numSupply}`,
                    () => html`<i class="ml-2 text-sm mdi mdi-loading"></i>`
                  )}
                  holders:${when(
                    this.numHolders != undefined,
                    () => this.numHolders,
                    () => html`<i class="ml-2 text-sm mdi mdi-loading"></i>`
                  )}
                </p>
                ${choose(
                  this.numSupply,
                  [
                    [undefined, () => html`<i class="ml-2 text-sm mdi mdi-loading"></i>`],
                    [
                      0,
                      () =>
                        html`<ui-button sm class="my-2" ?disabled=${this.creating} @click=${this.create}
                          >Create${when(
                            this.creating,
                            () => html`<i class="ml-2 text-sm mdi mdi-loading"></i>`
                          )}</ui-button
                        >`
                    ]
                  ],
                  () =>
                    html`<p>Holders:</p>
                      ${until(this.holders, html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}`
                )}
              </div>`
        )}
      </div>
    </div>`
  }
}
