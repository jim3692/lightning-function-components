export default function useLwcState(state) {
  const allKeys = new Set([...Object.keys(state), ...Object.keys(this.state)]);

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
