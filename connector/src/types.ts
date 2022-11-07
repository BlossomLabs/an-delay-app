import { ANDelay } from './models/ANDelay'
import { DelayScript } from './models/DelayScript'

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
  executionTime: string
  pausedAt: string
}

export interface IANDelayConnector {
  disconnect(): Promise<void>
  delayApp(appAddress: Address): Promise<DelayAppData>
  onDelayApp(
    appAddress: Address,
    callback: SubscriptionCallback<DelayAppData>
  ): SubscriptionHandler
  delayScripts(
    appAddress: Address,
    first: number,
    skip: number
  ): Promise<DelayScript[]>
  onDelayScripts(
    appAddress: Address,
    first: number,
    skip: number,
    callback: SubscriptionCallback<DelayScript[]>
  ): SubscriptionHandler
}
