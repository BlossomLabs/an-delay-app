import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  DelayApp as DelayAppEntity,
  DelayScript as DelayScriptEntity,
} from "../generated/schema";

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
    delayApp.delayScripts = [];
  }

  return delayApp;
};

export const getDelayScriptEntity = (
  appAddress: Address,
  scriptIndex: BigInt
): DelayScriptEntity => {
  const delayApp = getDelayAppEntity(appAddress);
  const delayScriptId = buildDelayScriptEntityId(
    delayApp.appAddress,
    scriptIndex
  );
  let delayScript = DelayScriptEntity.load(delayScriptId);

  if (!delayScript) {
    delayScript = new DelayScriptEntity(delayScriptId);
    delayScript.delayApp = delayApp.id;
  }

  return delayScript;
};
