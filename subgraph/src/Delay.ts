import { BigInt, store } from "@graphprotocol/graph-ts";
import {
  Delay as DelayContract,
  DelayedScriptStored as DelayedScriptStoredEvent,
  ExecutedScript as ExecutedScriptEvent,
  ExecutionCancelled as ExecutionCancelledEvent,
  ExecutionDelaySet as ExecutionDelaySetEvent,
  ExecutionPaused as ExecutionPausedEvent,
  ExecutionResumed as ExecutionResumedEvent,
} from "../generated/templates/Delay/Delay";
import {
  buildDelayScriptEntityId,
  getDelayAppEntity,
  getDelayScriptEntity,
} from "./helpers";

export const handleDelayedScriptStored = (event: DelayedScriptStoredEvent) => {
  const appAddress = event.address;
  const delayContract = DelayContract.bind(appAddress);
  const scriptIndex = event.params.scriptId;
  const delayScriptRes = delayContract.delayedScripts(scriptIndex);

  if (delayScriptRes.getExecutionTime() === BigInt.fromU32(0)) {
    return;
  }

  const delayScript = getDelayScriptEntity(appAddress, scriptIndex);

  delayScript.evmCallScript = delayScriptRes.getEvmCallScript();
  delayScript.executionTime = delayScriptRes.getExecutionTime();
  delayScript.pausedAt = delayScriptRes.getPausedAt();

  delayScript.save();
};

export const handleExecutionDelaySet = (event: ExecutionDelaySetEvent) => {
  const delayApp = getDelayAppEntity(event.address);

  delayApp.executionDelay = event.params.executionDelay;

  delayApp.save();
};

export const handleExecutedScript = (event: ExecutedScriptEvent) => {
  store.remove(
    "DelayScript",
    buildDelayScriptEntityId(event.address, event.params.scriptId)
  );
};

export const handleExecutionPaused = (event: ExecutionPausedEvent) => {
  const appAddress = event.address;
  const delayContract = DelayContract.bind(appAddress);
  const delayScriptRes = delayContract.delayedScripts(event.params.scriptId);

  if (delayScriptRes.getExecutionTime() === BigInt.fromU32(0)) {
    return;
  }

  const delayScript = getDelayScriptEntity(appAddress, event.params.scriptId);

  delayScript.pausedAt = delayScriptRes.getPausedAt();

  delayScript.save();
};

export const handleExecutionResumed = (event: ExecutionResumedEvent) => {
  const appAddress = event.address;
  const delayContract = DelayContract.bind(appAddress);
  const delayScriptRes = delayContract.delayedScripts(event.params.scriptId);

  if (delayScriptRes.getExecutionTime() === BigInt.fromU32(0)) {
    return;
  }

  const delayScript = getDelayScriptEntity(appAddress, event.params.scriptId);

  delayScript.executionTime = delayScriptRes.getExecutionTime();
  delayScript.pausedAt = 0;

  delayScript.save();
};

export const handleExecutionCancelled = (event: ExecutionCancelledEvent) => {};
