import { DelayedScriptData } from "../types"

export class DelayedScript {
  readonly executionTime: string
  readonly pausedAt: string
  readonly evmCallScript: string

  constructor(data: DelayedScriptData) {
    this.executionTime = data.executionTime
    this.pausedAt = data.pausedAt
    this.evmCallScript = data.evmCallScript
  }
}