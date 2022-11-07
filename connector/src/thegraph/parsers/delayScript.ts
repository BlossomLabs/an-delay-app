import { ErrorException } from '@1hive/connect-core'
import { QueryResult } from '@1hive/connect-thegraph'
import { DelayScript } from '../../models/DelayScripts'

export const parseDelayScripts = (result: QueryResult): DelayScript[] => {
  const delayScripts = result.data.delayScripts as any[]

  if (!delayScripts) {
    throw new ErrorException('Unable to parse delay scripts')
  }

  return delayScripts.map((delayScript) => new DelayScript(delayScript))
}
