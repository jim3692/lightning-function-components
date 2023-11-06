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
  const result = useStateImpl.call(
    currentComponent,
    currentComponent.__statesCounter,
    ...arguments,
  );
  currentComponent.__statesCounter++;
  return result;
}

export function useEffect() {
  const result = useEffectImpl.call(
    currentComponent,
    currentComponent.__effectsCounter,
    ...arguments,
  );
  currentComponent.__effectsCounter++;
  return result;
}

export function useApex() {
  const result = useApexImpl.call(
    currentComponent,
    currentComponent.__apexAdaptersCounter,
    ...arguments,
  );
  currentComponent.__apexAdaptersCounter++;
  return result;
}

export function useRef() {
  const result = useRefImpl.call(
    currentComponent,
    currentComponent.__refsCounter,
    ...arguments,
  );
  currentComponent.__refsCounter++;
  return result;
}

export function useLwcState() {
  const result = useLwcStateImpl.call(currentComponent, 0, ...arguments);
  return result;
}
