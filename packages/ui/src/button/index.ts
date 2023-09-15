import { customElement, property } from 'lit/decorators.js'
import { TailwindElement, html } from '../shared/TailwindElement'
import { when } from 'lit/directives/when.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import style from './button.css?inline'

@customElement('ui-button')
export class UIButton extends TailwindElement(style) {
  @property({ type: String }) label = ''
  @property({ type: String }) iconPos = 'left'
  @property({ type: String }) class = ''
  @property() href?: string
  @property({ type: Boolean }) disabled = false
  @property({ type: Boolean }) pending = false
  @property({ type: Boolean }) icon = false
  @property({ type: Boolean }) text = false
  @property({ type: Boolean }) sm = false
  @property({ type: Boolean }) dense = false
  @property({ type: String, reflect: true }) theme?: string

  constructor() {
    super()
    this.addEventListener('click', (e: Event) => {
      if (this.blocked) e.stopImmediatePropagation()
    })
  }
  get isAnchor() {
    return typeof this.href !== 'undefined'
  }
  get rel() {
    if (!this.isAnchor) return ''
    return /^http/.test(this.href!) ? 'noopener' : ''
  }
  get target() {
    return this.rel ? '_blank' : ''
  }

  get blocked() {
    return this.disabled || this.pending
  }

  get iconLeft() {
    return ['both', 'left'].includes(this.iconPos)
  }
  render() {
    return html`
      ${when(
        this.isAnchor,
        () => html`<a
          part="ui-button"
          href=${ifDefined(this.href)}
          target=${ifDefined(this.target)}
          rel="${ifDefined(this.rel)}"
          class="ui-button ${this.class}"
          ?icon=${this.icon}
          ?dense=${this.dense}
          ?disabled=${this.blocked}
          ?pending=${this.pending}
          ?text=${this.text}
          ?sm=${this.sm}
          theme=${this.theme}
        >
          <slot></slot>
        </a>`,
        () => html`<button
          part="ui-button"
          type="button"
          class="ui-button ${this.class}"
          ?icon=${this.icon}
          ?dense=${this.dense}
          ?disabled=${this.blocked}
          ?pending=${this.pending}
          ?text=${this.text}
          ?sm=${this.sm}
          theme=${this.theme}
        >
          <slot></slot>
        </button>`
      )}
    `
  }
}
