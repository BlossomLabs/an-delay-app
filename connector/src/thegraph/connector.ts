import { ErrorException } from '@1hive/connect-core'
import { GraphQLWrapper, QueryResult } from '@1hive/connect-thegraph'
import { DelayScript } from '../models/DelayScript'
import {
  DelayAppData,
  ANDelayConnector,
  SubscriptionCallback,
  SubscriptionHandler,
} from '../types'
import { parseDelayScripts } from './parsers'
import { parseDelayApp } from './parsers/delayApp'
import { GET_DELAY_APP, GET_DELAY_SCRIPTS } from './queries'

type ANDelayConnectorTheGraphConfig = {
  pollInterval?: number
  subgraphUrl: string
  verbose?: boolean
}

export const subgraphUrlFromChainId = (chainId: number): string | null => {
  switch (chainId) {
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

  delayScripts(
    appAddress: string,
    first: number,
    skip: number
  ): Promise<DelayScript[]> {
    return this.#gql.performQueryWithParser(
      GET_DELAY_SCRIPTS('query'),
      {
        appAddress,
        first,
        skip,
      },
      (result: QueryResult) => parseDelayScripts(result)
    )
  }

  onDelayScripts(
    appAddress: string,
    first: number,
    skip: number,
    callback: SubscriptionCallback<DelayScript[]>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser(
      GET_DELAY_SCRIPTS('subscription'),
      {
        appAddress,
        first,
        skip,
      },
      callback,
      (result: QueryResult) => parseDelayScripts(result)
    )
  }
}
