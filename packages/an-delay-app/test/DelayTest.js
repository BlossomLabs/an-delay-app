const Delay = artifacts.require('Delay')
const ExecutionTarget = artifacts.require('ExecutionTarget')
const MiniMeToken = artifacts.require('MiniMeToken')

const { hash: nameHash } = require('eth-ens-namehash')

const { timeTravel } = require('./helpers/helpers')

const { ZERO_ADDRESS, bigExp, getEventArgument, bn } = require('@1hive/contract-helpers-test/src')
const { assertRevert, assertEvent } = require('@1hive/contract-helpers-test/src/asserts')
const { newDao, installNewApp, encodeCallScript } = require('@1hive/contract-helpers-test/src/aragon-os')

contract('Delay', ([rootAccount, someone, destination, anotherDestination]) => {
  let delayBase, delay
  let CHANGE_DELAY_ROLE, DELAY_EXECUTION_ROLE, PAUSE_EXECUTION_ROLE, RESUME_EXECUTION_ROLE, CANCEL_EXECUTION_ROLE, CHANGE_AMOUNT_ROLE, CHANGE_DESTINATION_ROLE
  let dao, acl

  const FEE_AMOUNT = bigExp(5, 18)

  before('deploy base apps', async () => {
    delayBase = await Delay.new()
    CHANGE_DELAY_ROLE = await delayBase.CHANGE_DELAY_ROLE()
    DELAY_EXECUTION_ROLE = await delayBase.DELAY_EXECUTION_ROLE()
    PAUSE_EXECUTION_ROLE = await delayBase.PAUSE_EXECUTION_ROLE()
    RESUME_EXECUTION_ROLE = await delayBase.RESUME_EXECUTION_ROLE()
    CANCEL_EXECUTION_ROLE = await delayBase.CANCEL_EXECUTION_ROLE()
    CHANGE_AMOUNT_ROLE = await delayBase.CHANGE_AMOUNT_ROLE()
    CHANGE_DESTINATION_ROLE = await delayBase.CHANGE_DESTINATION_ROLE()
  })

  beforeEach('deploy dao and delay', async () => {
    const daoDeployment = await newDao(rootAccount)
    dao = daoDeployment.dao
    acl = daoDeployment.acl

    delay = await Delay.at(await installNewApp(dao, nameHash('delay.aragonpm.test'), delayBase.address, rootAccount))

    await acl.createPermission(rootAccount, delay.address, DELAY_EXECUTION_ROLE, rootAccount)
    await acl.createPermission(rootAccount, delay.address, PAUSE_EXECUTION_ROLE, rootAccount)
    await acl.createPermission(rootAccount, delay.address, RESUME_EXECUTION_ROLE, rootAccount)
    await acl.createPermission(rootAccount, delay.address, CANCEL_EXECUTION_ROLE, rootAccount)
    await acl.createPermission(rootAccount, delay.address, CHANGE_AMOUNT_ROLE, rootAccount)
    await acl.createPermission(rootAccount, delay.address, CHANGE_DESTINATION_ROLE, rootAccount)
  })

  describe('initialize(uint256 _executionDelay)', () => {
    const INITIAL_DELAY = 100 // seconds
    let feeToken

    beforeEach(async () => {
      
      feeToken = await MiniMeToken.new(ZERO_ADDRESS, ZERO_ADDRESS, 0, 'Fee Token', 18, 'FTK', true, { from: rootAccount }) // dummy parameters for minime
      await feeToken.generateTokens(rootAccount, bigExp(100, 18), { from: rootAccount })

      await delay.initialize(INITIAL_DELAY, feeToken.address, FEE_AMOUNT, destination)
    })

    it('sets the initial parameters correctly and initializes', async () => {
      const actualExecutionDelay = await delay.executionDelay()
      const actualFeeToken = await delay.feeToken()
      const actualFeeAmount = await delay.feeAmount()
      const actualFeeDestination = await delay.feeDestination()
      const hasInitialized = await delay.hasInitialized()
      assert.equal(actualExecutionDelay, INITIAL_DELAY)
      assert.equal(actualFeeToken, feeToken.address)
      assert.equal(actualFeeAmount.toString(), FEE_AMOUNT.toString())
      assert.equal(actualFeeDestination, destination)
      assert.isTrue(hasInitialized)
    })

    it('delay app is a forwarder', async () => {
      assert.isTrue(await delay.isForwarder())
    })

    describe('changeExecutionDelay(uint256 _executionDelay)', () => {
      it('sets the execution delay correctly', async () => {
        await acl.createPermission(rootAccount, delay.address, CHANGE_DELAY_ROLE, rootAccount)
        const expectedExecutionDelay = 20

        await delay.changeExecutionDelay(expectedExecutionDelay)

        const actualExecutionDelay = await delay.executionDelay()
        assert.equal(actualExecutionDelay, expectedExecutionDelay)
      })
    })

    describe('changeFeeAmount', () => {
      context('when the sender is allowed', () => {
        const from = rootAccount

        const itUpdatesTheFeeAmountSuccessfully = (newFeeAmount) => {
          it('updates the fee amount', async () =>  {
            await delay.changeFeeAmount(newFeeAmount, { from })

            assert.equal((await delay.feeAmount()).toString(), newFeeAmount.toString(), 'fee amount does not match')
          })

          it('emits an event', async () => {
            const receipt = await delay.changeFeeAmount(newFeeAmount, { from })
            assertEvent(receipt, 'ChangeFeeAmount', { previousAmount: FEE_AMOUNT, newAmount: newFeeAmount })
          })
        }

        context('when the new fee amount is zero', () => {
          const newFeeAmount = bigExp(0, 18)

          itUpdatesTheFeeAmountSuccessfully(newFeeAmount)
        })

        context('when the new fee amount is different than the one before', () => {
          const newFeeAmount = FEE_AMOUNT.mul(bn(2))

          itUpdatesTheFeeAmountSuccessfully(newFeeAmount)
        })

        context('when the new fee amount is equal to the one before', () => {
          const newFeeAmount = FEE_AMOUNT

          it('reverts', async () =>  {
            await assertRevert(delay.changeFeeAmount(newFeeAmount, { from }), 'DELAY_INVALID_FEE_AMOUNT')
          })
        })
      })

      context('when the sender is not allowed', () => {
        const from = someone

        it('reverts', async () =>  {
          await assertRevert(delay.changeFeeAmount(FEE_AMOUNT.mul(bn(2)), { from }), 'APP_AUTH_FAILED')
        })
      })
    })
  
    describe('changeFeeDestination', () => {

      context('when the sender is allowed', () => {
        const from = rootAccount

        context('when the new fee amount is different than the one before', () => {
          const newFeeDestination = anotherDestination

          it('updates the fee amount', async () =>  {
            await delay.changeFeeDestination(newFeeDestination, { from })

            assert.equal(await delay.feeDestination(), newFeeDestination, 'fee destination does not match')
          })

          it('emits an event', async () => {
            const receipt = await delay.changeFeeDestination(newFeeDestination, { from })
            assertEvent(receipt, 'ChangeFeeDestination', { previousDestination: destination, newDestination: newFeeDestination })
          })
        })
  
        context('when the new fee destination is the address zero', () => {
          const newDestination = ZERO_ADDRESS

          it('reverts', async () =>  {
            await assertRevert(delay.changeFeeDestination(newDestination, { from }), 'DELAY_INVALID_FEE_DESTINATION')
          })
        })
  
        context('when the new fee destination is equal to the one before', () => {
          const newDestination = destination

          it('reverts', async () =>  {
            await assertRevert(delay.changeFeeDestination(newDestination, { from }), 'DELAY_INVALID_FEE_DESTINATION')
          })
        })
      })
  
      context('when the sender is not allowed', () => {
        const from = someone

        it('reverts', async () =>  {
          await assertRevert(delay.changeFeeDestination(anotherDestination, { from }), 'APP_AUTH_FAILED')
        })
      })
    })
  
    describe('forwardFee', () => {
      it('returns configured fee token and amount', async () => {
        const { '0': token, '1': amount } = await delay.forwardFee()

        assert.equal(token, feeToken.address, 'fee token does not match')
        assert.equal(amount.toString(), FEE_AMOUNT.toString(), 'fee amount does not match')
      })
    })  

    describe('canForward(address _sender, bytes _evmCallScript)', () => {
      it('returns true when permission has been set', async () => {
        assert.isTrue(await delay.canForward(rootAccount, '0x'))
      })

      it('returns false when permission has been revoked', async () => {
        await acl.revokePermission(rootAccount, delay.address, DELAY_EXECUTION_ROLE)
        assert.isFalse(await delay.canForward(rootAccount, '0x'))
      })
    })

    describe('submit a delayed execution script', () => {
      let executionTarget, script

      beforeEach(async () => {
        executionTarget = await ExecutionTarget.new()
        const action = {
          to: executionTarget.address,
          calldata: executionTarget.contract.methods.execute().encodeABI(),
        }
        script = encodeCallScript([action])
      })

      describe('delayExecution(bytes _evmCallScript)', () => {
        context('when the sender has approved the fee costs to the delay app', () => {
          beforeEach(async () => {
            await feeToken.approve(delay.address, FEE_AMOUNT)
            await delay.delayExecution(script)
          })

          it('stores delayed execution script and updates new script index', async () => {
            const { timestamp } = await web3.eth.getBlock('latest')
            const expectedExecutionTime = timestamp + INITIAL_DELAY

            const { executionTime: actualExecutionTime, evmCallScriptHash: actualCallScriptHash } = await delay.delayedScripts(0)
            const actualNewScriptIndex = await delay.delayedScriptsNewIndex()

            assert.closeTo(actualExecutionTime.toNumber(), expectedExecutionTime, 3)
            assert.equal(actualCallScriptHash, web3.utils.keccak256(script))
            assert.equal(actualNewScriptIndex, 1)
          })

          it('transfers the fee amount to the delay app', async () =>  {
            const from = rootAccount
            const userPreviousBalance = await feeToken.balanceOf(from)
            const delayPreviousBalance = await feeToken.balanceOf(delay.address)

            await feeToken.approve(delay.address, FEE_AMOUNT)
            await delay.forward(script, { from })

            const userCurrentBalance = await feeToken.balanceOf(from)
            const delayCurrentBalance = await feeToken.balanceOf(delay.address)

            assert.equal(userCurrentBalance.toString(), userPreviousBalance.sub(FEE_AMOUNT).toString(), 'user current balance does not match')
            assert.equal(delayCurrentBalance.toString(), delayPreviousBalance.add(FEE_AMOUNT).toString(), 'delay current balance does not match')
          })

          describe('execute(uint256 _delayedScriptId)', () => {
            it('executes the script after the delay has elapsed and deletes script', async () => {
              await timeTravel(web3)(INITIAL_DELAY + 3)

              await delay.execute(0, script)
              const actualExecutionCounter = await executionTarget.counter()
              const {
                executionTime: actualExecutionTime,
                pausedAt: actualPausedAt,
                evmCallScript: actualCallScript,
              } = await delay.delayedScripts(0)
              assert.equal(actualExecutionCounter, 1)
              assert.equal(actualExecutionTime, 0)
              assert.equal(actualCallScript, null)
              assert.equal(actualPausedAt, 0)
            })
          })

          it('transfers back the fee amount to the user', async () =>  {
            const from = rootAccount
            const userPreviousBalance = await feeToken.balanceOf(from)
            const delayPreviousBalance = await feeToken.balanceOf(delay.address)
            
            await timeTravel(web3)(INITIAL_DELAY + 3)

            await delay.execute(0, script)

            const userCurrentBalance = await feeToken.balanceOf(from)
            const delayCurrentBalance = await feeToken.balanceOf(delay.address)

            assert.equal(userCurrentBalance.toString(), userPreviousBalance.add(FEE_AMOUNT).toString(), 'user current balance does not match')
            assert.equal(delayCurrentBalance.toString(), delayPreviousBalance.sub(FEE_AMOUNT).toString(), 'delay current balance does not match')
          })

          const checkFeeAmountIsTransferred = async () =>  {
            const from = rootAccount
            const userPreviousBalance = await feeToken.balanceOf(from)
            const delayPreviousBalance = await feeToken.balanceOf(delay.address)

            await delay.changeFeeAmount(0, { from })
            
            await timeTravel(web3)(INITIAL_DELAY + 3)
            await delay.execute(0, script)

            const userCurrentBalance = await feeToken.balanceOf(from)
            const delayCurrentBalance = await feeToken.balanceOf(delay.address)

            assert.equal(userCurrentBalance.toString(), userPreviousBalance.add(FEE_AMOUNT).toString(), 'user current balance does not match')
            assert.equal(delayCurrentBalance.toString(), delayPreviousBalance.sub(FEE_AMOUNT).toString(), 'delay current balance does not match')
          }

          it('transfers back the fee amount to the user', checkFeeAmountIsTransferred)

          context('even if fee amount changes', async () => {
            before(async () => {
              await delay.changeFeeAmount(0)
            })
            it('transfers back the fee amount to the user', checkFeeAmountIsTransferred)
          })
        })
        context('when the sender has not approved the fee costs to the delay app', () => {
          it('reverts', async () =>  {
            await assertRevert(delay.delayExecution(script), 'DELAY_FEE_TRANSFER_REVERTED')
          })
        })
      })

      describe('forward(bytes _evmCallScript)', () => {
        context('when the sender has not approved the fee costs to the delay app', () => {
          it('reverts', async () =>  {
            await assertRevert(delay.forward(script), 'DELAY_FEE_TRANSFER_REVERTED')
          })
        })
        it('stores delayed execution script hash and updates new script index when permission granted', async () => {
          await feeToken.approve(delay.address, FEE_AMOUNT)
          await delay.forward(script)
          const { timestamp } = await web3.eth.getBlock('latest')
          const expectedExecutionTime = timestamp + INITIAL_DELAY
          const {
            executionTime: actualExecutionTime,
            pausedAt: actualPausedAt,
            evmCallScriptHash: actualCallScriptHash,
          } = await delay.delayedScripts(0)
          const actualNewScriptIndex = await delay.delayedScriptsNewIndex()

          assert.closeTo(actualExecutionTime.toNumber(), expectedExecutionTime, 3)
          assert.equal(actualCallScriptHash, web3.utils.keccak256(script))
          assert.equal(actualPausedAt, 0)
          assert.equal(actualNewScriptIndex, 1)
        })

        it('reverts when permission revoked', async () => {
          await acl.revokePermission(rootAccount, delay.address, DELAY_EXECUTION_ROLE)

          const forwardReceipt = delay.forward(script)

          await assertRevert(forwardReceipt, 'DELAY_CAN_NOT_FORWARD')
        })

        describe('pauseExecution(uint256 _delayedScriptId)', () => {
          beforeEach('create delayed script', async () => {
            await feeToken.approve(delay.address, FEE_AMOUNT)
            await delay.forward(script)
          })

          it('pauses execution script', async () => {
            const { timestamp } = await web3.eth.getBlock('latest')

            await delay.pauseExecution(0)

            const { pausedAt } = await delay.delayedScripts(0)
            assert.closeTo(pausedAt.toNumber(), timestamp, 3)
          })

          it('reverts when pausing non existent script', async () => {
            await assertRevert(delay.pauseExecution(1), 'DELAY_NO_SCRIPT')
          })

          it('reverts when pausing already paused script execution', async () => {
            await delay.pauseExecution(0)
            await assertRevert(delay.pauseExecution(0), 'DELAY_CAN_NOT_PAUSE')
          })

          it('reverts when pausing script past execution time', async () => {
            await timeTravel(web3)(INITIAL_DELAY)
            await assertRevert(delay.pauseExecution(0), 'DELAY_SCRIPT_EXECUTION_PASSED')
          })
        })

        describe('resumeExecution(uint256 _delayedScriptId)', () => {
          beforeEach('create delayed script', async () => {
            await feeToken.approve(delay.address, FEE_AMOUNT)
            await delay.forward(script)
          })

          it('resumes execution script', async () => {
            const timePaused = 50
            const { executionTime: oldExecutionTime } = await delay.delayedScripts(0)

            await delay.pauseExecution(0)
            await timeTravel(web3)(timePaused)
            await delay.resumeExecution(0)

            const { executionTime: actualExecutionTime, pausedAt: actualPausedAt } = await delay.delayedScripts(0)
            assert.equal(actualPausedAt, 0)
            assert.closeTo(actualExecutionTime.toNumber(), oldExecutionTime.toNumber() + timePaused, 3)
          })

          it('reverts when resuming non existent script', async () => {
            await assertRevert(delay.resumeExecution(1), 'DELAY_NO_SCRIPT')
          })

          it('reverts when resuming non paused script execution', async () => {
            await assertRevert(delay.resumeExecution(0), 'DELAY_CAN_NOT_RESUME')
          })
        })

        describe('cancelExecution(uint256 _delayedScriptId)', () => {
          beforeEach('create delayed script', async () => {
            await feeToken.approve(delay.address, FEE_AMOUNT)
            await delay.forward(script)
          })

          it('cancels execution script', async () => {
            await delay.cancelExecution(0)

            const {
              executionTime: actualExecutionTime,
              pausedAt: actualPausedAt,
              evmCallScript: actualCallScript,
            } = await delay.delayedScripts(0)

            assert.equal(actualExecutionTime, 0)
            assert.equal(actualCallScript, null)
            assert.equal(actualPausedAt, 0)
          })

          const checkFeeAmountIsTransferred = async () => {
            const delayPreviousBalance = await feeToken.balanceOf(delay.address)
            const destinationPreviousBalance = await feeToken.balanceOf(destination)

            await delay.cancelExecution(0)

            const delayCurrentBalance = await feeToken.balanceOf(delay.address)
            const destinationCurrentBalance = await feeToken.balanceOf(destination)

            assert.equal(delayCurrentBalance.toString(), delayPreviousBalance.sub(FEE_AMOUNT).toString(), 'delay current balance does not match')
            assert.equal(destinationCurrentBalance.toString(), destinationPreviousBalance.add(FEE_AMOUNT).toString(), 'destination current balance does not match')
          } 

          it('transfers the fee amount to the destination address', checkFeeAmountIsTransferred)

          context('even if fee amount changes', () => {
            before(async () => {
              await delay.changeFeeAmount(0)
            })

            it('transfers the fee amount to the destination address', checkFeeAmountIsTransferred)
          })

          it('reverts when cancelling non-existent script', async () => {
            await assertRevert(delay.cancelExecution(1), 'DELAY_NO_SCRIPT')
          })
        })

        describe('execute(uint256 _delayedScriptId)', () => {
          beforeEach('create delayed script', async () => {
            await feeToken.approve(delay.address, FEE_AMOUNT)
            await delay.forward(script)
          })

          it('executes the script after the delay has elapsed and deletes script', async () => {
            await timeTravel(web3)(INITIAL_DELAY + 3)

            await delay.execute(0, script)
            const actualExecutionCounter = await executionTarget.counter()
            const {
              executionTime: actualExecutionTime,
              pausedAt: actualPausedAt,
              evmCallScript: actualCallScript,
            } = await delay.delayedScripts(0)
            assert.equal(actualExecutionCounter, 1)
            assert.equal(actualExecutionTime, 0)
            assert.equal(actualCallScript, null)
            assert.equal(actualPausedAt, 0)
          })

          it('executes the script after execution is resumed', async () => {
            await delay.pauseExecution(0)
            await delay.resumeExecution(0)

            await timeTravel(web3)(INITIAL_DELAY + 3)
            await delay.execute(0, script)
          })

          it('reverts when script does not exist', async () => {
            await assertRevert(delay.execute(1, script), 'DELAY_NO_SCRIPT')
          })

          it('reverts when executing script before execution time', async () => {
            await assertRevert(delay.execute(0, script), 'DELAY_CAN_NOT_EXECUTE')
          })

          it('reverts when executing paused script', async () => {
            await delay.pauseExecution(0)

            await timeTravel(web3)(INITIAL_DELAY + 3)
            await assertRevert(delay.execute(0, script), 'DELAY_CAN_NOT_EXECUTE')
          })

          it('reverts when executing cancelled script', async () => {
            await timeTravel(web3)(INITIAL_DELAY + 3)
            await delay.cancelExecution(0)

            await assertRevert(delay.execute(0, script), 'DELAY_NO_SCRIPT')
          })

          it('reverts when evmScript reenters delay contract, attempting to execute same script twice', async () => {
            const action = {
              to: delay.address,
              calldata: delay.contract.methods.execute(1, script).encodeABI(),
            }

            const reenteringScript = encodeCallScript([action])
            await feeToken.approve(delay.address, FEE_AMOUNT)
            const delayReceipt = await delay.delayExecution(reenteringScript)
            const scriptId = getEventArgument(delayReceipt, 'DelayedScriptStored', 'scriptId')

            await timeTravel(web3)(INITIAL_DELAY + 3)
            await feeToken.approve(delay.address, FEE_AMOUNT)
            await assertRevert(delay.execute(scriptId, reenteringScript), 'DELAY_NO_SCRIPT')
          })
        })
      })
    })
  })

  describe('app not initialized', async () => {
    it('reverts on setting execution delay', async () => {
      await assertRevert(delay.changeExecutionDelay(9))
    })

    it('reverts on creating delay execution script (delayExecution)', async () => {
      await assertRevert(delay.delayExecution("0x"))
    })

    it('reverts on creating delay execution script (forward)', async () => {
      await assertRevert(delay.forward("0x"))
    })

    it('returns empty values in forwardFee', async () => {
      const { '0': token, '1': amount } = await delay.forwardFee()

      assert.equal(token, ZERO_ADDRESS, 'fee token does not match')
      assert.equal(amount.toString(), 0, 'fee amount does not match')
    })

    it('reverts when changing fee amount', async () => {
      await assertRevert(delay.changeFeeAmount(FEE_AMOUNT.mul(bn(2)), { from: rootAccount }), 'APP_AUTH_FAILED')
    })

    it('reverts on changing fee destination', async () => {
      await assertRevert(delay.changeFeeDestination(anotherDestination, { from: rootAccount }), 'APP_AUTH_FAILED')
    })

    it('is a forwarder', async () => {
      assert.isTrue(await delay.isForwarder())
    })

    it('can not forward', async () => {
      assert.isFalse(await delay.canForward(rootAccount, '0x'))
      await assertRevert(delay.forward("0x", { from: rootAccount }), 'DELAY_CAN_NOT_FORWARD')
    })
  })
})
