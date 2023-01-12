import { ErrorException, ErrorNotFound } from '@1hive/connect-core'
import { QueryResult } from '@1hive/connect-thegraph'
import { DelayedScriptData } from '../../types'
import { DelayedScript } from '../../models/DelayedScript'

export const parseDelayedScript = (
  result: QueryResult
): DelayedScript | null => {
  const delayedScript = result.data.delayedScript

  if (!delayedScript) {
    throw new ErrorNotFound('Unable to parse delayed script')
  }

  const {
    creator,
    evmCallScript,
    executionTime,
    index,
    pausedAt,
    timeSubmitted,
    totalTimePaused,
    feeAmount
  } = delayedScript

  return {
    creator,
    evmCallScript,
    executionTime,
    id: index,
    pausedAt,
    timeSubmitted,
    totalTimePaused,
    feeAmount
  }
}

export const parseDelayedScripts = (result: QueryResult): DelayedScript[] => {
  const delayedScripts = result.data.delayedScripts as unknown[]

  if (!delayedScripts) {
    throw new ErrorException('Unable to parse delay scripts')
  }

  return delayedScripts.map(
    (delayedScript) => new DelayedScript(delayedScript as DelayedScriptData)
  )
}
