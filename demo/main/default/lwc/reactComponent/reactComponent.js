import { LightningElement, api } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";

import reactjs from "@salesforce/resourceUrl/reactjs";
import {
  getCurrentComponent,
  useEffect,
  useRef,
  useState,
} from "c/lightningFunctionComponent";

let libraries = null;

function runJsx(code, { React }) {
  const exports = {};
  eval(code);
  return exports;
}

export default class ReactComponent extends LightningElement {
  static renderMode = "light";

  _appRoot;
  _resolveAppRoot;
  _appRootResolved = false;

  @api
  async renderJsx(jsx) {
    try {
      const source = await fetch(jsx).then((res) => res.text());
      const { Babel, React, ReactDOM } = await libraries;

      const { code } = Babel.transform(source, {
        presets: ["es2015", "react"],
      });

      const { default: app } = runJsx(code, { React });

      ReactDOM.createRoot(await this._appRoot).render(
        React.createElement(app, null),
      );
    } catch (err) {
      console.error("error rendering", err.message);
    }
  }

  _loadReact() {
    if (libraries) {
      return libraries;
    }

    let resolveLibraries;
    libraries = new Promise((resolve) => {
      resolveLibraries = resolve;
    });

    return fetch(reactjs + "/meta.json")
      .then((res) => res.json())
      .then((meta) => {
        return Object.values(meta)
          .map((v) => v.file)
          .map((file) => loadScript(this, `${reactjs}/${file}`));
      })
      .then((ls) => Promise.all(ls))
      .then(() => {
        resolveLibraries({ Babel, React, ReactDOM });
      });
  }

  _createReactWrapperComponent() {}

  connectedCallback() {
    this._loadReact();
    this._appRoot = new Promise((resolve) => {
      this._resolveAppRoot = resolve;
    });
  }

  renderedCallback() {
    if (!this._appRootResolved) {
      this._resolveAppRoot(this.querySelector("div"));
      this._appRootResolved = true;
    }
  }
}

export function useReact(jsx, customConfig = {}) {
  const config = {
    query: "c-react-component",
    ...customConfig,
  };

  const [el, setEl] = useState(null);
  const { current: currentComponent } = useRef(getCurrentComponent());

  useEffect(() => {
    const _el = currentComponent.template.querySelector(config.query);
    setEl(_el);
  }, []);

  useEffect(() => {
    if (jsx && el) {
      el.renderJsx(jsx);
    }
  }, [jsx, el]);
}
