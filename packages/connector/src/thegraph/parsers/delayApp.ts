import { QueryResult } from '@1hive/connect-thegraph'
import { DelayAppData } from '../../types'

export const parseDelayApp = (result: QueryResult): DelayAppData | null => {
  const delayApp = result.data.delayApp

  if (!delayApp) {
    return null
  }

  const { appAddress, executionDelay, id, orgAddress } = delayApp

  return { appAddress, executionDelay, id, orgAddress }
}
