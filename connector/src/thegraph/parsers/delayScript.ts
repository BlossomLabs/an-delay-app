import { ErrorException } from '@1hive/connect-core'
import { QueryResult } from '@1hive/connect-thegraph'
import { DelayScriptData } from '../../types'
import { DelayScript } from '../../models/DelayScript'

export const parseDelayScripts = (result: QueryResult): DelayScript[] => {
  const delayScripts = result.data.delayScripts as unknown[]

  if (!delayScripts) {
    throw new ErrorException('Unable to parse delay scripts')
  }

  return delayScripts.map((delayScript) => new DelayScript(delayScript as DelayScriptData))
}
