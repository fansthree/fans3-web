import { TailwindElement, html, customElement, when, state, until } from '@fans3/ui/src/shared/TailwindElement'
import { bridgeStore, StateController, getContract, getAccount } from '@fans3/ethers/src/useBridge'

import { goto } from '@fans3/ui/src/shared/router'
// Components
import '@fans3/ui/src/connect-wallet/btn'

import logo from '~/assets/logo.svg'
import { ethers } from 'ethers'

@customElement('view-ex')
export class ViewEx extends TailwindElement({}) {
  bindBridge: any = new StateController(this, bridgeStore)
  @state() twitter = ''
  @state() shareHolder = ''
  @state() buying = false
  @state() selling = false
  @state() err: any

  @state()
  private supply = getContract('Fans3Shares', { address: '0xa026b720ec05f37e161c65bbe39fda5e0f6ebb9f' }).then(
    (contract) => {
      return contract.sharesSupply(this.shareHolder).then((supply) => {
        console.log(supply)
        return supply
      })
    }
  )

  @state()
  private price = getContract('Fans3Shares', { address: '0xa026b720ec05f37e161c65bbe39fda5e0f6ebb9f' }).then(
    (contract) => {
      return contract.getBuyPrice(this.shareHolder, 1).then((price) => {
        return ethers.formatEther(price)
      })
    }
  )

  @state()
  private buyPrice = getContract('Fans3Shares', { address: '0xa026b720ec05f37e161c65bbe39fda5e0f6ebb9f' }).then(
    (contract) => {
      return contract.getBuyPriceAfterFee(this.shareHolder, 1).then((price) => {
        return ethers.formatEther(price)
      })
    }
  )

  @state()
  private sellPrice = getContract('Fans3Shares', { address: '0xa026b720ec05f37e161c65bbe39fda5e0f6ebb9f' }).then(
    (contract) => {
      return contract.getSellPriceAfterFee(this.shareHolder, 1).then((price) => {
        return ethers.formatEther(price)
      })
    }
  )

  get account() {
    return bridgeStore.account
  }

  link() {}

  async buy() {
    this.buying = true
    try {
      let contract = await getContract('Fans3Shares', { address: '0xa026b720ec05f37e161c65bbe39fda5e0f6ebb9f' })
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
      let contract = await getContract('Fans3Shares', { address: '0xa026b720ec05f37e161c65bbe39fda5e0f6ebb9f' })
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
        <div class="my-4">
          Wallet Address:
          <connect-wallet-btn></connect-wallet-btn>
        </div>
        <div class="my-4 ${when(!this.twitter, () => 'hidden')}">Twitter: ${this.twitter}</div>
        <div class="my-4">
          <span>You are viewing ${this.shareHolder}'s shares</span><br />
          <span>Holding: ${until(this.supply, html`<i class="text-sm mdi mdi-loading"></i>`)}</span><br />
          <span>Price: ${until(this.price, html`<i class="text-sm mdi mdi-loading"></i>`)}</span>
        </div>
        <div class="my-4 ${when(this.account, () => 'hidden')}">Connect your wallet to buy/sell shares</div>
        <div class="my-4 ${when(this.twitter, () => 'hidden')}">
          <ui-button sm class="my-2" @click=${this.link}>Link your twitter to buy/sell shares</ui-button>
        </div>
        <div class="my-4">
          Buy price: ${until(this.buyPrice, html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}
          <ui-button sm class="m-2" ?disabled=${this.buying} @click=${this.buy}
            >Buy${when(this.buying, () => html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}</ui-button
          ><br />
          Sell price: ${until(this.sellPrice, html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}
          <ui-button sm class="m-2" ?disabled=${this.selling} @click=${this.sell}
            >Sell${when(this.selling, () => html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}</ui-button
          >
        </div>
        ${when(this.err, () => html`<span class="text-red-500">${this.err}</span>`)}
      </div>
    </div>`
  }
}
