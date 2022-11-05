import { store } from "@graphprotocol/graph-ts";
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
  updateDelayScript,
} from "./helpers";

export const handleDelayedScriptStored = (
  e: DelayedScriptStoredEvent
): void => {
  updateDelayScript(e.address, e.params.scriptId);
};

export const handleExecutionDelaySet = (e: ExecutionDelaySetEvent): void => {
  const delayApp = getDelayAppEntity(e.address);

  delayApp.executionDelay = e.params.executionDelay;

  delayApp.save();
};

export const handleExecutedScript = (e: ExecutedScriptEvent): void => {
  store.remove(
    "DelayScript",
    buildDelayScriptEntityId(e.address, e.params.scriptId)
  );
};

export const handleExecutionPaused = (e: ExecutionPausedEvent): void => {
  updateDelayScript(e.address, e.params.scriptId);
};

export const handleExecutionResumed = (e: ExecutionResumedEvent): void => {
  updateDelayScript(e.address, e.params.scriptId);
};

export const handleExecutionCancelled = (e: ExecutionCancelledEvent): void => {
  store.remove(
    "DelayScript",
    buildDelayScriptEntityId(e.address, e.params.scriptId)
  );
};
