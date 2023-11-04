export default function () {
  const { label, setLabel } = this.useState("counter");
  const { counter, setCounter } = this.useState(0);

  this.useEffect(() => {
    setInterval(() => {
      setCounter((old) => {
        const newValue = old + 1;
        setLabel(`${label} - ${newValue}`);
        return newValue;
      });
    }, 1000);
  }, []);
}
