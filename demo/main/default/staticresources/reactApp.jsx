export default function App() {
  const { useState, useEffect } = React;
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const loop = setInterval(() => {
      setCounter((c) => c + 1);
    }, 500);

    return () => clearInterval(loop);
  });

  return <div style={{ paddingTop: "2rem" }}>Counter: {counter}</div>;
}
