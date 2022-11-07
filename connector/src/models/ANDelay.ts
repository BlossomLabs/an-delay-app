import { DelayAppData, IANDelayConnector } from '../types'
import { DelayScript } from './DelayScripts'

export class ANDelay {
  #connector: IANDelayConnector

  readonly appAddress: string
  readonly orgAddress: string
  readonly executionDelay: string

  constructor(data: DelayAppData, connector: IANDelayConnector) {
    this.#connector = connector

    this.appAddress = data.appAddress
    this.orgAddress = data.orgAddress
    this.executionDelay = data.executionDelay
  }

  delayScripts(first: number, skip: number): Promise<DelayScript[]> {
    return this.#connector.delayScripts(this.appAddress, first, skip)
  }
}
