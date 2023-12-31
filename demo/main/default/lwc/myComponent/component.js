import {
  useEffect,
  useState,
  useApex,
  useRef,
  useLwcState,
  useEvent,
} from "c/lightningFunctionComponent";

import { useReact } from "c/reactComponent";

import getAccount from "@salesforce/apex/MyAuraEnabledClass.getAccount";
import ACCOUNT_NAME_FIELD from "@salesforce/schema/Account.Name";

import reactApp from "@salesforce/resourceUrl/reactApp";

const INITIAL_LABEL = "counter";

export default function () {
  const [label, setLabel] = useState("");
  const [counter, setCounter] = useState(0);
  const [accountConfig, setAccountConfig] = useState({
    recordId: "0017Q00000H7PNJQA3",
    fields: [ACCOUNT_NAME_FIELD],
  });

  useLwcState({ label });
  useReact(reactApp);

  const account = useApex(getAccount, accountConfig);

  const counterRef = useRef(counter);
  counterRef.current = counter;
  useEvent("handleClick", () => {
    alert(`counter: ${counterRef.current}`);
  });

  useEffect(() => {
    const loop = setInterval(() => {
      setCounter((old) => old + 1);
    }, this.period);

    return () => {
      clearInterval(loop);
      console.log("cleared loop", loop);
    };
  }, []);

  useEffect(() => {
    setLabel(`${INITIAL_LABEL} - ${counter}`);
  }, [counter]);

  useEffect(() => {
    console.log(JSON.stringify(account));
  }, [account]);
}
