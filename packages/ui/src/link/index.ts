import emitter from '@fans3/core/src/emitter'
import {
  TailwindElement,
  html,
  customElement,
  classMap,
  property,
  state,
  ifDefined,
  when
} from '../shared/TailwindElement'
import { routerPathname, routerPathroot } from '../shared/router'

import style from './link.css?inline'
@customElement('ui-link')
export class UILink extends TailwindElement(style) {
  @property({ type: String }) target = ''
  @property({ type: String }) class = ''
  @property() href?: string
  @property({ type: String }) alias = ''
  @property({ type: Boolean }) exact = false
  @property({ type: Boolean }) disabled = false
  @property({ type: Boolean }) open = false
  @property({ type: Boolean }) link = false
  @property({ type: Boolean }) back = false
  @property() click: any
  @property({ type: Boolean }) nav = false // as navigator
  @property({ type: Boolean }) text = false // as text with underline

  @state() pathname = routerPathname()

  get blocked() {
    return this.disabled
  }
  get path() {
    return routerPathroot(this.pathname)
  }
  get noHref() {
    return typeof this.href === 'undefined'
  }
  get outsite() {
    return !this.noHref && !/^\//.test(this.href + '')
  }
  get exacted() {
    if (this.outsite || this.noHref) return false
    return this.pathname === routerPathname(`${location.origin}${this.href}`) || this.pathname === this.alias
  }
  get active() {
    if (this.outsite) return false
    return routerPathroot(this.href) === this.path || routerPathroot(this.alias) === this.path
  }
  get rel() {
    return this.outsite ? 'noopener' : ''
  }
  get _target() {
    return this.outsite ? '_blank' : ''
  }
  onClick = (e: Event) => {
    if (this.blocked || this.back) {
      e.stopImmediatePropagation()
      e.preventDefault()
      if (this.back) history.back()
    }
  }

  updatePathName = () => {
    this.pathname = routerPathname()
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.nav) emitter.on('router-change', this.updatePathName)
  }
  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.nav) emitter.off('router-change', this.updatePathName)
  }

  render() {
    return html`<a
      part="ui-link"
      ?nav=${this.nav}
      ?text=${this.text}
      ?link=${this.link}
      ?active=${!this.exact && this.active}
      ?exact-active=${this.exacted}
      target="${ifDefined(this._target)}"
      rel="${ifDefined(this.rel)}"
      href="${ifDefined(this.href)}"
      class="ui-link ${classMap(this.$c([{ 'router-active': this.active }, this.class]))}"
      @click=${this.onClick}
      ?disabled=${this.disabled}
      ><slot></slot>${when(this.open, () => html`<i class="ml-1 mdi mdi-open-in-new"></i>`)}</a
    >`
  }
}
