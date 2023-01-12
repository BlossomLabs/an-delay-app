import { DelayedScript } from './models/DelayedScript'

export type Address = string

export type SubscriptionHandler = { unsubscribe: () => void }
export type SubscriptionCallback<T> = (error: Error | null, data?: T) => void
export type SubscriptionStart<T> = (
  callback: SubscriptionCallback<T>
) => SubscriptionHandler
export type SubscriptionResult<T> = SubscriptionHandler | SubscriptionStart<T>

export interface ERC20 {
  address: string
  name: string
  decimals: string
  symbol: string
}
export interface DelayAppData {
  id: string
  appAddress: string
  orgAddress: string
  executionDelay: string
  feeAmount: string
  feeDestination: string
  feeToken: ERC20
}

export interface DelayedScriptData {
  id: string
  index: string
  creator: string
  evmCallScript: string
  executionTime: string
  pausedAt: string
  timeSubmitted: string
  totalTimePaused: string
  feeAmount: string
}

export interface ANDelayConnector {
  disconnect(): void
  delayApp(appAddress: Address): Promise<DelayAppData>
  onDelayApp(
    appAddress: Address,
    callback: SubscriptionCallback<DelayAppData>
  ): SubscriptionHandler
  delayedScript(
    appAddress: Address,
    scriptId: string | number,
  ): Promise<DelayedScript>
  onDelayedScript(
    appAddress: Address,
    scriptId: string | number,
    callback: SubscriptionCallback<DelayedScript>
  ): SubscriptionHandler
  delayedScripts(
    appAddress: Address,
    first: number,
    skip: number
  ): Promise<DelayedScript[]>
  onDelayedScripts(
    appAddress: Address,
    first: number,
    skip: number,
    callback: SubscriptionCallback<DelayedScript[]>
  ): SubscriptionHandler
}
