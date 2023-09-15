import emitter from '@fans3/core/src/emitter'
import { sleep } from './utils'

export enum WalletState {
  DISCONNECTED = 'Disconnected',
  CONNECTED = 'Connected',
  CONNECTING = 'Connecting...',
  NOT_INSTALLED = 'Not Installed',
  INSTALLED = 'Installed',
  INSTALLING = 'Installing...',
  WAITING = 'Waiting...'
}

export const emitWalletChange = async () => {
  emitter.emit('wallet-changed')
  await sleep(0)
  emitter.emit('force-request-update')
}
