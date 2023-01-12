import { DelayedScriptData } from '../types'

export class DelayedScript {
  readonly id: string
  readonly creator: string
  readonly evmCallScript: string
  readonly executionTime: string
  readonly pausedAt: string
  readonly timeSubmitted: string
  readonly totalTimePaused: string
  readonly feeAmount: string

  constructor(data: DelayedScriptData) {
    this.id = data.index
    this.creator = data.creator
    this.evmCallScript = data.evmCallScript
    this.executionTime = data.executionTime
    this.pausedAt = data.pausedAt
    this.timeSubmitted = data.timeSubmitted
    this.totalTimePaused = data.totalTimePaused
    this.feeAmount = data.feeAmount
  }
}
