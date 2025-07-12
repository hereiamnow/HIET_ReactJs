---
mode: edit
description: Refactor a React class component or an old functional component to use React Hooks.
---
Refactor the React component in `{{file}}` to use modern React Hooks (`useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`, etc.).

**Instructions:**

1. If it's a class component, convert it to a functional component.

2. Replace `this.state` and `this.setState` with `useState` hooks.

3. Replace lifecycle methods (`componentDidMount`, `componentDidUpdate`, `componentWillUnmount`) with `useEffect` hooks.

4. If applicable, use `useContext` for context consumption.

5. Optimize performance with `useCallback` and `useMemo` for functions and values that are passed down to child components or are computationally expensive.

6. Ensure all necessary React hook imports are added (`import React, { useState, useEffect, ... } from 'react';`).

7. Maintain the component's original functionality and props.

8. Add comments to explain the refactored parts, especially where lifecycle methods were converted to `useEffect`.

Please analyze the component in `{{file}}` and propose the refactored code.