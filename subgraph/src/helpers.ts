import { Address, BigInt } from "@graphprotocol/graph-ts";
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

  delayedScript.evmCallScript = delayedScriptRes.getEvmCallScript();
  delayedScript.executionTime = delayedScriptRes.getExecutionTime();
  delayedScript.pausedAt = delayedScriptRes.getPausedAt();

  delayedScript.save();
};
