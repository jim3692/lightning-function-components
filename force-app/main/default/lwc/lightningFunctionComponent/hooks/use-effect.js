export default function useEffect(i, callback, dependencies) {
  if (!this.__effects[i]) {
    const effect = {
      lastState: dependencies,
      hasDependencies: !!dependencies,
    };

    this.__effects.push(effect);
    this.__effectsQueue.push({ effect, callback });
    return;
  }

  const effect = this.__effects[i];

  if (effect.hasDependencies && dependencies.length > 0) {
    const hasChangedDeps = !dependencies.every((el, idx) =>
      Object.is(el, effect.lastState[idx]),
    );
    if (hasChangedDeps) {
      effect.lastState = [...dependencies];
      this.__effectsQueue.push({ effect, callback });
    }
  } else if (!effect.hasDependencies) {
    this.__effectsQueue.push({ effect, callback });
  }
}
