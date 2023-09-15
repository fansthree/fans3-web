/// <reference types="wallet" />
declare type Wallet = {
  state: WalletState
  accounts: string[]
  account: string
  updateProvider: (chainId: string) => any
  connect: () => any
  disconnect: () => any
  install: () => any
}
declare module '@metamask/jazzicon' {
  export default function (diameter: number, seed: number): HTMLElement
}
