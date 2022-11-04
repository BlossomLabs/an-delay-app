import { BigInt } from "@graphprotocol/graph-ts";
import {
  Delay as DelayContract,
  DelayedScriptStored as DelayedScriptStoredEvent,
  ExecutedScript as ExecutedScriptEvent,
  ExecutionCancelled as ExecutionCancelledEvent,
  ExecutionDelaySet as ExecutionDelaySetEvent,
  ExecutionPaused as ExecutionPausedEvent,
  ExecutionResumed as ExecutionResumedEvent,
} from "../generated/templates/Delay/Delay";
import { getDelayAppEntity, getDelayScriptEntity } from "./getters";

export const handleDelayedScriptStored = (event: DelayedScriptStoredEvent) => {
  const appAddress = event.address;
  const delayContract = DelayContract.bind(appAddress);
  const scriptIndex = event.params.scriptId;
  const delayScriptRes = delayContract.delayedScripts(scriptIndex);

  if (delayScriptRes.getExecutionTime() === BigInt.fromU32(0)) {
    return;
  }

  const delayApp = getDelayAppEntity(appAddress)
  const delayScript = getDelayScriptEntity(delayApp, scriptIndex);

  delayScript.evmCallScript = delayScriptRes.getEvmCallScript();
  delayScript.executionTime = delayScriptRes.getExecutionTime();
  delayScript.pausedAt = delayScriptRes.getPausedAt();

  delayScript.save();
};

export const handleExecutionDelaySet = (event: ExecutionDelaySetEvent) => {};
export const handleExecutedScript = (event: ExecutedScriptEvent) => {};
export const handleExecutionPaused = (event: ExecutionPausedEvent) => {};
export const handleExecutionResumed = (event: ExecutionResumedEvent) => {};
export const handleExecutionCancelled = (event: ExecutionCancelledEvent) => {};
