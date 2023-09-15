import { ZERO } from './utils'
import { assignOverrides, getTokenContract } from './useBridge'
import { txReceipt } from './txReceipt'

export const getTokenApproved = async (token: NFTToken): Promise<Address> => {
  const contract = await getTokenContract(token)
  return await contract.getApproved(token.tokenID)
}

// to ZERO address means unapprove
export const approveNFTToken = async (
  account: Address,
  token: NFTToken,
  to: Address = ZERO,
  { all, receipt = false } = <any>{}
) => {
  const { tokenID } = token
  const contract = await getTokenContract(token, { account })
  // let estimatedGas
  const forAll = typeof all === 'boolean'
  const method = forAll ? 'setApprovalForAll' : 'approve'
  const overrides = {} as any
  const parameters = forAll ? [to, all, overrides] : [to, tokenID, overrides]
  await assignOverrides(overrides, contract, method, parameters)
  const tokenCall = contract[method](...parameters)
  if (!receipt) return await tokenCall
  const isUnApprove = forAll ? all === false : to === ZERO
  return new txReceipt(tokenCall, {
    seq: {
      type: 'approve',
      title: isUnApprove ? `Unapproval` : `Approval`,
      ts: new Date().getTime(),
      overrides
    }
  })
}
