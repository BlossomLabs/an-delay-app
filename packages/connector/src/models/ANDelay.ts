import type { App, ForwardingPath } from '@1hive/connect-core'
import { subscription } from '@1hive/connect-core'
import {
  Address,
  DelayAppData,
  ANDelayConnector,
  SubscriptionCallback,
} from '../types'
import { DelayedScript } from './DelayedScript'

type QueryOpts = {
  first: number
  skip: number
}

export class ANDelay {
  #app: App
  #connector: ANDelayConnector

  constructor(app: App, connector: ANDelayConnector) {
    this.#app = app
    this.#connector = connector
  }

  async disconnect(): Promise<void> {
    this.#connector.disconnect()
  }

  appData(): Promise<DelayAppData> {
    return this.#connector.delayApp(this.#app.address)
  }

  onAppData(
    callback?: SubscriptionCallback<DelayAppData>
  ): SubscriptionCallback<DelayAppData> {
    return subscription<DelayAppData>(callback, (callback) =>
      this.#connector.onDelayApp(this.#app.address, callback)
    )
  }

  delayedScripts({ first = 1000, skip = 0 }: Partial<QueryOpts> = {}): Promise<
    DelayedScript[]
  > {
    return this.#connector.delayedScripts(this.#app.address, first, skip)
  }

  onDelayedScripts(
    { first = 1000, skip = 0 }: Partial<QueryOpts> = {},
    callback?: SubscriptionCallback<DelayedScript[]>
  ): SubscriptionCallback<DelayedScript[]> {
    return subscription<DelayedScript[]>(callback, (callback) =>
      this.#connector.onDelayedScripts(this.#app.address, first, skip, callback)
    )
  }

  async setExecutionDelay(
    executionDelay: number,
    signerAddress: Address
  ): Promise<ForwardingPath> {
    const intent = await this.#app.intent(
      'setExecutionDelay',
      [executionDelay],
      { actAs: signerAddress }
    )

    return intent
  }

  async delayExecution(
    evmCallScript: string,
    signerAddress: Address
  ): Promise<ForwardingPath> {
    const intent = await this.#app.intent('delayExecution', [evmCallScript], {
      actAs: signerAddress,
    })

    return intent
  }

  async pauseExecution(
    delayedScriptId: number,
    signerAddress: Address
  ): Promise<ForwardingPath> {
    const intent = await this.#app.intent('pauseExecution', [delayedScriptId], {
      actAs: signerAddress,
    })

    return intent
  }

  async resumeExecution(
    delayedScriptId: number,
    signerAddress: Address
  ): Promise<ForwardingPath> {
    const intent = await this.#app.intent(
      'resumeExecution',
      [delayedScriptId],
      { actAs: signerAddress }
    )

    return intent
  }

  async cancelExecution(
    delayedScriptId: number,
    signerAddress: Address
  ): Promise<ForwardingPath> {
    const intent = await this.#app.intent(
      'cancelExecution',
      [delayedScriptId],
      { actAs: signerAddress }
    )

    return intent
  }

  async execute(
    delayedScriptId: number,
    signerAddress: Address
  ): Promise<ForwardingPath> {
    const intent = await this.#app.intent('execute', [delayedScriptId], {
      actAs: signerAddress,
    })

    return intent
  }
}
