import { DelayScriptData } from "../types"

export class DelayScript {
  readonly executionTime: string
  readonly pausedAt: string
  readonly evmCallScript: string

  constructor(data: DelayScriptData) {
    this.executionTime = data.executionTime
    this.pausedAt = data.pausedAt
    this.evmCallScript = data.evmCallScript
  }
}