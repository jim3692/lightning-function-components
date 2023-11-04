import { LightningElement, track } from "lwc";
import { LightningFunctionComponentMixin } from "c/lightningFunctionComponent";

import component from "./component";

export default class MyComponent extends LightningFunctionComponentMixin(
  LightningElement,
  component,
) {}
