import { LightningElement } from "lwc";

import useStateImpl from "./hooks/use-state";
import useEffectImpl from "./hooks/use-effect";
import useApexImpl from "./hooks/use-apex";
import useRefImpl from "./hooks/use-ref";
import useLwcStateImpl from "./hooks/use-lwc-state";

export default class LightningFunctionComponent extends LightningElement {
  constructor() {
    throw new TypeError("Not initializable component");
  }
}

let currentComponent = null;

export function LightningFunctionComponentMixin(BaseClass, funCmp) {
  return class extends BaseClass {
    __states = [];
    __statesProxies = [];
    __statesCounter = 0;

    __effects = [];
    __effectsCounter = 0;

    __apexAdapters = [];
    __apexAdaptersFields = [];
    __apexAdapterData = [];
    __apexAdaptersCounter = 0;

    __refs = [];
    __refsCounter = 0;

    get __self() {
      return this;
    }

    state = {};

    render() {
      this.__statesCounter = 0;
      this.__effectsCounter = 0;
      this.__apexAdaptersCounter = 0;
      this.__refsCounter = 0;

      currentComponent = this;
      const templateToRender = funCmp.call(this);

      if (templateToRender !== undefined) {
        return templateToRender;
      }

      return super.render();
    }

    disconnectedCallback() {
      this.__effects
        .filter((effect) => effect.onCleanup)
        .forEach((effect) => effect.onCleanup());
    }
  };
}

export function useState() {
  return useStateImpl.call(currentComponent, ...arguments);
}

export function useEffect() {
  return useEffectImpl.call(currentComponent, ...arguments);
}

export function useApex() {
  return useApexImpl.call(currentComponent, ...arguments);
}

export function useRef() {
  return useRefImpl.call(currentComponent, ...arguments);
}

export function useLwcState() {
  return useLwcStateImpl.call(currentComponent, ...arguments);
}
