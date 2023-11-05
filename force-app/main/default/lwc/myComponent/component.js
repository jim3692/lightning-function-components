import { useEffect, useState } from "c/lightningFunctionComponent";

export default function () {
  const { label, setLabel } = useState("counter");
  const { counter, setCounter } = useState(0);

  useEffect(() => {
    const loop = setInterval(() => {
      setCounter((old) => {
        const newValue = old + 1;
        setLabel(`${label} - ${newValue}`);
        return newValue;
      });
    }, this.period);

    return () => {
      clearInterval(loop);
      console.log("cleared loop", loop);
    };
  }, []);
}
