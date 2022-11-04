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

export const handleDelayedScriptStored = ({
  address,
  params,
}: DelayedScriptStoredEvent) => {
  updateDelayScript(address, params.scriptId);
};

export const handleExecutionDelaySet = ({
  address,
  params,
}: ExecutionDelaySetEvent) => {
  const delayApp = getDelayAppEntity(address);

  delayApp.executionDelay = params.executionDelay;

  delayApp.save();
};

export const handleExecutedScript = (event: ExecutedScriptEvent) => {
  store.remove(
    "DelayScript",
    buildDelayScriptEntityId(event.address, event.params.scriptId)
  );
};

export const handleExecutionPaused = ({
  address,
  params,
}: ExecutionPausedEvent) => {
  updateDelayScript(address, params.scriptId);
};

export const handleExecutionResumed = ({
  address,
  params,
}: ExecutionResumedEvent) => {
  updateDelayScript(address, params.scriptId);
};

export const handleExecutionCancelled = (event: ExecutionCancelledEvent) => {
  store.remove(
    "DelayScript",
    buildDelayScriptEntityId(event.address, event.params.scriptId)
  );
};
