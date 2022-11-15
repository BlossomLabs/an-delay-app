import { connect } from '@1hive/connect'
import connectANDelay from '../connect'
import { ANDelay } from '../models/ANDelay'

const CHAIN_ID = 100
const ORG_ADDRESS = '0x6C727F89359cF1D45dc5a96610937Ea34DadC957'
const AN_DELAY_APP_ADDRESS = '0x67dbb8c3002f1b2833c662537ccfc3d17b82001e'



describe('AN Delay', () => {
  let anDelay: ANDelay

  beforeAll(async () => {
    const org = await connect(ORG_ADDRESS, 'thegraph', {
      network: CHAIN_ID,
    })
    const anDelayApp = await org.connection.orgConnector.appByAddress(
      org,
      AN_DELAY_APP_ADDRESS
    )
    anDelay = await connectANDelay(anDelayApp)
  })

  afterAll(() => {
    anDelay.disconnect()
  })

  it("should fetch the app's data correctly", async () => {
    const appData = await anDelay.appData()

    expect(appData).toMatchInlineSnapshot(`
      {
        "appAddress": "0x67dbb8c3002f1b2833c662537ccfc3d17b82001e",
        "executionDelay": "3600",
        "id": "0x67dbb8c3002f1b2833c662537ccfc3d17b82001e",
        "orgAddress": "0x6c727f89359cf1d45dc5a96610937ea34dadc957",
      }
    `)
  })

  it(`should fetch an app's delayed script correctly`, async () => {
    const delayedScript = await anDelay.delayedScript(1)

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

  it("should fetch the app's delayed scripts correctly", async () => {
    const delayedScripts = await anDelay.delayedScripts()

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

  // it('should set a new execution delay correctly', () => {})

  // it('should delay the execution of an evm call script correctly', () => {})

  // it('should pause the execution of a delayed script correctly', () => {})

  // it('should resume the execution of a delayed script correctly', () => {})

  // it('should cancel the execution of a delayed script correctly', () => {})

  // it('should execute a delayed script correctly', () => {})

  // it('should execute a delayed script correctly', () => {})
})
