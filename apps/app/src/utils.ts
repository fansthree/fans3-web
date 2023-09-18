import { getContract } from '@fans3/ethers/src/useBridge'
import { CONTRACT_ADDRESS } from './constants'

export const twitterName = (item: any) => {
  return fetch('http://147.139.3.9:8000/user?address=' + item)
    .then((blob) => blob.json())
    .then((data) => {
      return data.name
    })
}

export const holding = (holdee: any, holder: any) => {
  return getContract('Fans3Shares', { address: CONTRACT_ADDRESS }).then((contract) => {
    return contract
      .sharesBalance(holdee, holder)
      .then((balance) => {
        return balance
      })
      .catch(() => {
        return 0
      })
  })
}
