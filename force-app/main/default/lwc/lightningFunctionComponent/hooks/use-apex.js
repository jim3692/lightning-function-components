class ApexHandler {
  component;
  adapterIdx;

  constructor(component, adapterIdx) {
    this.component = component;
    this.adapterIdx = adapterIdx;

    this._successCallback = this._successCallback.bind(this);
    this._errorCallback = this._errorCallback.bind(this);
  }

  runUpdate() {
    const adapter = this.component.__apexAdapters[this.adapterIdx];
    adapter
      .run(adapter.config)
      .then(this._successCallback)
      .catch(this._errorCallback);
  }

  _successCallback(data) {
    this._updateData({ data });
  }

  _errorCallback(error) {
    this._updateData({ error });
  }

  _updateData(value) {
    const oldData = this.component.__apexAdapterData;
    const updatedData = [...oldData];
    updatedData[this.adapterIdx] = value;
    this.component.__apexAdapterData = updatedData;
  }
}

export default function useApex(adapter, config) {
  const i = this.__apexAdaptersCounter;

  if (!this.__apexAdapters[i]) {
    const handler = new ApexHandler(this, i);
    this.__apexAdapters.push({
      handler: handler,
      run: adapter,
      config: config,
    });

    this.__apexAdaptersFields.push(config);
    handler.runUpdate();
  }

  if (!Object.is(config, this.__apexAdaptersFields[i])) {
    this.__apexAdapters[i].handler.runUpdate();
  }

  this.__apexAdaptersCounter++;
  return this.__apexAdapterData[i];
}
