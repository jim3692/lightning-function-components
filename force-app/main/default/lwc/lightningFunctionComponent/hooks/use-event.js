export default function useEvent(i, name, handler) {
  if (!this.__events[name]) {
    this.__events[name] = handler;
  }
}
