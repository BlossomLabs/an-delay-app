import { ErrorNotFound } from '@1hive/connect-core'
import { QueryResult } from '@1hive/connect-thegraph'
import { DelayAppData } from '../../types'

export const parseDelayApp = (result: QueryResult): DelayAppData | null => {
  const delayApp = result.data.delayApp

  if (!delayApp) {
    throw new ErrorNotFound('Unable to parse delay app data')
  }

  const {
    appAddress,
    executionDelay,
    id,
    orgAddress,
    feeAmount,
    feeDestination,
    feeToken,
  } = delayApp
  const { address, decimals, name, symbol } = feeToken

  return {
    appAddress,
    executionDelay,
    id,
    orgAddress,
    feeAmount,
    feeDestination,
    feeToken: {
      address,
      decimals,
      name,
      symbol,
    }
  }
}
