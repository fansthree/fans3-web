import { TailwindElement, html, customElement } from '@fans3/ui/src/shared/TailwindElement'
import { goto } from '@fans3/ui/src/shared/router'
// Components
import '@fans3/ui/src/connect-wallet/btn'

// Style
import style from './index.css?inline'
import logo from '~/assets/logo.svg'

@customElement('view-home')
export class ViewHome extends TailwindElement(style) {
  render() {
    return html`<div class="home">
      <div class="ui-container my-4">
        <img class="w-24 object-contain select-none pointer-events-none" src="${logo}" />
      </div>
      <div class="ui-container">
        <p><connect-wallet-btn></connect-wallet-btn></p>
      </div>
    </div>`
  }
}
