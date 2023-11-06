export default function useEffect(i, callback, dependencies) {
  if (!this.__effects[i]) {
    this.__effects.push({
      lastState: dependencies,
      hasDependencies: !!dependencies,
      onCleanup: callback(),
    });
    return;
  }

  const effect = this.__effects[i];

  if (effect.hasDependencies && dependencies.length > 0) {
    const hasChangedDeps = !dependencies.every((el, idx) =>
      Object.is(el, effect.lastState[idx]),
    );
    if (hasChangedDeps) {
      effect.lastState = [...dependencies];
      effect.onCleanup && effect.onCleanup();
      effect.onCleanup = callback();
    }
  } else if (!effect.hasDependencies) {
    effect.onCleanup && effect.onCleanup();
    effect.onCleanup = callback();
  }
}
