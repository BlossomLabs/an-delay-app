import { BigInt, store } from "@graphprotocol/graph-ts";
import {
  DelayedScriptStored as DelayedScriptStoredEvent,
  ExecutedScript as ExecutedScriptEvent,
  ExecutionCancelled as ExecutionCancelledEvent,
  ChangeExecutionDelay as ChangeExecutionDelayEvent,
  ExecutionPaused as ExecutionPausedEvent,
  ExecutionResumed as ExecutionResumedEvent,
  ChangeFeeAmount as ChangeFeeAmountEvent,
  ChangeFeeDestination as ChangeFeeDestinationEvent,
  Delay as DelayContract,
} from "../generated/templates/Delay/Delay";
import {
  buildDelayedScriptEntityId,
  getDelayAppEntity,
  getDelayedScriptEntity,
} from "./helpers";

export function handleDelayedScriptStored(e: DelayedScriptStoredEvent): void {
  const delayedScript = getDelayedScriptEntity(e.address, e.params.scriptId);

  delayedScript.feeAmount = e.params.feeAmount;
  delayedScript.executionTime = e.params.executionTime;
  delayedScript.evmCallScript = e.params.evmCallScript;
  delayedScript.creator = e.transaction.from;
  delayedScript.timeSubmitted = e.block.timestamp;

  delayedScript.save();
}

export function handleChangeExecutionDelay(e: ChangeExecutionDelayEvent): void {
  const delayApp = getDelayAppEntity(e.address);
  const delayContract = DelayContract.bind(e.address)
  /**
   * This is a workaround for a bug in the contract which emits the previous
   * execution delay instead of the new one.
   */
  delayApp.executionDelay = delayContract.executionDelay();

  delayApp.save();
}

export function handleExecutedScript(e: ExecutedScriptEvent): void {
  store.remove(
    "DelayedScript",
    buildDelayedScriptEntityId(e.address, e.params.scriptId)
  );
}

export function handleExecutionPaused(e: ExecutionPausedEvent): void {
  const delayedScript = getDelayedScriptEntity(e.address, e.params.scriptId);

  delayedScript.pausedAt = e.block.timestamp;

  delayedScript.save();
}

export function handleExecutionResumed(e: ExecutionResumedEvent): void {
  const delayedScript = getDelayedScriptEntity(e.address, e.params.scriptId);

  delayedScript.pausedAt = BigInt.fromI32(0);
  delayedScript.executionTime = e.params.newExecutionTime;

  delayedScript.save();
}

export function handleExecutionCancelled(e: ExecutionCancelledEvent): void {
  store.remove(
    "DelayedScript",
    buildDelayedScriptEntityId(e.address, e.params.scriptId)
  );
}

export function handleChangeFeeAmount(e: ChangeFeeAmountEvent): void {
  const delayApp = getDelayAppEntity(e.address);

  delayApp.feeAmount = e.params.newAmount;

  delayApp.save();
}

export function handleChangeFeeDestination(e: ChangeFeeDestinationEvent): void {
  const delayApp = getDelayAppEntity(e.address);

  delayApp.feeDestination = e.params.newDestination;

  delayApp.save();
}
