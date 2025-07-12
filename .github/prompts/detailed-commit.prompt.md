---
mode: ask
tools:
  - currentChanges
description: Generate a detailed Git commit message for all staged changes.
---
Generate a detailed Git commit message based on the current staged changes in the repository.

The commit message should follow these guidelines:

* **Type(scope): Subject** (e.g., `feat(authentication): Add user login via OAuth`)
    * **Type:** Must be one of `feat` (new feature), `fix` (bug fix), `docs` (documentation changes), `style` (formatting, missing semicolons, etc.; no code change), `refactor` (code refactoring), `perf` (performance improvements), `test` (adding missing tests or correcting existing tests), `build` (changes that affect the build system or external dependencies), `ci` (changes to CI configuration files and scripts), `chore` (other changes that don't modify src or test files), `revert` (reverts a previous commit).
    * **Scope (optional):** A short description of the part of the codebase affected (e.g., `authentication`, `UI`, `database`).
    * **Subject:** A concise, imperative mood description of the change, 50 characters or less.
* **Body:** A more detailed explanation of the change, what problem it solves, and why it was made. Wrap lines at 72 characters for readability.
* **Breaking Changes (optional):** If the change introduces any breaking API changes or requires special attention, describe them here with a `BREAKING CHANGE:` prefix.
* **Closes (optional):** Reference any issues or tickets that this commit closes (e.g., `Closes #123`, `Fixes ABC-456`).

Please analyze the changes thoroughly and provide a comprehensive message.