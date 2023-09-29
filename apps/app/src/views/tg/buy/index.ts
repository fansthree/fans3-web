import { TailwindElement, html, customElement, when, state, until, repeat } from '@fans3/ui/src/shared/TailwindElement'
import { bridgeStore, StateController, getContract } from '@fans3/ethers/src/useBridge'

// Components
import '@fans3/ui/src/connect-wallet/btn'

import logo from '~/assets/logo.svg'
import { ethers } from 'ethers'
import { shareBalance, shareSupply } from '~/utils'
import emitter from '@fans3/core/src/emitter'

@customElement('tg-buy')
export class TGBuy extends TailwindElement({}) {
  bindBridge: any = new StateController(this, bridgeStore)
  @state() shareHolder = ''
  @state() buying = false
  @state() selling = false
  @state() err: any
  @state() numSupply: number | undefined

  @state()
  private price = getContract('Fans3Shares').then((contract) => {
    return contract.getBuyPrice(this.shareHolder, 1).then((price) => {
      return ethers.formatEther(price)
    })
  })

  @state()
  private buyPrice = getContract('Fans3Shares').then((contract) => {
    return contract.getBuyPrice(this.shareHolder, 1).then((price) => {
      return ethers.formatEther(price)
    })
  })

  @state()
  private sellPrice = getContract('Fans3Shares').then((contract) => {
    return contract.getSellPrice(this.shareHolder, 1).then((price) => {
      return ethers.formatEther(price)
    })
  })

  async reloadSupply() {
    console.debug('got account', bridgeStore.account)
    if (!bridgeStore.account) return
    console.debug('load supply')
    this.numSupply = await shareSupply(bridgeStore.account)
    this.requestUpdate()
  }

  connectedCallback(): void {
    super.connectedCallback()
    if (this.account) this.reloadSupply()
    else emitter.on('wallet-changed', this.reloadSupply.bind(this))
  }

  get account() {
    return bridgeStore.account
  }

  @state()
  private holders = getContract('Fans3Shares').then((contract) => {
    return contract.getFansOfSubject(this.shareHolder).then((fans) => {
      return html`<ul>
        ${repeat(fans, (item) => html` <li>${item}: ${until(shareBalance(this.account, item))}</li>`)}
      </ul>`
    })
  })

  async buy() {
    this.buying = true
    try {
      let contract = await getContract('Fans3Shares')
      let price = await contract.getBuyPriceAfterFee(this.shareHolder, 1)
      let tx = await contract.buyShares(this.shareHolder, 1, { value: price })
      await tx.wait()
    } catch (e) {
      this.err = e
    }
    this.buying = false
  }

  async sell() {
    this.selling = true
    try {
      let contract = await getContract('Fans3Shares')
      let tx = await contract.sellShares(this.shareHolder, 1)
      await tx.wait()
    } catch (e) {
      this.err = e
    }
    this.selling = false
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
        <p>
          <span>You are viewing ${this.shareHolder}'s shares</span><br />
          <span>Shares: ${until(this.numSupply, html`<i class="text-sm mdi mdi-loading"></i>`)}</span><br />
          <span>Price: ${until(this.price, html`<i class="text-sm mdi mdi-loading"></i>`)}</span>
        </p>
        <div class="my-4 ${when(this.account, () => 'hidden')}">Connect your wallet to buy/sell shares</div>
        <p>
          Buy price: ${until(this.buyPrice, html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}
          <ui-button sm class="m-2" ?disabled=${this.buying} @click=${this.buy}
            >Buy${when(this.buying, () => html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}</ui-button
          >
        </p>
        ${when(
          this.numSupply != undefined,
          () =>
            html`<p>
                Sell price: ${until(this.sellPrice, html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}
                <ui-button sm class="m-2" ?disabled=${this.selling} @click=${this.sell}
                  >Sell${when(this.selling, () => html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}</ui-button
                >
              </p>
              <p class="my-2">Holders:</p>
              ${until(this.holders, html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}`
        )}
      </div>
    </div>`
  }
}
