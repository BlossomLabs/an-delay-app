import { Address } from "@graphprotocol/graph-ts";
import { Delay as DelayContract } from "../generated/templates/Delay/Delay";
import { getDelayAppEntity } from "./helpers";

const setUpDelayApp = (appAddress: Address): void => {
  const delayApp = getDelayAppEntity(appAddress);
  const delayContract = DelayContract.bind(appAddress);
  const executionDelay = delayContract.executionDelay();

  delayApp.executionDelay = executionDelay;
  delayApp.orgAddress = delayContract.kernel();

  delayApp.save();
};

const AN_DELAY_APP_IDS = [
  "0x13351f498ea57d9ad3e357afdb38bebae832341c89e544d5e8091ead272f605d", // an-delay.open.aragonpm.eth
  "0x89a9bbd656859e3d78cabb826d05f627ef0f61f4b6ddd49a749728495af630a2", // delay.open.aragonpm.eth
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
