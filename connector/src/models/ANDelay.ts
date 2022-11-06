import { DelayAppData, IANDelayConnector } from '../types'

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

}
