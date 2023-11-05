import { LightningElement, api } from "lwc";
import { LightningFunctionComponentMixin } from "c/lightningFunctionComponent";

import component from "./component";

export default class MyComponent extends LightningFunctionComponentMixin(
  LightningElement,
  component,
) {
  @api period;

  connectedCallback() {
    console.log(this.period);
  }
}
