export class WireAdapter {
  component = null;
  resolveComponent = null;
  isComponentPending = true;

  data = [];

  constructor(dataCallback) {
    this.dataCallback = dataCallback;
    this.dataCallback();

    this.component = new Promise((resolve) => {
      this.resolveComponent = resolve;
    });

    this.component.then((component) => {
      component.__wireAdapter = this;
    });
  }

  connect() {}

  disconnect() {}

  update(config) {
    if (this.isComponentPending) {
      this.resolveComponent(config.component);
      this.isComponentPending = false;
    }

    if (config.data.length > this.data.length) {
      config.component.__wires.at(-1).update(config.data.at(-1));
      this.data = config.data;
      return;
    }

    const newData = [...config.data];
    for (const i in newData) {
      if (Object.is(newData[i], this.data[i])) {
        continue;
      }

      config.component.__wires[i].update(newData[i]);
    }

    this.data = newData;
  }
}
