import { State, property } from '@lit-app/state'
import icon from './wallet/metamask/icon.svg'
import { shortAddress } from './utils'
import Provider from './provider'
import { getNetwork } from './networks'
import detectEthereum, { getAccounts } from './detectEthereum'
import { WalletState, emitWalletChange } from './wallet'
import { EtherNetworks } from './constants/networks'
import MetaMask from './wallet/metamask'

type WalletApp = {
  name: string
  title: string
  icon: string
  app: any
  import: () => Promise<any>
  state?: WalletState
}

type WalletList = WalletApp[]

export const Wallets: WalletList = [
  {
    name: 'metamask',
    title: 'MetaMask',
    icon,
    app: undefined,
    import: async () => {
      // const MetaMask = (await import(`./wallet/metamask`)).default
      return new MetaMask(Provider())
    }
  }
]

class WalletStore extends State {
  @property({ value: undefined, type: Object }) wallet!: any
  get account(): string {
    return this.wallet?.account ?? ''
  }
}
export const walletStore = new WalletStore()

export class Bridge {
  public selected: WalletApp | undefined
  public wallets: WalletList
  public promise: any
  public Provider: any
  public store: any
  constructor(options?: useBridgeOptions) {
    this.wallets = Wallets
    this.Provider = Provider(options)
    this.selected = undefined
    this.promise = undefined
    this.store = walletStore
  }
  alreadyTried = false
  get wallet() {
    return walletStore.wallet
  }
  async switchNetwork(chainId: ChainId) {
    const { chainId: currentChainId } = this.network
    if (currentChainId === chainId) return
    const target = getNetwork(chainId)
    const { ethereum } = window
    if (ethereum) {
      const isEtherNetwork = EtherNetworks.includes(chainId)
      const method = isEtherNetwork ? 'wallet_switchEthereumChain' : 'wallet_addEthereumChain'
      const param = { chainId: target.chainId }
      if (!isEtherNetwork)
        Object.assign(param, {
          chainName: target.name,
          nativeCurrency: target.native ?? { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
          rpcUrls: [target.provider],
          blockExplorerUrls: [target.scan],
          iconUrls: ['']
        })
      try {
        await ethereum.request({
          method,
          params: [param]
        })
      } catch (err) {
        console.error(err)
      }
    } else {
      this.Provider.update({ chainId })
    }
  }
  async regToken(token: Tokenish, { alt = false, ext = 'svg' } = {}) {
    const { ethereum } = window
    if (!ethereum || !token) return
    const { address, symbol, decimals } = token
    ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC721',
        options: {
          address,
          symbol,
          decimals,
          image: `/${address}/logo${alt ? '-alt' : ''}.${ext}`
        }
      }
    })
  }
  get provider() {
    return this.Provider.provider
  }
  get network() {
    return this.Provider.network
  }
  get account(): string {
    return this.wallet?.account ?? this.connectedAccounts[0] ?? ''
  }
  get shortAccount() {
    return shortAddress(this.account)
  }
  get state() {
    return this.wallet?.state ?? this.selected?.app?.state ?? WalletState.CONNECTING
  }
  get isConnected() {
    return this.state === WalletState.CONNECTED
  }
  connecting: any = undefined
  connectedAccounts = []
  async tryConnect(options: useBridgeOptions = {}) {
    const { autoConnect = false } = options
    if (!this.connecting)
      this.connecting = (async () => {
        if (this.wallet?.inited) return
        let { ethereum } = window
        if (autoConnect || !ethereum) ethereum = await detectEthereum()
        if (ethereum?.isMetaMask && localStorage.getItem('metamask.injected')) {
          this.connectedAccounts = (await getAccounts(ethereum)) || []
          if (this.connectedAccounts[0]) await this.select(0)
        }
        this.connecting = undefined
        this.alreadyTried = true
      })()
    return this.connecting
  }
  async connect() {
    return this.wallet?.connect()
  }
  async disconnect() {
    return this.wallet?.disconnect()
  }
  async install() {
    return this.wallet?.install()
  }
  unselect() {
    if (this.selected) {
      this.selected.app?.disconnect()
      this.selected = undefined
    }
  }
  async select(i: number = 0) {
    const selected = (this.selected = this.wallets[i])
    if (!this.promise)
      this.promise = (async () => {
        if (!selected.app) selected.app = await selected.import()
        const wallet = selected.app
        try {
          await wallet.connect()
        } catch (err) {
          throw err
        } finally {
          this.promise = undefined
        }
        // if (wallet.state === WalletState.CONNECTED) this.wallet = walletStore.wallet = wallet
        walletStore.wallet = wallet
        emitWalletChange()
        return this.wallet
      })()
    return this.promise
  }
}

export default Bridge
