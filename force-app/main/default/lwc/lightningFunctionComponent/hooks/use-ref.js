export default function useRef(i, defaultValue) {
  if (!this.__refs[i]) {
    this.__refs.push({ current: defaultValue });
  }

  return this.__refs[i];
}
