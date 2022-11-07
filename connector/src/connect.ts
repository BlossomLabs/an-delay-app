import {
  createAppConnector,
  ErrorInvalidApp,
  ErrorInvalidNetwork,
} from '@1hive/connect-core'
import { ANDelay } from './models/ANDelay'
import {
  ANDelayConnectorTheGraph,
  subgraphUrlFromChainId,
} from './thegraph/connector'

export type Config = {
  pollInterval?: number
  subgraphUrl: string
}

const APP_NAMES_WHITELIST = ['an-delay', 'delay']

export default createAppConnector<ANDelay, Config>(
  async ({ app, config, connector, network, orgConnector, verbose }) => {
    if (connector !== 'thegraph') {
      console.warn(
        `Connector unsupported: ${connector}. Using "thegraph" instead.`
      )
    }

    if (app.name && !APP_NAMES_WHITELIST.includes(app.name)) {
      throw new ErrorInvalidApp(
        `This app (${app.name}) is not compatible with @blossom-labs/connect-an-delay. ` +
          `Please use an app instance of the an-delay.open.aragonpm.eth repo.`
      )
    }

    const subgraphUrl =
      config.subgraphUrl ?? subgraphUrlFromChainId(network.chainId) ?? undefined

    if (!subgraphUrl) {
      throw new ErrorInvalidNetwork(
        'No subgraph could be found for this network. ' +
          'Please provide a subgraphUrl or use one of the supported networks.'
      )
    }

    let pollInterval

    if (orgConnector.name === 'thegraph') {
      pollInterval =
        config?.pollInterval ?? orgConnector.config?.pollInterval ?? undefined
    }

    const connectorTheGraph = new ANDelayConnectorTheGraph({
      subgraphUrl,
      pollInterval,
      verbose,
    })

    return new ANDelay(app, connectorTheGraph)
  }
)
