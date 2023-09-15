import { normalizeTxErr } from './parseErr'
import { getTxQueue } from './txQueue'
import emitter from '@fans3/core/src/emitter'

export const getEventCodes = async (name: any): Promise<any> => {
  if (!name) return {}
  return typeof name === 'object' ? name : await import(`./abi/${name}.codes.json`)
}

export class txReceipt {
  public pending: boolean
  public status: number
  public hash: string
  public errorCodes: string | Record<string, string>
  public allowAlmostSuccess: boolean
  public seq: any
  public delay: any
  public err: Error | any
  public onSent: Function
  public onSuccess: Function
  public onError: Function
  public txPromise: PromiseLike<any>
  constructor(
    txPromise: PromiseLike<any>,
    {
      errorCodes = '',
      seq = undefined as any,
      delay = 0,
      allowAlmostSuccess = false,
      onSent = () => {},
      onSuccess = () => {},
      onError = () => {}
    } = {}
  ) {
    // super()
    this.pending = true
    this.status = -1 // -1: waiting tx, 0: error, 1: success, 2: confirmation, 3: ignored, 4: almostSuccess
    this.allowAlmostSuccess = allowAlmostSuccess
    this.txPromise = txPromise
    this.err = undefined
    this.hash = ''
    this.errorCodes = errorCodes
    this.seq = seq
    this.delay = delay
    this.onSent = onSent
    this.onSuccess = onSuccess
    this.onError = onError
  }
  get success() {
    return this.status === 1
  }
  get processing() {
    return this.status === 2
  }
  get almostSuccess() {
    return this.status === 4
  }
  get ignored() {
    return this.status === 3
  }
  async wait(onlyAwaitHash = false): Promise<boolean> {
    return (async () => {
      let awaitRes = false
      const eventMap = await getEventCodes(this.errorCodes)
      try {
        const tx = await this.txPromise
        this.onSent(tx)
        const { hash, nonce } = tx
        this.seq.nonce = nonce
        // Add to txs queue
        if (this.seq) {
          delete this.seq.overrides
          getTxQueue().add(Object.assign(this.seq, { hash }))
        }
        this.hash = hash
        this.status = 2
        const checkReceipt = async () => {
          const { status, events } = await tx.wait(1)
          if (status !== 1) {
            if (this.seq) this.seq.err = true
            throw new Error('Failed')
          }
          // Parse event error
          events.some(({ event, args }: any = {}) => {
            if (event === 'Failure') {
              let { info, detail, error } = args
              const code = error.toString() // Error Code
              const message = eventMap[error]
              const raw = {
                code,
                message,
                // Abi Event Outputs
                error,
                info: info?.toString(),
                detail: detail?.toString()
              }
              if (this.seq) this.seq.err = true
              const newErr = new Error(message)
              Object.assign(newErr, {
                code: code,
                raw: raw
              })
              if (this.allowAlmostSuccess) this.status = 4
              throw newErr
            }
          })
          this.status = 1
          if (this.seq) this.seq.done = true
          if (this.delay) getTxQueue().delDelay(hash, this.delay)
          else getTxQueue().del(hash)
        }
        if (onlyAwaitHash) {
          awaitRes = true
          checkReceipt()
        } else {
          await checkReceipt()
        }
        this.onSuccess(tx)
      } catch (err: any) {
        await normalizeTxErr(err)
        if (err.code === 4001) this.status = 3
        else if (this.status !== 4) this.status = 0
        this.err = err
        this.onError(err)
        throw err
      } finally {
        this.pending = false
        const success = this.status === 1
        emitter.emit('tx-status', this.hash)
        if (success) emitter.emit('tx-success', this.hash)
        // return this.status === 1
        awaitRes = success
      }
      return awaitRes
    })()
  }
}
