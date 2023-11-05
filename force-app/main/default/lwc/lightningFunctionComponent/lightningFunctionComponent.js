import { LightningElement } from "lwc";

import useStateImpl from "./hooks/use-state";
import useEffectImpl from "./hooks/use-effect";

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
    __effectsQueue = [];

    __firstRun = true;

    state = {};

    render() {
      this.__statesCounter = 0;
      this.__effectsCounter = 0;

      currentComponent = this;
      const templateToRender = funCmp.call(this);

      if (this.__firstRun) {
        this.__effects.forEach((effect) => {
          effect.hasDependencies = !!effect.dependencies;
          effect.lastState = effect.dependencies && [...effect.dependencies];
          effect.onCleanup = effect.callback();
        });

        this.__firstRun = false;
      } else {
        this.__effectsQueue.forEach((f) => f());
      }
      this.__effectsQueue = [];

      if (templateToRender !== undefined) {
        return templateToRender;
      }

      return super.render();
    }
  };
}

export function useState() {
  return useStateImpl.call(currentComponent, ...arguments);
}

export function useEffect() {
  return useEffectImpl.call(currentComponent, ...arguments);
}
