import { WireAdapter } from "../util/wire-adapter";

class DataCallback {
  component;
  wireIdx;

  constructor(component, wireIdx) {
    this.component = component;
    this.wireIdx = wireIdx;
    this.handle = this.callback.bind(this);
  }

  callback(value) {
    const oldData = this.component.__wiresData;
    const updatedData = [...oldData];
    updatedData[this.wireIdx] = value;
    this.component.__wiresData = updatedData;
  }
}

export default function useWire(Adapter, config) {
  const i = this.__wiresCounter;

  if (!this.__wires[i]) {
    const { dataCallback } = new DataCallback(this, i);

    const newWire = new Adapter(dataCallback);
    newWire.connect();

    this.__wires.push(newWire);
    this.__wireFields = [...this.__wireFields, config];
  }

  this.__wiresCounter++;
  return this.__wiresData[i];
}
