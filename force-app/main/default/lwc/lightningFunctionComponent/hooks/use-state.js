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

export default function useState(i, defaultValue) {
  if (!this.__states[i]) {
    const { setState } = new StateSetter(this, i);
    this.__states.push([defaultValue, setState]);
  }

  return this.__states[i];
}
