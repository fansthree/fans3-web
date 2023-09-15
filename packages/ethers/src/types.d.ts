/// <reference types="ethers" />

declare type Address = `0x${string}` | string
declare type TokenID = string
declare type TokenURI = string

declare interface Meta {
  name?: string
  description?: string
  image?: string
  raw?: string
  creator?: string
  owner?: string
  publisher?: string
  external_link?: string
  background_color?: string
  properties?: Record<string, any>
  mediaType?: string
}

declare interface NFTToken {
  minter?: string
  address?: Address
  tokenID?: TokenID
  name?: string
  uri?: string // ERC1155 asis ERC721 tokenURI
  tokenURI?: string
  block?: number
  ctime?: number
  utime?: number
  meta?: Meta
  // Details
  owner?: Address
  value?: number
  total?: string
  txHash?: Address
  txs?: NFTTokenTxs
  seq?: string
  approved?: boolean
}
declare interface Token {
  name?: string
  address: Address
  id?: TokenID
  meta?: Meta
  contract?: Address
}

declare type Tokenish = NFTToken | Token | string | any
declare type NFTTokenish = NFTToken | any
declare type NFTTokenTxCate = string | 'mint' | 'burn' | 'transfer' | 'unknown'

declare interface NFTTokenTx {
  txHash: Address
  ts: number
  from: Address
  to: Address
  block: number
  cate: NFTTokenTxCate
}
declare type NFTTokenTxs = NFTTokenTx[]

declare type getContractOpts = {
  forceMainnet?: boolean
  address?: string
  abiName?: string
  account?: Address
  requireAccount?: boolean
}

declare interface useBridgeOptions {
  chainId?: ChainId
  provider?: JsonRpcProvider | WebSocketProvider
  rpc?: string
  autoConnect?: boolean
  persistent?: boolean // ignore injected ethereum
}
