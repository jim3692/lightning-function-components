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
  value;
  onSetValue;

  nextToGet;

  nameOfValue;
  nameOfSetValue;

  constructor({ defaultValue, onSetValue }) {
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

export default function useState(defaultValue) {
  const i = this.__statesCounter;

  if (!this.__states[i]) {
    this.__states.push(defaultValue);
    const { setState } = new StateSetter(this, i);

    const handler = new StateHandler({
      defaultValue: defaultValue,
      onSetValue: setState,
    });
    const newStateProxy = new Proxy({}, handler);
    this.__statesProxies.push(newStateProxy);
  }

  this.__statesCounter++;
  return this.__statesProxies[i];
}
