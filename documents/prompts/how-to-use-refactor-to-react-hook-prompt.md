# How to Use: Refactor to React Hook Prompt

This guide explains how to use the `refactor-to-hook.prompt.md` file to automatically refactor your React components to use modern React Hooks.

---

## What This Prompt Does

This prompt tells Copilot to:

1.  **Analyze a specified React component file:** It reads the content of the `.jsx` or `.tsx` file you provide.
2.  **Convert to Functional Component:** If the component is a class component, it will convert it into a functional component.
3.  **Replace Old Patterns with Hooks:** It intelligently replaces older React patterns (like `this.state`, `this.setState`, and class lifecycle methods) with their corresponding React Hooks (`useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`).
4.  **Maintain Functionality:** The goal is to refactor the component while preserving its original behavior and props.
5.  **Add Imports and Comments:** It will ensure all necessary React hook imports are added and include comments to clarify the refactoring, especially for complex conversions.

---

## When to Use It

Use this prompt when you want to:

* Modernize your existing React codebase by adopting functional components and Hooks.
* Improve component readability and maintainability.
* Prepare components for future React features that might rely on Hooks.
* Learn how to manually convert components by observing Copilot's suggestions.

---

## Prerequisites

Before using this prompt, make sure you have:

* **Visual Studio Code** installed.
* **GitHub Copilot Chat** extension installed and active.
* A **React project** with components you wish to refactor.

---

## How to Use It

Follow these steps to run the `refactor-to-hook.prompt.md`:

1.  **Create the Prompt File:**
    * In your VS Code workspace, create a new folder named `.github/prompts` at the root of your repository (if it doesn't already exist).
    * Inside the `.github/prompts` folder, create a new file named `refactor-to-hook.prompt.md`.
    * Copy and paste the content of the `refactor-to-hook.prompt.md` prompt file (provided above) into this new file and save it.

2.  **Open Copilot Chat:**
    * Press `Ctrl+Alt+I` to open the Copilot Chat window.

3.  **Run the Prompt with the File Path:**
    * In the Copilot Chat input box, type the following command, replacing `path/to/your/component.jsx` with the actual relative path to the React component file you want to refactor:

        ```
        /refactor-to-hook: path/to/your/component.jsx
        ```
    * **Example:** If your component is located at `src/components/UserList.jsx`, you would type:
        ```
        /refactor-to-hook: src/components/UserList.jsx
        ```
    * Press `Enter`.

4.  **Review and Accept Changes:**
    * Copilot will analyze the specified component and then present a **diff view** in the VS Code editor. This view shows you exactly what code changes Copilot proposes to make to your file.
    * **Carefully review** these proposed changes. Pay attention to how state, effects, and context are handled.
    * If you're satisfied, click the **Accept** button to apply the changes to your file. If not, you can **Discard** them or modify them manually.

---

## Important Considerations

* **Complexity:** For very complex components with intricate logic or unusual lifecycle patterns, Copilot's initial refactoring might require further manual adjustments.
* **Testing:** After refactoring, it's highly recommended to run your component's tests (if you have them) or manually test the component in your application to ensure its functionality remains intact.
* **File Path:** Always ensure you provide the correct and complete relative path to the component file.
* **Review is Key:** As with all AI-generated code, a thorough review is essential to ensure the refactoring meets your project's standards and works as expected.
