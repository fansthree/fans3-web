export const ensureMetaMaskInjected = () => window.ethereum?.isMetaMask && localStorage.getItem('metamask.injected')
export const getChainId = async () => await window.ethereum?.request({ method: 'eth_chainId' })
// !!! ethereum.chainId is deprecated, but this may make getter faster
export const getChainIdSync = () => ensureMetaMaskInjected() && window.ethereum?.chainId
export const getAccounts = (ethereum: any) => ethereum.request({ method: 'eth_accounts' })

let resolved = false
const detectEthereum = (): Promise<any> => {
  return new Promise((resolve) => {
    if (resolved) resolve(window.ethereum)
    const resolver = () => {
      resolved = true
      resolve(window.ethereum)
      window.removeEventListener('ethereum#initialized', detectChainId)
    }
    let retryTimes = 0
    const detectChainId = async () => {
      const chainId = await getChainId()
      if (chainId) resolver()
      else if (retryTimes++ < 30) setTimeout(detectChainId, 10)
      else resolver()
    }
    if (window.ethereum) {
      detectChainId()
    } else {
      window.addEventListener('ethereum#initialized', detectChainId, { once: true })
      setTimeout(resolver, 3000)
    }
  })
}

export default detectEthereum
