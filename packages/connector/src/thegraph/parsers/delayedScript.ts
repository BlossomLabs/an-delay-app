import { ErrorException } from '@1hive/connect-core'
import { QueryResult } from '@1hive/connect-thegraph'
import { DelayedScriptData } from '../../types'
import { DelayedScript } from '../../models/DelayedScript'

export const parseDelayedScripts = (result: QueryResult): DelayedScript[] => {
  const delayedScripts = result.data.delayedScripts as unknown[]

  if (!delayedScripts) {
    throw new ErrorException('Unable to parse delay scripts')
  }

  return delayedScripts.map((delayedScript) => new DelayedScript(delayedScript as DelayedScriptData))
}
