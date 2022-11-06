export type Address = string

export type SubscriptionHandler = { unsubscribe: () => void }
export type SubscriptionCallback<T> = (error: Error | null, data?: T) => void
export type SubscriptionStart<T> = (
  callback: SubscriptionCallback<T>
) => SubscriptionHandler
export type SubscriptionResult<T> = SubscriptionHandler | SubscriptionStart<T>

export interface DelayAppData {
  id: string
  appAddress: string
  orgAddress: string
  executionDelay: string
}

export interface DelayScriptData {
  id: string
  evmCallScript: string
  executionTime: number
  pausedAt: number
}

export interface IANDelayConnector {
  delayApp(appAddress: Address): Promise<DelayAppData>
  onDelayApp(
    appAddress: Address,
    callback: SubscriptionCallback<DelayAppData>
  ): SubscriptionHandler
  delayScripts(appAddress: Address): Promise<DelayScriptData>
  onDelayScripts(
    appAddress: Address,
    first: number,
    skip: number,
    callback: SubscriptionCallback<DelayScriptData>
  ): SubscriptionHandler
}
