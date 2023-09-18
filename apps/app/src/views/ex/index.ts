import { TailwindElement, html, customElement, when, state, until, repeat } from '@fans3/ui/src/shared/TailwindElement'
import { bridgeStore, StateController, getContract } from '@fans3/ethers/src/useBridge'

// Components
import '@fans3/ui/src/connect-wallet/btn'

import logo from '~/assets/logo.svg'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS } from '~/constants'

@customElement('view-ex')
export class ViewEx extends TailwindElement({}) {
  bindBridge: any = new StateController(this, bridgeStore)
  @state() twitter = ''
  @state() shareHolder = ''
  @state() buying = false
  @state() selling = false
  @state() err: any
  @state() supply = 0

  @state()
  private updateSupply = getContract('Fans3Shares', { address: CONTRACT_ADDRESS }).then((contract) => {
    return contract
      .sharesSupply(this.shareHolder)
      .then((supply) => {
        this.supply = supply
        return supply
      })
      .catch(() => {
        return 0
      })
  })

  @state()
  private price = getContract('Fans3Shares', { address: CONTRACT_ADDRESS }).then((contract) => {
    return contract.getBuyPrice(this.shareHolder, 1).then((price) => {
      return ethers.formatEther(price)
    })
  })

  @state()
  private buyPrice = getContract('Fans3Shares', { address: CONTRACT_ADDRESS }).then((contract) => {
    return contract.getBuyPrice(this.shareHolder, 1).then((price) => {
      return ethers.formatEther(price)
    })
  })

  @state()
  private sellPrice = getContract('Fans3Shares', { address: CONTRACT_ADDRESS }).then((contract) => {
    return contract.getSellPrice(this.shareHolder, 1).then((price) => {
      return ethers.formatEther(price)
    })
  })

  get account() {
    return bridgeStore.account
  }

  holding(item: any) {
    return getContract('Fans3Shares', { address: CONTRACT_ADDRESS }).then((contract) => {
      return contract
        .sharesBalance(this.shareHolder, item)
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
    return contract.getFansOfSubject(this.shareHolder).then((fans) => {
      return html`<ul>
        ${repeat(fans, (item) => html` <li>${item}: ${until(this.holding(item))}</li>`)}
      </ul>`
    })
  })

  link() {}

  async buy() {
    this.buying = true
    try {
      let contract = await getContract('Fans3Shares', { address: CONTRACT_ADDRESS })
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
      let contract = await getContract('Fans3Shares', { address: CONTRACT_ADDRESS })
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
        <div class="my-4 ${when(!this.twitter, () => 'hidden')}">Twitter: ${this.twitter}</div>
        <div class="my-4">
          <span>You are viewing ${this.shareHolder}'s shares</span><br />
          <span>Holding: ${until(this.updateSupply, html`<i class="text-sm mdi mdi-loading"></i>`)}</span><br />
          <span>Price: ${until(this.price, html`<i class="text-sm mdi mdi-loading"></i>`)}</span>
        </div>
        <div class="my-4 ${when(this.account, () => 'hidden')}">Connect your wallet to buy/sell shares</div>
        <div class="my-4 ${when(this.twitter, () => 'hidden')}">
          Link your twitter to buy/sell shares
          <ui-button href="http://147.139.3.9:8000/login" class="ml-2" sm>Link</ui-button>
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
        <div class="my-4">
          <span class="my-2">Holdings: of ${this.shareHolder}</span><br />
          ${when(this.supply, () => html`${until(this.holders, html`<i class="ml-2 text-sm mdi mdi-loading"></i>`)}`)}
        </div>
      </div>
    </div>`
  }
}
