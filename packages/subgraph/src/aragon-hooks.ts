import { Address } from "@graphprotocol/graph-ts";
import { Delay as DelayContract } from "../generated/templates/Delay/Delay";
import { ERC20 as ERC20Contract } from "../generated/templates/Delay/ERC20";
import { getDelayAppEntity, getERC20TokenEntity } from "./helpers";

function setUpDelayApp(appAddress: Address): void {
  const delayApp = getDelayAppEntity(appAddress);
  const delayContract = DelayContract.bind(appAddress);
  const feeTokenAddress = delayContract.feeToken();
  const feeToken = getERC20TokenEntity(feeTokenAddress);
  const feeTokenContract = ERC20Contract.bind(feeTokenAddress);

  const res =  feeTokenContract.try_symbol();

  if (!res.reverted) {
    feeToken.symbol =res.value
    feeToken.name = feeTokenContract.name();
    feeToken.decimals = feeTokenContract.decimals();
  }

  delayApp.executionDelay = delayContract.executionDelay();
  delayApp.orgAddress = delayContract.kernel();
  delayApp.feeAmount = delayContract.feeAmount();
  delayApp.feeDestination = delayContract.feeDestination();
  delayApp.feeToken = feeToken.id;

  delayApp.save();
  feeToken.save();
}

const AN_DELAY_APP_IDS = [
  "0x13351f498ea57d9ad3e357afdb38bebae832341c89e544d5e8091ead272f605d", // an-delay.open.aragonpm.eth
];

/*
 * Called when an app proxy is detected.
 *
 * Return the name of a data source template if you would like to create it for a given appId.
 * Return null otherwise.
 *
 * The returned name is used to instantiate a template declared in the subgraph manifest file,
 * which must have the same name.
 */
export function getTemplateForApp(appId: string): string | null {
  if (AN_DELAY_APP_IDS.includes(appId)) {
    return "Delay";
  } else {
    return null;
  }
}

export function onOrgTemplateCreated(orgAddress: Address): void {}
export function onAppTemplateCreated(appAddress: Address, appId: string): void {
  setUpDelayApp(appAddress);
}
export function onTokenTemplateCreated(tokenAddress: Address): void {}
