import { ANDelayConnectorTheGraph } from '../../thegraph/connector'

const AN_DELAY_SUBGRAPH_URL =
  'https://api.thegraph.com/subgraphs/name/blossomlabs/aragon-an-delay-gnosis-staging'
const AN_DELAY_APP_ADDRESS = '0x67dbb8c3002f1b2833c662537ccfc3d17b82001e'

describe('AN Delay', () => {
  let connector: ANDelayConnectorTheGraph

  beforeAll(() => {
    connector = new ANDelayConnectorTheGraph({
      subgraphUrl: AN_DELAY_SUBGRAPH_URL,
    })
  })

  afterAll(() => connector.disconnect())

  it('should fetch an app correctly', async () => {
    const anDelayApp = await connector.delayApp(AN_DELAY_APP_ADDRESS)

    console.log(anDelayApp)

    expect(anDelayApp).toMatchInlineSnapshot(`
      ANDelay {
        "appAddress": "0x67dbb8c3002f1b2833c662537ccfc3d17b82001e",
        "executionDelay": "3600",
        "orgAddress": "0x6c727f89359cf1d45dc5a96610937ea34dadc957",
      }
    `)
  })
})
