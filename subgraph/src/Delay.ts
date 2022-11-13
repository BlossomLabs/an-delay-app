import { store } from "@graphprotocol/graph-ts";
import {
  DelayedScriptStored as DelayedScriptStoredEvent,
  ExecutedScript as ExecutedScriptEvent,
  ExecutionCancelled as ExecutionCancelledEvent,
  ExecutionDelaySet as ExecutionDelaySetEvent,
  ExecutionPaused as ExecutionPausedEvent,
  ExecutionResumed as ExecutionResumedEvent,
} from "../generated/templates/Delay/Delay";
import {
  buildDelayedScriptEntityId,
  getDelayAppEntity,
  getDelayedScriptEntity,
  updateDelayedScript,
} from "./helpers";

export function handleDelayedScriptStored(e: DelayedScriptStoredEvent): void {
  updateDelayedScript(e.address, e.params.scriptId);

  const delayedScript = getDelayedScriptEntity(e.address, e.params.scriptId);

  delayedScript.creator = e.transaction.from;
  delayedScript.timeSubmitted = e.block.timestamp;

  delayedScript.save();
}

export function handleExecutionDelaySet(e: ExecutionDelaySetEvent): void {
  const delayApp = getDelayAppEntity(e.address);

  delayApp.executionDelay = e.params.executionDelay;

  delayApp.save();
}

export function handleExecutedScript(e: ExecutedScriptEvent): void {
  store.remove(
    "DelayedScript",
    buildDelayedScriptEntityId(e.address, e.params.scriptId)
  );
}

export function handleExecutionPaused(e: ExecutionPausedEvent): void {
  updateDelayedScript(e.address, e.params.scriptId);
}

export function handleExecutionResumed(e: ExecutionResumedEvent): void {
  updateDelayedScript(e.address, e.params.scriptId);
}

export function handleExecutionCancelled(e: ExecutionCancelledEvent): void {
  store.remove(
    "DelayedScript",
    buildDelayedScriptEntityId(e.address, e.params.scriptId)
  );
}
