import { Address } from "@graphprotocol/graph-ts";
import { DelayApp as DelayAppEntity } from "../generated/schema";

const buildDelayAppEntityId = (appAddress: Address): string => {
  return appAddress.toHexString();
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
