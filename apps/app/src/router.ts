import { html } from 'lit'

export const routes = [
  {
    name: 'home',
    path: '/',
    render: () => html`<view-home></view-home>`,
    enter: async () => {
      await import('~/views/home')
      return true
    }
  }
]

export default routes
