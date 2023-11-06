export default function useRef(defaultValue) {
  const i = this.__refsCounter;

  if (!this.__refs[i]) {
    this.__refs.push({ current: defaultValue });
  }

  this.__refsCounter++;
  return this.__refs[i];
}
