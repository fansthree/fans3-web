import MetaMaskOnboarding from './metamask-onboarding'
import { getAddress } from 'ethers'
import { emitErr } from '@fans3/core/src/emitter'
import { WalletState, emitWalletChange } from '../../wallet'
import detectEthereum, { getChainId, getChainIdSync, getAccounts } from '../../detectEthereum'
import screen from '@fans3/core/src/screen'

class MetaMask implements Wallet {
  public onboarding: any
  public state: WalletState
  public provider: any
  public inited: boolean
  public accounts: string[]
  public listeners: any

  constructor(provider: object) {
    this.onboarding = new MetaMaskOnboarding()
    this.provider = provider
    this.accounts = []
    this.inited = false
    this.state = this.resetState()
    this.listeners = new Map()
  }
  resetState(): WalletState {
    const installed = MetaMaskOnboarding.isMetaMaskInstalled()
    let state: keyof typeof WalletState = 'CONNECTING'
    if (installed) state = this.inited ? 'WAITING' : 'INSTALLED'
    else state = this.inited ? 'NOT_INSTALLED' : 'CONNECTING'
    return (this.state = WalletState[state])
  }
  get account() {
    return this.accounts[0] ?? ''
  }
  updateAccounts(accounts = []) {
    this.accounts = accounts.map((r) => getAddress(r))
    emitWalletChange()
  }
  updateProvider(chainId?: string) {
    this.provider.update({ chainId })
    emitWalletChange()
  }
  unlisten() {
    const { ethereum } = window
    if (!ethereum) return
    // ethereum.removeAllListeners()
    this.listeners.forEach((fn: Function, evt: string) => ethereum?.removeAllListeners(evt, fn))
  }
  onMessage(msg: any) {
    console.info(msg, 'MetaMask onMessage')
  }
  async listen() {
    const { ethereum } = window
    if (!ethereum) return
    this.unlisten()
    this.listeners.set('accountsChanged', this.updateAccounts.bind(this))
    this.listeners.set('connect', this.updateAccounts.bind(this))
    this.listeners.set('disconnect', this.updateAccounts.bind(this))
    this.listeners.set('chainChanged', this.updateProvider.bind(this))
    this.listeners.set('message', this.onMessage.bind(this))
    this.listeners.forEach((fn: Function, evt: string) => ethereum.addListener(evt, fn))
    // Get
    const [chainId, accounts] = (await Promise.all([getChainId(), getAccounts(ethereum)])) || []
    if (chainId) this.updateProvider(chainId)
    if (accounts) this.updateAccounts(accounts)
  }
  disconnect() {
    this.unlisten()
    this.onboarding.stopOnboarding()
    if ([WalletState.CONNECTING, WalletState.INSTALLING].includes(this.state)) this.resetState()
    localStorage.removeItem('metamask.injected')
    this.updateAccounts([])
    this.updateProvider()
  }
  get installText() {
    return `${screen.isMobi ? 'Open in' : 'Install'} MetaMask`
  }
  async install() {
    if (screen.isMobi) location.href = import.meta.env.VITE_APP_METAMASK_DEEPLINK
    else {
      this.state = WalletState.INSTALLING
      this.onboarding.stopOnboarding()
      this.onboarding.startOnboarding()
    }
  }
  async connect() {
    this.inited = true
    this.resetState()
    const ethereum = await detectEthereum()
    if (!ethereum) this.resetState()
    switch (this.state) {
      case WalletState.CONNECTING:
      case WalletState.INSTALLING:
      case WalletState.NOT_INSTALLED:
        return
    }
    this.disconnect()
    if (!ethereum) return
    localStorage.setItem('metamask.injected', '1')
    this.state = WalletState.CONNECTING
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      this.updateAccounts(accounts)
      this.listen()
      this.state = WalletState.CONNECTED
    } catch (err) {
      emitErr(err)
      this.state = WalletState.DISCONNECTED
      throw err
    } finally {
      this.updateProvider(await getChainId())
    }
  }
}

export default MetaMask
