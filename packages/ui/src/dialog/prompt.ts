import { customElement, TailwindElement, html, when, ref, createRef, property, Ref } from '../shared/TailwindElement'
// Component
import './index'
import '../button'

import { UIDialog } from './index'
import style from './prompt.css?inline'
@customElement('ui-prompt')
// @ts-ignore
export class UIPrompt extends TailwindElement([UIDialog.styles, style]) {
  @property({ type: Boolean }) button = false
  el$: Ref<UIDialog> = createRef()
  onClose() {
    this.emit('close')
  }
  refClose() {
    this.el$.value?.close()
  }

  override render() {
    return html`<ui-dialog ${ref(this.el$)} @close=${this.onClose}>
      <slot></slot>
      ${when(
        this.button,
        () => html`<div slot="footer" class="w-full flex justify-between gap-4">
          <div></div>
          <div>
            <ui-button @click=${this.refClose} class="minor">Close</ui-button>
          </div>
        </div>`
      )}
    </ui-dialog>`
  }
}
