import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import {
  DelayApp as DelayAppEntity,
  DelayedScript as DelayedScriptEntity,
  ERC20 as ERC20Entity,
} from "../generated/schema";

export function buildDelayAppEntityId(appAddress: Address): string {
  return appAddress.toHexString();
}

export function buildDelayedScriptEntityId(
  appAddress: Address,
  scriptIndex: BigInt
): string {
  return `${appAddress.toHexString()}-${scriptIndex.toString()}`;
}

export function buildERC20EntityId(tokenAddress: Address): string {
  return tokenAddress.toHexString();
}

export function getDelayAppEntity(appAddress: Address): DelayAppEntity {
  const delayAppId = buildDelayAppEntityId(appAddress);
  let delayApp = DelayAppEntity.load(delayAppId);

  if (!delayApp) {
    delayApp = new DelayAppEntity(delayAppId);
    delayApp.appAddress = appAddress;
    delayApp.executionDelay = BigInt.fromI32(0);
    delayApp.orgAddress = Bytes.fromHexString("0x");
  }

  return delayApp;
}

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
    delayedScript.index = scriptIndex;
    delayedScript.delayApp = delayApp.id;
    delayedScript.creator = Bytes.fromHexString("0x");
    delayedScript.evmCallScript = Bytes.fromHexString("0x");
    delayedScript.executionTime = BigInt.fromI32(0);
    delayedScript.pausedAt = BigInt.fromI32(0);
    delayedScript.timeSubmitted = BigInt.fromI32(0);
    delayedScript.totalTimePaused = BigInt.fromI32(0);
    delayedScript.feeAmount = BigInt.fromI32(0);
  }

  return delayedScript;
};

export function getERC20TokenEntity(tokenAddress: Address): ERC20Entity {
  const erc20Id = buildERC20EntityId(tokenAddress);
  let erc20 = ERC20Entity.load(erc20Id);

  if (!erc20) {
    erc20 = new ERC20Entity(erc20Id);
    erc20.address = tokenAddress;
    erc20.decimals = 0;
    erc20.name = "";
    erc20.symbol = "";
  }

  return erc20;
}
