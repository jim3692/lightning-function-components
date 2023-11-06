class DataCallback {
  component;
  wireIdx;

  constructor(component, wireIdx) {
    this.component = component;
    this.wireIdx = wireIdx;
    this.callback = this.callback.bind(this);
  }

  callback(value) {
    const oldData = this.component.__wiresData;
    const updatedData = [...oldData];
    updatedData[this.wireIdx] = value;
    this.component.__wiresData = updatedData;
  }
}

export default function useWire(adapter, config) {
  const i = this.__wiresCounter;

  if (!this.__wires[i]) {
    const { callback } = new DataCallback(this, i);

    adapter(config).then(callback)
    this.__wires.push(adapter);
    this.__wireFields = [...this.__wireFields, config];
  }

  if (!Object.is(config, this.__wireFields[i])) {
    this.__wires[i](config).then(callback)
  }

  this.__wiresCounter++;
  return this.__wiresData[i];
}
