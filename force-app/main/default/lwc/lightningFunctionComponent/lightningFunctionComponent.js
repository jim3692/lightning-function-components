import { LightningElement } from "lwc";

export default class LightningFunctionComponent extends LightningElement {
  constructor() {
    throw new TypeError("Not initializable component");
  }
}

const STATE_HANDLER_VALUE = 0;
const STATE_HANDLER_SET_VALUE = 1;

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

    useState(defaultValue) {
      const i = this.__statesCounter;

      if (!this.__states[i]) {
        this.__states.push(defaultValue);
        const { setState } = new StateSetter(this, i);

        const handler = new StateHandler({
          state: this.state,
          defaultValue: defaultValue,
          onSetValue: setState,
        });
        const newStateProxy = new Proxy({}, handler);
        this.__statesProxies.push(newStateProxy);
      }

      this.__statesCounter++;
      return this.__statesProxies[i];
    }

    useEffect(callback, dependencies) {
      const i = this.__effectsCounter;

      if (!this.__effects[i]) {
        this.__effects.push({ callback, dependencies });
        this.__effectsCounter++;
        return;
      }

      const effect = this.__effects[i];

      if (effect.hasDependencies && effect.dependencies.length > 0) {
        const hasChangedDeps = !dependencies.every((el, idx) =>
          Object.is(el, effect.lastState[idx]),
        );
        if (hasChangedDeps) {
          effect.lastState = [...effect.dependencies];
          this.__effectsQueue.push(() => {
            effect.onCleanup = effect.callback();
          });
        }
      } else if (!effect.hasDependencies) {
        this.__effectsQueue.push(() => {
          effect.onCleanup = effect.callback();
        });
      }

      this.__effectsCounter++;
    }

    render() {
      this.__statesCounter = 0;
      this.__effectsCounter = 0;

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
