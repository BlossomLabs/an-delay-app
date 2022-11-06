import { ErrorException } from '@1hive/connect-core'
import { GraphQLWrapper, QueryResult } from '@1hive/connect-thegraph'
import {
  DelayAppData,
  DelayScriptData,
  IANDelayConnector,
  SubscriptionCallback,
  SubscriptionHandler,
} from '../types'
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

export class ANDelayConnectorTheGraph implements IANDelayConnector {
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

  async disconnect() {
    this.#gql.close()
  }

  delayApp(appAddress: string): Promise<DelayAppData> {
    return this.#gql.performQueryWithParser(
      GET_DELAY_APP('query'),
      { id: appAddress },
      (result: QueryResult) => parseDelayApp(result, this)
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
      (result: QueryResult) => parseDelayApp(result, this)
    )
  }

  delayScripts(appAddress: string): Promise<DelayScriptData> {
    throw new Error('Method not implemented.')
  }

  onDelayScripts(
    appAddress: string,
    first: number,
    skip: number,
    callback: SubscriptionCallback<DelayScriptData>
  ): SubscriptionHandler {
    throw new Error('Method not implemented.')
  }
}
