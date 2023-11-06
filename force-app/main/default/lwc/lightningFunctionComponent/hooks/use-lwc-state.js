export default function useLwcState(i, state) {
  const allKeys = new Set([
    ...Reflect.ownKeys(state),
    ...Reflect.ownKeys(this.state),
  ]);

  const diffs = [];
  Array.from(allKeys).forEach((k) => {
    if (!Object.is(state[k], this.state[k])) {
      diffs.push(k);
    }
  });

  if (diffs.length) {
    this.state = state;
  }
}
