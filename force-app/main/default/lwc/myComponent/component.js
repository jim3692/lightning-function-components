import { useEffect, useState, useWire } from "c/lightningFunctionComponent";

import { getRecord } from "lightning/uiRecordApi";
import ACCOUNT_NAME_FIELD from "@salesforce/schema/Account.Name";

export default function () {
  const { label, setLabel } = useState("counter");
  const { counter, setCounter } = useState(0);

  const account = useWire(getRecord, {
    recordId: "0017Q00000H7PNJQA3",
    fields: [ACCOUNT_NAME_FIELD],
  });

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

  console.log(JSON.stringify(account));
}
