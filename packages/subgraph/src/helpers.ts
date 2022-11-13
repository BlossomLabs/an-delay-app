import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  DelayApp as DelayAppEntity,
  DelayedScript as DelayedScriptEntity,
} from "../generated/schema";
import { Delay as DelayContract } from "../generated/templates/Delay/Delay";

export const buildDelayAppEntityId = (appAddress: Address): string => {
  return appAddress.toHexString();
};

export const buildDelayedScriptEntityId = (
  appAddress: Address,
  scriptIndex: BigInt
): string => {
  return `${appAddress.toHexString()}-${scriptIndex.toString()}`;
};

export const getDelayAppEntity = (appAddress: Address): DelayAppEntity => {
  const delayAppId = buildDelayAppEntityId(appAddress);
  let delayApp = DelayAppEntity.load(delayAppId);

  if (!delayApp) {
    delayApp = new DelayAppEntity(delayAppId);
    delayApp.appAddress = appAddress;
    delayApp.executionDelay = BigInt.fromI32(0);
    delayApp.orgAddress = Bytes.fromHexString("0x");
  }

  return delayApp;
};

export const getDelayedScriptEntity = (
  appAddress: Address,
  scriptIndex: BigInt
): DelayedScriptEntity => {
  const delayApp = getDelayAppEntity(appAddress);
  const delayedScriptId = buildDelayedScriptEntityId(
    Address.fromBytes(delayApp.appAddress),
    scriptIndex
  );
  let delayedScript = DelayedScriptEntity.load(delayedScriptId);

  if (!delayedScript) {
    delayedScript = new DelayedScriptEntity(delayedScriptId);
    delayedScript.delayApp = delayApp.id;
    delayedScript.creator = Bytes.fromHexString("0x");
    delayedScript.evmCallScript = Bytes.fromHexString("0x");
    delayedScript.executionTime = BigInt.fromI32(0);
    delayedScript.pausedAt = BigInt.fromI32(0);
    delayedScript.timeSubmitted = BigInt.fromI32(0);
    delayedScript.totalTimePaused = BigInt.fromI32(0);
  }

  return delayedScript;
};

export const updateDelayedScript = (
  appAddress: Address,
  scriptIndex: BigInt
): void => {
  const delayContract = DelayContract.bind(appAddress);
  const delayedScriptRes = delayContract.delayedScripts(scriptIndex);

  if (delayedScriptRes.getExecutionTime() === BigInt.fromU32(0)) {
    return;
  }

  const delayedScript = getDelayedScriptEntity(appAddress, scriptIndex);

  const newExecutionTime = delayedScriptRes.getExecutionTime();
  const oldExecutionTime = delayedScript.executionTime.equals(BigInt.fromI32(0))
    ? newExecutionTime
    : delayedScript.executionTime;
  const timePaused = newExecutionTime.minus(oldExecutionTime);

  delayedScript.evmCallScript = delayedScriptRes.getEvmCallScript();
  delayedScript.executionTime = newExecutionTime;
  delayedScript.pausedAt = delayedScriptRes.getPausedAt();
  delayedScript.totalTimePaused = delayedScript.totalTimePaused.plus(
    timePaused
  );

  delayedScript.save();
};
