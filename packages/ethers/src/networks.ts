import { AllNetworks, unknownNetwork, EtherNetworks } from './constants/networks'

const isProd = import.meta.env.MODE === 'production'
const mainnetOffline = !!import.meta.env.VITE_APP_DISABLEMAINNET
export const Networks: Networks = AllNetworks

export const [mainnetChainId, testnetS, testnetG] = EtherNetworks
export const defaultChainId =
  isProd && !mainnetOffline ? mainnetChainId : import.meta.env.VITE_APP_TESTNET_G ? testnetG : testnetS

// This may return wrong network value if no req provided
// If you want to get current network, please use `userBridge/getNetwork` instead
export const getNetwork = (req?: string, exactly: boolean = false): NetworkInfo => {
  const def = exactly
    ? unknownNetwork
    : Networks[Network.chainId] ?? Networks[Network.defaultChainId] ?? Networks[mainnetChainId]
  if (req === undefined) return def
  let res = Networks[req] ?? Object.values(Networks).find((r) => r.name === req)
  return res ?? def
}

export class Network {
  public static readonly mainnetChainId: ChainId = mainnetChainId
  public static readonly defaultChainId: ChainId = defaultChainId
  public static chainId: ChainId
  public Networks: typeof Networks
  public opts: Record<string, unknown> = {}
  private _chainId: ChainId
  constructor(chainId?: ChainId, opts = {}) {
    this._chainId = this.chainId = chainId || Network.defaultChainId
    this.Networks = Networks
    Object.assign(this.opts, opts)
  }
  get chainId(): ChainId {
    return this._chainId
  }
  set chainId(chainId: ChainId) {
    Network.chainId = this._chainId = (chainId as any)?.value ?? chainId
  }
  get isMainnet() {
    return [Network.mainnetChainId].includes(this.chainId)
  }
  get current() {
    return this.Networks[this.chainId] ?? unknownNetwork
  }
  get default() {
    return this.Networks[defaultChainId]
  }
  get unSupported() {
    return this.current.name === 'unknown'
  }
  get isDefaultNet() {
    return this.current.chainId === defaultChainId
  }
  get mainnetOffline() {
    return this.isMainnet && mainnetOffline
  }
  get disabled() {
    return this.unSupported || this.mainnetOffline
  }
  get isTestnet() {
    return this.current.name === 'testnet'
  }
  get provider() {
    return this.current.provider
  }
  get providerWs() {
    return this.current.providerWs
  }
  get title() {
    return this.isMainnet ? '' : this.current.title
  }
  get name() {
    return this.current.name
  }
}
export default Network
