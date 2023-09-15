import { State, property } from '@lit-app/state'
import Network, { Networks } from './networks'
import Contracts from './constants/contracts'
import { Bridge, walletStore } from './bridge'
import emitter from '@fans3/core/src/emitter'
import { gasLimit, nowTs } from './utils'
import { normalizeTxErr } from './parseErr'
import { Contract, formatUnits } from 'ethers'
export { StateController } from '@lit-app/state'

// Singleton Data
class BridgeStore extends State {
  @property({ value: 0 }) blockNumber!: number
  @property({ value: undefined, type: Object }) bridge!: Bridge
  @property({ value: 0 }) _account: string = ''
  constructor() {
    super()
    emitter.on('wallet-changed', () => {
      this.reset() //  Trick for bridge.network cantnot update immediately probs
      this._account = walletStore.account
    })
  }
  get stateTitle(): string {
    return this.bridge.state || ''
  }
  get wallet(): any {
    return walletStore.wallet
  }
  get account(): any {
    return walletStore.account || this._account || ''
  }
  get envKey(): string {
    return `${this.bridge.network.chainId}.${this.bridge.account}`
  }
  get noAccount() {
    return (this.wallet?.inited === true || this.bridge.alreadyTried) && !this.account
  }
  get noNetwork() {
    return this.bridge.network.disabled
  }
  get notReady() {
    return this.noAccount || this.noNetwork
  }
  get key() {
    return this.account + this.bridge.network.chainId
  }
}
export const bridgeStore = new BridgeStore()

class BlockPolling {
  public timer: any
  public interval: number
  public blockTs: number
  public blockDebounce: { timer: any; interval: number }
  constructor() {
    this.interval = 15 * 1000
    this.blockTs = 0
    this.blockDebounce = { timer: null, interval: 50 }
    this.getBlockNumber()
    // Events
    emitter.on('tx-success', () => this.broadcast())
    emitter.on('network-change', () => {
      this.reset()
      this.listenProvider()
    })
    this.listenProvider()
    // Polling
    this.polling()
  }
  get block() {
    return bridgeStore.blockNumber
  }
  set block(v: number) {
    bridgeStore.blockNumber = v
  }
  getBlockNumber = async () => {
    this.block = await bridgeStore.bridge.provider.getBlockNumber()
  }
  polling() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      // Simulate block increment by per 12s
      this.block += Math.floor((nowTs() - this.blockTs) / 12000)
      this.broadcast()
    }, this.interval)
  }
  reset() {
    clearTimeout(this.blockDebounce.timer)
    clearTimeout(this.timer)
    this.block = 0
    this.blockTs = 0
    Object.assign(this.blockDebounce, { timer: null, interval: 50 })
  }
  async listenProvider() {
    bridgeStore.bridge.provider.on('block', this.onBlock.bind(this))
  }
  onBlock(block: number) {
    if (block <= this.block) return
    const { timer, interval } = this.blockDebounce
    if ((this.blockTs = nowTs()) - this.blockTs < interval) clearTimeout(timer)
    // Ignore first init
    if (this.block) Object.assign(this.blockDebounce, { timer: setTimeout(() => this.broadcast(block), interval) })
    this.block = block
  }
  broadcast(block = this.block) {
    // if (!block) block = (await bridgeStore.bridge.provider.getBlockNumber()) || this.block
    emitter.emit('block-polling', block + '')
    this.polling()
  }
}

const initBridge = (options?: useBridgeOptions) => {
  if (!bridgeStore.bridge) {
    bridgeStore.bridge = new Bridge(options)
    new BlockPolling()
  }
  return bridgeStore.bridge
}

const wrapBridge = () => {
  return {
    bridgeStore,
    blockNumber: bridgeStore.blockNumber,
    stateTitle: bridgeStore.stateTitle,
    envKey: bridgeStore.envKey,
    bridge: bridgeStore.bridge
  }
}

export default (options?: useBridgeOptions) => {
  initBridge(options).tryConnect(options)
  return wrapBridge()
}

export const useBridgeAsync = async (options?: useBridgeOptions) => {
  await initBridge(options).tryConnect(options)
  return wrapBridge()
}

export const getABI = async (name: string) => (await import(`./abi/${name}.json`)).default
export const getBridge = async () => (await useBridgeAsync()).bridge
export const getBridgeProvider = async () => (await getBridge()).provider
export const getWalletAccount = async () =>
  ((await (await getBridgeProvider()).send('eth_requestAccounts')) ?? [])[0] ?? ''
export const getAccount = async (force = false) => (force ? await getWalletAccount() : (await getBridge()).account)
export const getNetwork = async () => (await getBridge()).network.current
export const getNetworkSync = () => Networks[Network.chainId]
export const getChainId = async () => (await getNetwork()).chainId
export const getEnvKey = async (key = '', withoutAddr = false) =>
  (withoutAddr ? await getChainId() : (await useBridgeAsync()).envKey) + (key ? `.${key}` : '')
export const getSigner = async (account: string) =>
  (await getBridge()).provider.getSigner(account || (await getAccount()))
export const getBlockNumber = async () => {
  const { blockNumber } = await useBridgeAsync()
  return bridgeStore.blockNumber ?? blockNumber
}
export const getNonce = async (address?: string) => {
  if (!address) address = await getAccount()
  return await bridgeStore.bridge.provider.getTransactionCount(address)
}
export const getGraph = async (path = '') => ((await getNetwork()).graph ?? '') + path

// offest: past seconds, default: 0 (current block)
// blockNumber, default: current block
export const getBlockTimestamp = async ({ offset = 0, blockNumber = 0 } = {}) => {
  if (!blockNumber) blockNumber = await getBlockNumber()
  const { timestamp } = await bridgeStore.bridge.provider.getBlock(blockNumber - offset / 3)
  return timestamp
}

export const getNativeBalance = async (address: string) =>
  formatUnits(await bridgeStore.bridge.provider.getBalance(address))

export const estimateGasLimit = async (
  contract: Contract,
  method: string,
  parameters = <any>[],
  limitPercent?: number
) => {
  let estimatedGas = BigInt(1000000)
  try {
    estimatedGas = BigInt(await contract[method].estimateGas(...parameters))
  } catch (err) {
    await normalizeTxErr(err, [method, parameters])
    throw err
  }
  const limit = gasLimit(estimatedGas)
  return limitPercent ? [limit, gasLimit(estimatedGas, limitPercent)] : limit
}

export const assignOverrides = async (overrides: any, ...args: any[]) => {
  let [contract, method, parameters, { gasLimitPer, nonce } = <any>{}] = args
  if (nonce || bridgeStore.bridge.provider.nonce) overrides.nonce = nonce || bridgeStore.bridge.provider.nonce
  let gasLimit
  try {
    if (gasLimitPer) {
      gasLimit = (<any[]>await estimateGasLimit(contract, method, parameters, gasLimitPer))[1]
    } else {
      gasLimit = await estimateGasLimit(contract, method, parameters)
    }
  } catch (err) {
    throw await normalizeTxErr(err)
  }
  Object.assign(overrides, { gasLimit })
}

export const getContracts = (name: string, forceMainnet = false): string => {
  const chainId = forceMainnet ? Network.mainnetChainId : Network.chainId
  return Contracts[name][chainId]
}

export const getContract = async (
  name: Address,
  { forceMainnet = false, address = getContracts(name, forceMainnet), account = '', requireAccount = false } = <
    getContractOpts
  >{}
) => {
  const abi = await getABI(name)
  if (!abi) throw new Error(`abi not found: ${name}`)
  if (!address && !abi) throw new Error(`Contract ${address} not found`)
  if (!account) account = await getAccount()
  if (!account && requireAccount) account = await getAccount()
  return new Contract(address, abi, await (account ? getSigner(account) : getBridgeProvider()))
}

export const getTokenContract = async (token: Tokenish, options = <getContractOpts>{}) =>
  await getContract(token.address || token.contract || token, { abiName: 'Erc721', ...options })
