// ethers-multicall
import { Contract, Provider } from './ethers-multicall'
//
import { getContracts, getABI, useBridgeAsync } from '../useBridge'

let MultiCallProvider: any

export const getMultiCallProvider = async () => {
  const {
    bridge: { provider }
  } = await useBridgeAsync()
  await provider.ready
  const { chainId: bridgeChainId } = await provider.getNetwork()
  let { chainId } = MultiCallProvider?._provider?.network ?? {}
  if (!chainId || chainId != bridgeChainId) MultiCallProvider = new Provider(provider, bridgeChainId)
  return MultiCallProvider
}

export const getMultiCallContract = async (name: string, { forceMainnet = false, address = '', abiName = '' } = {}) => {
  const provider = await getMultiCallProvider()
  if (!address) {
    address = getContracts(name, forceMainnet)
    if (!address) throw new Error(`Contract ${name} not found`)
  }
  const abi = await getABI(abiName || name)
  return { MultiCallContract: new Contract(address, abi), MultiCallProvider: provider }
}

export default getMultiCallContract
