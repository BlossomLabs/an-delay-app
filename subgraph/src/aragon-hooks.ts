import { Address } from "@graphprotocol/graph-ts";

// an-delay-app.open.aragonpm.eth
const AN_DELAY_APP_ID =
  "0xcaa1392b514418cf88a239902c9ccafb9c9026f9755ec4e1992da02c0e765f73";

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
  if (appId === AN_DELAY_APP_ID) {
    return "Delay";
  } else {
    return null;
  }
}

export function onOrgTemplateCreated(orgAddress: Address): void {}
export function onAppTemplateCreated(appAddress: Address, appId: string): void {
  // setUpApp(appAddress);
}
export function onTokenTemplateCreated(tokenAddress: Address): void {}
