import { customElement, TailwindElement, html, Ref, ref, createRef } from '../shared/TailwindElement'
// Component
import './index'
import '../button'

import { UIDialog } from './index'
import style from './confirm.css?inline'
@customElement('ui-confirm')
// @ts-ignore
export class UIConfirm extends TailwindElement([UIDialog.styles, style]) {
  el$: Ref<UIDialog> = createRef()
  onClose() {
    this.emit('close')
  }
  refClose() {
    this.el$.value?.close()
  }
  confirm() {
    this.emit('confirm')
  }

  override render() {
    return html`<ui-dialog ${ref(this.el$)} @close=${this.onClose}>
      <slot></slot>
      <div slot="footer" class="w-full flex justify-between gap-4">
        <div></div>
        <div>
          <ui-button @click=${this.confirm}>Confirm</ui-button>
          <ui-button @click=${this.refClose} class="minor">Close</ui-button>
        </div>
      </div>
    </ui-dialog>`
  }
}
