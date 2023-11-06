class StateSetter {
  component;
  stateIdx;

  constructor(component, stateIdx) {
    this.component = component;
    this.stateIdx = stateIdx;
    this.setState = this.setState.bind(this);
  }

  setState(newValue) {
    const oldStates = this.component.__states;
    const [oldValue] = oldStates[this.stateIdx];

    if (newValue instanceof Function) {
      newValue = newValue(oldValue);
    }

    if (Object.is(oldValue, newValue)) {
      return;
    }

    const updatedStates = [...oldStates];
    updatedStates[this.stateIdx] = [newValue, this.setState];
    this.component.__states = updatedStates;
  }
}

export default function useState(defaultValue) {
  const i = this.__statesCounter;

  if (!this.__states[i]) {
    const { setState } = new StateSetter(this, i);
    this.__states.push([defaultValue, setState]);
  }

  this.__statesCounter++;
  return this.__states[i];
}
