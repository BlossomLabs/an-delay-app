import { ErrorException } from '@1hive/connect-core'
import { GraphQLWrapper, QueryResult } from '@1hive/connect-thegraph'
import { DelayedScript } from '../models/DelayedScript'
import {
  DelayAppData,
  ANDelayConnector,
  SubscriptionCallback,
  SubscriptionHandler,
} from '../types'
import { parseDelayedScript, parseDelayedScripts } from './parsers'
import { parseDelayApp } from './parsers/delayApp'
import {
  GET_DELAY_APP,
  GET_DELAYED_SCRIPTS,
  GET_DELAYED_SCRIPT,
} from './queries'

type ANDelayConnectorTheGraphConfig = {
  pollInterval?: number
  subgraphUrl: string
  verbose?: boolean
}

export const subgraphUrlFromChainId = (chainId: number): string | null => {
  switch (chainId) {
    case 1:
      return 'https://api.thegraph.com/subgraphs/name/blossomlabs/aragon-an-delay-mainnet'
    case 100:
      return 'https://api.thegraph.com/subgraphs/name/blossomlabs/aragon-an-delay-gnosis'
    default:
      return null
  }
}

export class ANDelayConnectorTheGraph implements ANDelayConnector {
  #gql: GraphQLWrapper

  constructor(config: ANDelayConnectorTheGraphConfig) {
    const { subgraphUrl, pollInterval, verbose } = config || {}

    if (!subgraphUrl) {
      throw new ErrorException(
        'ANDelayConnectorTheGraph requires a subgraph url'
      )
    }

    this.#gql = new GraphQLWrapper(subgraphUrl, {
      pollInterval,
      verbose,
    })
  }

  disconnect(): void {
    this.#gql.close()
  }

  delayApp(appAddress: string): Promise<DelayAppData> {
    return this.#gql.performQueryWithParser(
      GET_DELAY_APP('query'),
      { id: appAddress },
      (result: QueryResult) => parseDelayApp(result)
    )
  }

  onDelayApp(
    appAddress: string,
    callback: SubscriptionCallback<DelayAppData>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser(
      GET_DELAY_APP('subscription'),
      { id: appAddress },
      callback,
      (result: QueryResult) => parseDelayApp(result)
    )
  }

  delayedScript(
    appAddress: string,
    scriptId: string | number
  ): Promise<DelayedScript> {
    return this.#gql.performQueryWithParser(
      GET_DELAYED_SCRIPT('query'),
      {
        id: this.#buildDelayedScriptId(appAddress, scriptId),
      },
      (result) => parseDelayedScript(result)
    )
  }

  onDelayedScript(
    appAddress: string,
    scriptId: string | number,
    callback: SubscriptionCallback<DelayedScript>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser(
      GET_DELAYED_SCRIPT('subscription'),
      { id: this.#buildDelayedScriptId(appAddress, scriptId) },
      callback,
      (result: QueryResult) => parseDelayedScript(result)
    )
  }

  delayedScripts(
    appAddress: string,
    first: number,
    skip: number
  ): Promise<DelayedScript[]> {
    return this.#gql.performQueryWithParser(
      GET_DELAYED_SCRIPTS('query'),
      {
        appAddress,
        first,
        skip,
      },
      (result: QueryResult) => parseDelayedScripts(result)
    )
  }

  onDelayedScripts(
    appAddress: string,
    first: number,
    skip: number,
    callback: SubscriptionCallback<DelayedScript[]>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser(
      GET_DELAYED_SCRIPTS('subscription'),
      {
        appAddress,
        first,
        skip,
      },
      callback,
      (result: QueryResult) => parseDelayedScripts(result)
    )
  }

  #buildDelayedScriptId(appAddress: string, scriptId: string | number): string {
    return `${appAddress}-${scriptId}`
  }
}
