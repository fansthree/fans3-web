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
  },
  {
    name: 'tg-create',
    path: '/tg/create',
    render: () => html`<tg-create></tg-create>`,
    enter: async () => {
      await import('~/views/tg/create')
      return true
    }
  },
  {
    name: 'tg-buy',
    path: '/tg/buy/:shareHolder?',
    render: ({ shareHolder = '' }) => html`<tg-buy .shareHolder=${safeDecodeURIComponent(shareHolder)}></tg-buy>`,
    enter: async () => {
      await import('~/views/tg/buy')
      return true
    }
  }
]

export default routes
