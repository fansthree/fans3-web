// https://github.com/cavanmflynn/ethers-multicall@v0.2.1
import { Contract } from './contract'
import { Provider, setMulticallAddress } from './provider'
import type { ContractCall } from './types'

export { Contract, Provider, ContractCall, setMulticallAddress }
export default { Contract, Provider, setMulticallAddress }
