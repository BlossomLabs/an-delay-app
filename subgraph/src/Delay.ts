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

export function handleDelayedScriptStored(
  e: DelayedScriptStoredEvent
): void {
  updateDelayScript(e.address, e.params.scriptId);
};

export function handleExecutionDelaySet(e: ExecutionDelaySetEvent): void {
  const delayApp = getDelayAppEntity(e.address);

  delayApp.executionDelay = e.params.executionDelay;

  delayApp.save();
}

export function handleExecutedScript(e: ExecutedScriptEvent): void {
  store.remove(
    "DelayScript",
    buildDelayScriptEntityId(e.address, e.params.scriptId)
  );
}

export function handleExecutionPaused(e: ExecutionPausedEvent): void {
  updateDelayScript(e.address, e.params.scriptId);
}

export function handleExecutionResumed(e: ExecutionResumedEvent): void {
  updateDelayScript(e.address, e.params.scriptId);
}

export function handleExecutionCancelled(e: ExecutionCancelledEvent): void {
  store.remove(
    "DelayScript",
    buildDelayScriptEntityId(e.address, e.params.scriptId)
  );
}
