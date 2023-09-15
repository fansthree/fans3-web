// All Networks
export const AllNetworks = {
  '0x1': {
    chainId: '0x1',
    title: 'Mainnet',
    name: 'mainnet',
    scan: 'https://etherscan.io',
    icon: ''
  },
  '0xaa36a7': {
    chainId: '0xaa36a7',
    title: 'Sepolia Testnet',
    name: 'SepoliaTestnet',
    scan: 'https://sepolia.etherscan.io',
    icon: ''
  },
  '0x5': {
    chainId: '0x5',
    title: 'Görli Testnet',
    name: 'GoerliTestnet',
    scan: 'https://goerli.etherscan.io',
    icon: ''
  }
}
export const EtherNetworks = ['0x1', '0xaa36a7', '0x5']

export const unknownNetwork = {
  title: 'Unsupported Network',
  name: 'unknown',
  chainId: '',
  provider: '',
  scan: '',
  icon: ''
}

export default AllNetworks
