import { getContract } from '@fans3/ethers/src/useBridge'
import { API_URL, CONTRACT_ADDRESS } from './constants'
import { html } from '@fans3/ui/src/shared/TailwindElement'
import '@fans3/ui/src/link'

export const twitterName = (item: any) => {
  return fetch(API_URL + '/user?address=' + item)
    .then((blob) => blob.json())
    .then((data) => {
      return html`<ui-link href="https://twitter.com/intent/user?user_id=${data.t_id}">${data.name}</ui-link>`
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
