import {
  customElement,
  TailwindElement,
  html,
  property,
  state,
  when,
  repeat,
  styleMap
} from '../shared/TailwindElement'
import { bridgeStore, StateController } from '@fans3/ethers/src/useBridge'
import Network, { Networks } from '@fans3/ethers/src/networks'
import emitter from '@fans3/core/src/emitter'
// Components
import '../dialog'
import './state'

import style from './dialog.css?inline'

@customElement('connect-wallet-dialog')
export class ConnectWalletDialog extends TailwindElement(style) {
  bindBridge: any = new StateController(this, bridgeStore)
  @property({ type: Boolean }) model: any
  @state() step = 1

  close() {
    this.remove()
    this.emit('close')
  }

  get bridge() {
    return bridgeStore.bridge
  }
  get mainnet() {
    return Networks[Network.mainnetChainId]
  }

  get step1() {
    return this.step === 1
  }
  get txt() {
    let header = `Connect Wallet`
    if (!this.step1) {
      header = this.bridge.account ? this.bridge.selected?.title || '' : `Unlock Wallet`
    }
    return { header }
  }
  //
  async go(i: number | any) {
    this.step = 2
    try {
      await this.bridge.select(i)
    } catch {
      // back()
    }
    if (bridgeStore.bridge.isConnected) {
      this.close() // Auto close
      emitter.emit('wallet-connected')
    }
  }
  back() {
    this.bridge.unselect()
    this.step = 1
  }

  override render() {
    return html`<ui-dialog @close=${this.close}>
      <div slot="header">
        ${when(
          this.step1,
          () => this.txt.header,
          () =>
            html`<i
              @click="${this.back}"
              class="inline-flex w-6 h-6 items-center justify-center cursor-pointer mdi mdi-arrow-left text-xl"
            ></i>`
        )}
      </div>
      <!-- Step 1 -->
      ${when(
        this.step1,
        () =>
          html`<ul class="connect-wallet-list">
              ${repeat(
                this.bridge.wallets,
                (item, i) =>
                  html`<li @click=${() => this.go(i)}>
                    <p class="relative flex items-center">
                      <i
                        class="i wallet-logo ${item.name}"
                        style=${styleMap({ backgroundImage: `url(${item.icon})` })}
                      ></i>
                      <span>${item.title}</span>
                    </p>
                    <i class="mdi mdi-arrow-right"></i>
                  </li>`
              )}
            </ul>
            <div class="connect-wallet-intro">
              <p>By connecting your wallet, you can execute the smart contract to lock the name you entered.</p>
              <p>Lock name is free, you need to pay gas only to confirm the transaction.</p>
              <p>
                <a
                  class="uri"
                  href="https://etherscan.io/address/0x8b2afF81fec4E7787AeeB257b5D99626651Ee43F#code"
                  target="_blank"
                  rel="noopener"
                  >The smart contract</a
                >
                is only for locking name. It's open sourced and verified.
              </p>
            </div>`
      )}
      <!-- Step 2 -->
      ${when(
        !this.step1 && this.bridge.selected,
        () =>
          html`<div class="text-2xl">
            <div class="flex justify-center items-center flex-col">
              <i
                class="i wallet-logo ${this.bridge.selected?.name}"
                style=${styleMap({ backgroundImage: `url(${this.bridge.selected?.icon})` })}
              ></i>
              <p class="mt-4"><connect-wallet-state></connect-wallet-state></p>
            </div>
          </div>`
      )}
    </ui-dialog>`
  }
}
