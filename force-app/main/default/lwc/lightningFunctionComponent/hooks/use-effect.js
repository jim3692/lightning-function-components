export default function useEffect(callback, dependencies) {
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
