import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  DelayApp as DelayAppEntity,
  DelayScript as DelayScriptEntity,
} from "../generated/schema";
import { Delay as DelayContract } from "../generated/templates/Delay/Delay";

export const buildDelayAppEntityId = (appAddress: Address): string => {
  return appAddress.toHexString();
};

export const buildDelayScriptEntityId = (
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

export const getDelayScriptEntity = (
  appAddress: Address,
  scriptIndex: BigInt
): DelayScriptEntity => {
  const delayApp = getDelayAppEntity(appAddress);
  const delayScriptId = buildDelayScriptEntityId(
    Address.fromBytes(delayApp.appAddress),
    scriptIndex
  );
  let delayScript = DelayScriptEntity.load(delayScriptId);

  if (!delayScript) {
    delayScript = new DelayScriptEntity(delayScriptId);
    delayScript.delayApp = delayApp.id;
  }

  return delayScript;
};

export const updateDelayScript = (
  appAddress: Address,
  scriptIndex: BigInt
): void => {
  const delayContract = DelayContract.bind(appAddress);
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
