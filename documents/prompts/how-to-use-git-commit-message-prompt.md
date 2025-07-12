# How to Use: Detailed Git Commit Message Prompt

This guide explains how to use the `detailed-git-commit-prompt-v2.prompt.md` file to automatically generate a comprehensive Git commit message for your staged changes.

---

## What This Prompt Does

This prompt tells Copilot to:

1.  **Analyze your staged changes:** It reads all the changes you've added to your Git staging area.
2.  **Generate a commit message:** It creates a detailed Git commit message based on those changes.
3.  **Follow Conventional Commits:** The generated message will adhere to a common standard (often called Conventional Commits) which includes:
    * A `Type(scope): Subject` line (e.g., `feat(auth): Implement user login`).
    * A more descriptive body explaining *what* and *why* the changes were made.
    * Optional sections for `BREAKING CHANGE:` and `Closes #IssueNumber`.

---

## When to Use It

Use this prompt when you want to:

* Generate clear, standardized, and informative Git commit messages.
* Ensure your commit history is easy to read and understand.
* Save time writing commit messages, especially for larger or more complex changes.
* Follow a consistent commit message convention in your project.

---

## Prerequisites

Before using this prompt, make sure you have:

* **Visual Studio Code** installed.
* **GitHub Copilot Chat** extension installed and active.
* **Changes staged in Git:** The changes you want to commit must be staged (added to the Git index) in your repository.

---

## How to Use It

Follow these steps to run the `detailed-git-commit-prompt-v2.prompt.md`:

1.  **Create the Prompt File:**
    * In your VS Code workspace, create a new folder named `.github/prompts` at the root of your repository (if it doesn't already exist).
    * Inside the `.github/prompts` folder, create a new file named `detailed-git-commit-prompt-v2.prompt.md`.
    * Copy and paste the content of the `detailed-git-commit-prompt-v2.prompt.md` prompt file (provided above) into this new file and save it.

2.  **Stage Your Changes:**
    * Open the **Source Control** view in VS Code (Ctrl+Shift+G).
    * Review your modifications and **stage** all the files and changes that you intend to include in your next commit. Copilot will use these staged changes as context.

3.  **Open Copilot Chat:**
    * Press `Ctrl+Alt+I` to open the Copilot Chat window.

4.  **Run the Prompt:**
    * In the Copilot Chat input box, type the following command:

        ```
        /detailed-git-commit-prompt-v2
        ```
    * Press `Enter`.

5.  **Review the Generated Message:**
    * Copilot will analyze your staged changes and provide a suggested commit message directly in the chat window.
    * **Review the message carefully.** While it aims to be accurate, you might want to make minor adjustments for clarity, specificity, or to add more context that Copilot might not infer (e.g., specific reasons for a design choice).
    * Once satisfied, you can copy the generated message and paste it into your Git commit input (e.g., in the Source Control view or your terminal).

---

## Important Considerations

* **Staged Changes Only:** Copilot will *only* consider changes that are currently staged. Unstaged changes will not be included in the commit message generation.
* **Review is Key:** Always review the generated message. It's a powerful assistant, but your final approval ensures accuracy and reflects your full intent.
* **Commit Message Length:** The prompt guides Copilot to keep the subject line concise (under 50 characters) and wrap body lines (at 72 characters) for better readability in Git logs.
