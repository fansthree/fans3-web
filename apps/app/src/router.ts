import { html } from 'lit'
import safeDecodeURIComponent from 'safe-decode-uri-component'

export const routes = [
  {
    name: 'home',
    path: '/',
    render: () => html`<view-home></view-home>`,
    enter: async () => {
      await import('~/views/home')
      return true
    }
  },
  {
    name: 'ex',
    path: '/x/:shareHolder?',
    render: ({ shareHolder = '' }) => html`<view-ex .shareHolder=${safeDecodeURIComponent(shareHolder)}></view-ex>`,
    enter: async () => {
      await import('~/views/ex')
      return true
    }
  }
]

export default routes
