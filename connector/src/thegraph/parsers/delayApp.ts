import { QueryResult } from '@1hive/connect-thegraph'
import { ANDelay } from '../../models/ANDelay'

export const parseDelayApp = (
  result: QueryResult,
  connector: any
): ANDelay | null => {
  const delayApp = result.data.delayApp

  if (!delayApp) {
    return null
  }

  const { appAddress, executionDelay, id, orgAddress } = delayApp

  return new ANDelay({ appAddress, executionDelay, id, orgAddress }, connector)
}

