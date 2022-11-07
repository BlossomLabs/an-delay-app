import { providers, Wallet } from 'ethers'
import { connect } from '@1hive/connect'
import connectANDelay from '../connect'
import { ANDelay } from '../models/ANDelay'

const ORG_ADDRESS = '0x6C727F89359cF1D45dc5a96610937Ea34DadC957'
const AN_DELAY_APP_ADDRESS = '0x67dbb8c3002f1b2833c662537ccfc3d17b82001e'

const SIGNER_PK =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

describe('AN Delay', () => {
  let anDelay: ANDelay
  let signer: Wallet

  beforeAll(async () => {
    signer = new Wallet(
      SIGNER_PK,
      new providers.JsonRpcProvider('http://localhost:8545/')
    )
    const chainId = (await signer.provider.getNetwork()).chainId
    const org = await connect(ORG_ADDRESS, 'thegraph', {
      network: chainId,
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

  it("should fetch the app's delayed scripts correctly", async () => {
    const delayScripts = await anDelay.delayScripts()

    expect(delayScripts).toMatchInlineSnapshot(`
      [
        DelayScript {
          "evmCallScript": "0x000000017574c9cc110d3148e904e37391fd1c2f3382bc7c00000124d948d468000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000e0000000014d9aeed1277f139f8b379b984b5326d8bb850f4d000000c4f6364846000000000000000000000000e91d153e0b41518a2ce8dd3d7944fa863463a97d0000000000000000000000003c048d78103b4e504f5ad04a7dca5e0cf752ace60000000000000000000000000000000000000000000000008ac7230489e800000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000001c7061796d656e7420666f7220646576656c6f706d656e7420776f726b00000000",
          "executionTime": "1666060965",
          "pausedAt": "0",
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
