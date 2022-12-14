import { ANDelayConnectorTheGraph } from '../thegraph/connector'

const AN_DELAY_SUBGRAPH_URL =
  'https://api.thegraph.com/subgraphs/name/blossomlabs/aragon-an-delay-gnosis'
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

    expect(anDelayApp).toMatchInlineSnapshot(`
      {
        "appAddress": "0x67dbb8c3002f1b2833c662537ccfc3d17b82001e",
        "executionDelay": "3600",
        "id": "0x67dbb8c3002f1b2833c662537ccfc3d17b82001e",
        "orgAddress": "0x6c727f89359cf1d45dc5a96610937ea34dadc957",
      }
    `)
  })

  it(`should fetch an app's delayed script correctly`, async () => {
    const delayedScript = await connector.delayedScript(AN_DELAY_APP_ADDRESS, 1)

    expect(delayedScript).toMatchInlineSnapshot(`
      {
        "creator": "0x3c048d78103b4e504f5ad04a7dca5e0cf752ace6",
        "evmCallScript": "0x000000017574c9cc110d3148e904e37391fd1c2f3382bc7c00000124d948d468000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e0000000014d9aeed1277f139f8b379b984b5326d8bb850f4d000000c4f6364846000000000000000000000000e91d153e0b41518a2ce8dd3d7944fa863463a97d0000000000000000000000003c048d78103b4e504f5ad04a7dca5e0cf752ace60000000000000000000000000000000000000000000000008ac7230489e800000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000001c7061796d656e7420666f7220646576656c6f706d656e7420776f726b00000000",
        "executionTime": "1666060965",
        "id": "1",
        "pausedAt": "0",
        "timeSubmitted": "1666057365",
        "totalTimePaused": "0",
      }
    `)
  })

  it("it should fetch an app's delayed scripts correctly", async () => {
    const delayedScripts = await connector.delayedScripts(
      AN_DELAY_APP_ADDRESS,
      1,
      0
    )

    expect(delayedScripts).toMatchInlineSnapshot(`
      [
        DelayedScript {
          "creator": "0x3c048d78103b4e504f5ad04a7dca5e0cf752ace6",
          "evmCallScript": "0x000000017574c9cc110d3148e904e37391fd1c2f3382bc7c00000124d948d468000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e0000000014d9aeed1277f139f8b379b984b5326d8bb850f4d000000c4f6364846000000000000000000000000e91d153e0b41518a2ce8dd3d7944fa863463a97d0000000000000000000000003c048d78103b4e504f5ad04a7dca5e0cf752ace60000000000000000000000000000000000000000000000008ac7230489e800000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000001c7061796d656e7420666f7220646576656c6f706d656e7420776f726b00000000",
          "executionTime": "1666060965",
          "id": "1",
          "pausedAt": "0",
          "timeSubmitted": "1666057365",
          "totalTimePaused": "0",
        },
      ]
    `)
  })
})
