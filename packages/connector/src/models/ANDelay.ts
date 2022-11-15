import type { App } from '@1hive/connect-core'
import { subscription } from '@1hive/connect-core'
import { DelayAppData, ANDelayConnector, SubscriptionCallback } from '../types'
import { DelayedScript } from './DelayedScript'

type QueryOpts = {
  first: number
  skip: number
}

const DEFAULT_FIRST = 1000
const DEFAULT_SKIP = 0
export class ANDelay {
  #app: App
  #connector: ANDelayConnector

  constructor(app: App, connector: ANDelayConnector) {
    this.#app = app
    this.#connector = connector
  }

  get app(): App {
    return this.#app
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

  delayedScript(scriptId: string | number): Promise<DelayedScript> {
    return this.#connector.delayedScript(this.#app.address, scriptId)
  }

  onDelayedScript(
    scriptId: string | number,
    callback?: SubscriptionCallback<DelayedScript>
  ): SubscriptionCallback<DelayedScript> {
    return subscription<DelayedScript>(callback, (callback) =>
      this.#connector.onDelayedScript(this.#app.address, scriptId, callback)
    )
  }

  delayedScripts({
    first = DEFAULT_FIRST,
    skip = DEFAULT_SKIP,
  }: Partial<QueryOpts> = {}): Promise<DelayedScript[]> {
    return this.#connector.delayedScripts(this.#app.address, first, skip)
  }

  onDelayedScripts(
    { first = DEFAULT_FIRST, skip = DEFAULT_SKIP }: Partial<QueryOpts> = {},
    callback?: SubscriptionCallback<DelayedScript[]>
  ): SubscriptionCallback<DelayedScript[]> {
    return subscription<DelayedScript[]>(callback, (callback) =>
      this.#connector.onDelayedScripts(this.#app.address, first, skip, callback)
    )
  }
}
