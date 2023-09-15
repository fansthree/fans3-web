import { toUtf8String } from 'ethers'
import { useBridgeAsync } from './useBridge'

export const ErrorCodeMap: Record<string, string> = {
  1006: 'Disconnected',
  4001: 'User denied.',
  '-32000': 'Execution Reverted'
}

export const parseRevertReason = async (err: any): Promise<string> => {
  let { reason = '', transaction } = err
  if (reason) {
    err.message = reason
    if (!reason.includes(': ') && transaction) {
      const bridgeStore = await useBridgeAsync()
      try {
        const code = await bridgeStore.bridge.provider.call(transaction)
        reason = toUtf8String(code)
        err.message = reason
      } catch {}
    }
  }
  return reason
}

export const normalizeTxErr = async (raw: any, callData?: any) => {
  let { code = '' } = raw
  const { error, data } = raw
  if (code === 'ACTION_REJECTED') raw.code = code = 4001
  if (error?.code && ![-32000, 4001].includes(error.code)) raw.code = code = error.code
  if (data) raw.message = data.message
  const customMsg = ErrorCodeMap[code] || ErrorCodeMap[raw.message]
  if (customMsg) raw.message = customMsg
  else await parseRevertReason(raw)
  if (callData) raw.callData = callData
  const err: any = new Error(code)
  Object.assign(err, { code, message: `[${code}] ${raw.message}` })
  return err
}
