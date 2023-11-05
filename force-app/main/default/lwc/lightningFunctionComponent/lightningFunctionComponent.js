import { LightningElement } from "lwc";

export default class LightningFunctionComponent extends LightningElement {
  constructor() {
    throw new TypeError("Not initializable component");
  }
}

const STATE_HANDLER_VALUE = 0;
const STATE_HANDLER_SET_VALUE = 1;

let currentComponent = null;

class StateSetter {
  component;
  stateIdx;

  constructor(component, stateIdx) {
    this.component = component;
    this.stateIdx = stateIdx;
    this.setState = this.setState.bind(this);
  }

  setState(value) {
    const oldStates = this.component.__states;
    if (Object.is(oldStates[this.stateIdx], value)) {
      return;
    }

    const updatedStates = [...oldStates];
    updatedStates[this.stateIdx] = value;
    this.component.__states = updatedStates;
  }
}

class StateHandler {
  state;
  value;
  onSetValue;

  nextToGet;

  nameOfValue;
  nameOfSetValue;

  constructor({ state, defaultValue, onSetValue }) {
    this.state = state;
    this.value = defaultValue;
    this.onSetValue = onSetValue;
    this.nextToGet = STATE_HANDLER_VALUE;
  }

  get(target, prop, receiver) {
    if (this.nextToGet === STATE_HANDLER_VALUE) {
      this.nextToGet++;
      this.nameOfValue = prop;
    }

    if (prop === this.nameOfValue) {
      this.state[prop] = this.value;
      return this.value;
    }

    if (this.nextToGet === STATE_HANDLER_SET_VALUE) {
      this.nextToGet++;
      this.nameOfSetValue = prop;
    }

    if (prop === this.nameOfSetValue) {
      return this.setValue.bind(this);
    }

    throw new TypeError("Unexpected field requested");
  }

  setValue(newValue) {
    if (newValue instanceof Function) {
      this.value = newValue(this.value);
    } else {
      this.value = newValue;
    }

    this.onSetValue(this.value);
  }

  set() {
    throw new TypeError("Writing is not allowed");
  }
}

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

export function useState(defaultValue) {
  const i = currentComponent.__statesCounter;

  if (!currentComponent.__states[i]) {
    currentComponent.__states.push(defaultValue);
    const { setState } = new StateSetter(currentComponent, i);

    const handler = new StateHandler({
      state: currentComponent.state,
      defaultValue: defaultValue,
      onSetValue: setState,
    });
    const newStateProxy = new Proxy({}, handler);
    currentComponent.__statesProxies.push(newStateProxy);
  }

  currentComponent.__statesCounter++;
  return currentComponent.__statesProxies[i];
}

export function useEffect(callback, dependencies) {
  const i = currentComponent.__effectsCounter;

  if (!currentComponent.__effects[i]) {
    currentComponent.__effects.push({ callback, dependencies });
    currentComponent.__effectsCounter++;
    return;
  }

  const effect = currentComponent.__effects[i];

  if (effect.hasDependencies && effect.dependencies.length > 0) {
    const hasChangedDeps = !dependencies.every((el, idx) =>
      Object.is(el, effect.lastState[idx]),
    );
    if (hasChangedDeps) {
      effect.lastState = [...effect.dependencies];
      currentComponent.__effectsQueue.push(() => {
        effect.onCleanup = effect.callback();
      });
    }
  } else if (!effect.hasDependencies) {
    currentComponent.__effectsQueue.push(() => {
      effect.onCleanup = effect.callback();
    });
  }

  currentComponent.__effectsCounter++;
}
