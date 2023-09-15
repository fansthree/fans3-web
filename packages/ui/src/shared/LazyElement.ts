/* Usage: 
  export class myComponent extends LazyElement(TailwindElement('')) {
  override onObserved = () => {
    dosth...
  }
*/
import { TAILWINDELEMENT } from './TailwindElement'
declare class LazyElementClass {
  observe$?: HTMLElement
  observer?: IntersectionObserver
  onObserved: Function
  unobserve: Function
  observe: Function
}
export const LazyElement = <T extends PublicConstructor<TAILWINDELEMENT>>(
  superClass: T,
  { persistent = false, rootMargin = '0px' } = {}
) => {
  return class extends superClass {
    observe$?: HTMLElement
    observer?: IntersectionObserver
    onObserved = () => {}
    unobserve = () => this.observe$ && this.observer?.unobserve(this.observe$)
    observe = () => {
      if (this.observer) return
      if (!(this.observe$ || (this.observe$ = this.$(':first-child')))) return
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].intersectionRatio <= 0) return
          this.onObserved()
          if (!persistent) this.unobserve()
        },
        { rootMargin }
      )
      this.observer.observe(this.observe$)
    }
    protected firstUpdated() {
      this.observe()
    }
    connectedCallback() {
      this.unobserve()
      super.connectedCallback()
    }
  } as PublicConstructor<LazyElementClass> & T
}
