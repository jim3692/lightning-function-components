# Lightning Function Components

> Why shouldn't we have the React Function Components hooks syntax in LWC?

This project is an attempt to port some existing and implement some new LWC specific hooks inside LWC.

There has been a [draft](https://rfcs.lwc.dev/rfcs/lwc/0000-functional-components) for functional components in LWC, but it has been rejected, so I just tried to implement my own version as a library.

## Considerations

- Not properly tested yet, so expect bugs.
- It overrides some LWC lifecycle hooks, so it is currently not advised to use them. Currently these lifecycle hooks are in use:
    - `render`
    - `renderedCallback`
    - `disconnectedCallback`
- The function component runs on `render`.
- It is possible to return a different template from the function component, like in a normal `render` method.

## Installation

- Copy the `lightningFunctionComponent` directory to your project's `lwc` directory and deploy.

## Example

The following example displays a counter that increments every second.

- myComponent.js
```js
import { LightningElement } from "lwc";
import { LightningFunctionComponentMixin } from "c/lightningFunctionComponent";

// Have the FC in a separate file for cleaner code
import component from "./component";

// Pass the LightningElement and our FC to the mixin
export default class MyComponent
  extends LightningFunctionComponentMixin(LightningElement, component) {
// Component body
// Probably only useful for `@api` fields
//   and native wire adapters, like `getRecord`
}
```

- myComponent.html
```html
<template>
  <!-- Read the label text -->
  <p>{state.label}</p>
</template>
```

- component.js
```js
import {
  useState, // React-like useState
  useEffect, // React-like useEffect
  useLwcState, // Custom hook to expose data to the template
} from "c/lightningFunctionComponent";

const INITIAL_LABEL = "counter";

export default function () {
  // Declare the label state
  const [label, setLabel] = useState("");
  // Declare the counter state
  const [counter, setCounter] = useState(0);

  // Expose the label to the template
  useLwcState({ label });

  useEffect(() => {
    // On first render create the loop that increments the counter
    const loop = setInterval(() => {
      setCounter((old) => old + 1);
    }, 1000);

    // Clear the interval on disconnectedCallback
    return () => {
      clearInterval(loop);
      console.log("cleared loop", loop);
    };
  }, []);

  useEffect(() => {
    // Update the label on counter update
    setLabel(`${INITIAL_LABEL} - ${counter}`);
  }, [counter]);
}
```

## Documentation

### useApex

###### Example

```js
import getAccount from "@salesforce/apex/MyAuraEnabledClass.getAccount";
import { useApex } from "c/lightningFunctionComponent";
// ...
const account = useApex(getAccount, accountConfig);
```

###### Details

A new-custom hook that is similar to how an Apex method would be wired.

Parameters:
- `adapter`: The imported Apex function.
- `config`: The object containing for the Apex method.

Returns:
- An object containing `data` and `error`.

Behavior:
- It fetches the data on first run, and every time the `config` gets updated.
- It's advisable to cache the `config` inside a state, or outside the FC to prevent this hook from fetching on every render.

### useEffect

###### Example

```js
import { useEffect } from "c/lightningFunctionComponent";
// ...
useEffect(() => {
    console.log(counter);
}, [counter]);
```

###### Details

It should work like React's useEffect.

Parameters:
- `callback`: The function to call.
- `dependencies`: An array containing the watched states.

Behavior:
- It always runs on the first render.
- The `callback` is updated on every run, to use the latest values of the states.
- If the `dependencies` array is not provided, then it re-runs the `callback` on every render.
- If the `dependencies` array is empty, then it does not run again.
- If the `dependencies` array is not empty, then it re-runs the `callback` every time a dependency updates.
- If the `callback` returns a function, it is called before every re-run and on `disconnectedCallback`.

### useEvent

###### Example

```html
<button events-click="handleClick">Click me</button>
```

```js
import { useEvent, useRef, useState } from "c/lightningFunctionComponent";
// ...
const [name, setName] = useState('Jack');
const nameRef = useRef(name);
nameRef.current = name;

useEvent('handleClick', (event) => {
    console.log('Hello ' + nameRef.current);
});
```

###### Details

This is a draft for handling events inside the FC. We may need [LWC#3618](https://github.com/salesforce/lwc/issues/3618) to be resolved, in order to implement a better solution.

Parameters:
- `handlerName`: The name of the handler defined in the `event-*` attribute in HTML
- `handler`: The function to be called.

Behavior:
- On every render it scans the component for elements with a `events-[name]` attribute. The `name` should be the event without the "on" prefix. For example, `click` instead of `onclick`.
- When the desired event occurs, it runs the `handler` function.
- The `handler` function is not updated after the first render, so it may end up having stale state references. It is advisable to use `useRef` to access the desired state from the `handler`, like in the example.

### useLwcState

###### Example

```html
<p>{state.name}</p>
```

```js
import { useLwcState, useState } from "c/lightningFunctionComponent";
// ...
const [name, setName] = useState('Jack');
useLwcState({ name });
```

###### Details

A new-custom hook that exposes the desired states to the template, under the `state` field.

Parameters:
- `state`: The new value of the `state` field of the component.

Behavior:
- On each render it checks if any of the fields, and their values, passed have been updated, and if they are different it updates the component's `state`.
- Since the hook contains an object, and it's called at the top level of the function's body, this object is actually a new one on each render.

### useRef

###### Example

```js
import { useRef } from "c/lightningFunctionComponent";
// ...
const statusRef = useRef(status);
// ...
console.log(statusRef.current);
```

###### Details

It should work like React's useEffect.

Parameters:
- `initialValue`: The value of the `current` field after the first run.

Returns:
- An object containing a `current` field.

Behavior:
- On first run, it creates a new object, containing the `current` field, set to `initialValue`.
- On every render, it returns the same object reference, that was initially created.
- It is typically used to cache values, or expose them to other objects/functions, without risking having stale values.
- In React, updating the `current` field should not cause the component to re-render, however, in LWC, it may cause a re-render, as LWC no longer requires the `@track` decorator for tracked fields.

### useState

###### Example

```js
import { useState } from "c/lightningFunctionComponent";
// ...
const [name, setName] = useRef('Jack');
// ...
console.log(name);
//...
setName('Chris');
```

###### Details

It should work like React's useState.

Parameters:
- `initialValue`: The value of the state after the first run.

Returns:
- An array with `state` and `setState`.
- These fields can be renamed with destructuring.
- The `state` contains the value, that was set in the previous render, or the `initialValue`.
- The `setState` is function used to update the `state` value.
