import { TailwindElement, html, customElement, when, state, classMap } from '@fans3/ui/src/shared/TailwindElement'
import { bridgeStore, getSigner, StateController } from '@fans3/ethers/src/useBridge'
// Components
import '@fans3/ui/src/connect-wallet/btn'
import clipboard from './clipboard'

// Style
import logo from '~/assets/logo.svg'
import 'ethers'
import { ethers } from 'ethers'

@customElement('tg-verify')
export class TGVerify extends TailwindElement({}) {
  bindBridge: any = new StateController(this, bridgeStore)
  @state() tgUser = ''
  @state() err: any
  @state() verifying = false
  @state() signature = ''
  @state() interval = 2.5
  @state() copied = false
  @state() copiedShow = false
  timer: any = null

  get account() {
    return bridgeStore.account
  }

  async copy(e: Event) {
    e.preventDefault()
    e.stopImmediatePropagation()
    clearTimeout(this.timer)
    const text = this.signature
    if (!text) return
    this.copied = false
    try {
      let _this = this
      await clipboard.writeText(text as any)
      this.copied = true
      this.copiedShow = true
      this.timer = setTimeout(() => {
        _this.copiedShow = false
      }, this.interval * 1000)
    } catch (err) {
      this.copied = false
    }
  }
  async verify() {
    this.verifying = true
    try {
      const signer = await getSigner(this.account)
      const time = new Date().toISOString()
      this.signature =
        ethers.encodeBase64(ethers.toUtf8Bytes(time)) +
        '|' +
        ethers.encodeBase64(
          await signer.signMessage(
            `Sign this message to allow telegram user\n\n${this.tgUser}\n\nto join groups that you own a share.\n\nAvailable for 30 minutes.\nTime now: ${time}`
          )
        )
    } catch (e) {
      this.err = e
    }
    this.verifying = false
  }

  render() {
    return html`<div class="home">
      <div class="ui-container my-4">
        <img class="w-24 object-contain select-none pointer-events-none" src="${logo}" />
      </div>
      <div class="ui-container">
        ${when(this.err, () => html`<span class="text-red-500">${this.err}</span>`)}
        <div class="my-4">
          <p class="my-4">
            You are going to verify <span class="font-bold">${this.tgUser}</span> with your wallet address
            <span class="font-bold">${this.account}</span>.
          </p>
          <p class="my-4">After verification, ${this.tgUser} can join any group that you own a share.</p>
        </div>
        <div class="my-4">
          Wallet Address:
          <connect-wallet-btn></connect-wallet-btn>
        </div>
        ${when(
          this.account && !this.signature,
          () =>
            html` <div>
              <p class="my-4">By clicking Verify, your wallet will open and you are asked to sign a message.</p>
              <ui-button sm @click=${this.verify} ?disabled=${this.verifying}
                >${when(
                  this.verifying,
                  () => html`<i class="ml-2 text-sm mdi mdi-loading"></i>`,
                  () => 'Verify'
                )}
              </ui-button>
              <p class="my-4">Please note, no transaction or gas fee is required.</p>
            </div>`
        )}
        ${when(
          this.signature,
          () =>
            html`<div class="mt-6">
              <p class="my-4">Copy the following line and paste back to your telegram conversion</p>
              <p class="my-4">${this.signature}</p>
              <ui-button @click=${this.copy} class="${classMap({ copied: this.copiedShow })}">
                ${this.copied && this.copiedShow
                  ? html`<slot name="copied">Copied</slot>`
                  : html`<slot name="copy">Copy</slot>`}
              </ui-button>
            </div> `
        )}
      </div>
    </div>`
  }
}
