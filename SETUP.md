# Humidor Hub Setup & Usage Guide

This guide explains how to set up, build, and run the Humidor Hub application using either VS Code or the terminal. It also covers running Firebase emulators and using project scripts.

---

## Prerequisites

- **Node.js** (v16+ recommended)
- **npm** (comes with Node.js)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Visual Studio Code** (recommended)

---

## 1. Install Dependencies

Open a terminal in the project root and run:

```sh
npm install
```

---

## 2. Running Firebase Emulators

### Using Terminal

Run the following command to start the Firebase emulators:

```sh
npm run emulators
```

This executes the script defined in `package.json`:
```json
"emulators": "firebase emulators:start"
```

### Using Visual Studio Code Task

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Select **Tasks: Run Task**.
3. Choose **Start Firebase Emulators** from the list.

> **Note:**  
> When you start the Firebase emulators, the Emulator Suite UI will be available at [http://127.0.0.1:5000/](http://127.0.0.1:5000/).  
> This dashboard allows you to view and manage your running emulators (such as Firestore, Realtime Database, Authentication, etc.) locally.

---

## 3. Running the Application

### Using Terminal

To start the React development server:

```sh
npm start
```

This runs:
```json
"start": "react-scripts start"
```

### Using Visual Studio Code Task

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Select **Tasks: Run Task**.
3. Choose **npm: start**.

---

## 4. Building the Application

To create a production build:

```sh
npm run build
```

This runs:
```json
"build": "react-scripts build"
```

Or use the VS Code task **npm: build**.

---

## 5. Running Tests

To run tests:

```sh
npm test
```

Or use the VS Code task **npm: test**.

---

## 6. Available Scripts in `package.json`

- **start**: Runs the React development server.
- **build**: Builds the app for production.
- **test**: Runs the test suite.
- **eject**: Ejects the app (not reversible).
- **emulators**: Starts Firebase emulators.

---

## 7. Useful VS Code Tasks

The following tasks are available in `.vscode/tasks.json`:

- **npm: build** – Build the app.
- **npm: start** – Start the development server.
- **npm: test** – Run tests.
- **Start Firebase Emulators** – Start Firebase emulators.

Access these via **Terminal > Run Task...** or `Ctrl+Shift+P` > **Tasks: Run Task**.

---

## 8. Environment Variables

Some features may require environment variables (such as Firebase configuration).  
Create a `.env` file in the project root if needed. Example:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

> **Note:** Never commit your `.env` file with sensitive keys to version control.

---

## 9. Project Structure

A brief overview of the main folders and files:

```
├── public/           # Static assets
├── src/              # React source code
│   ├── components/   # Reusable components
│   ├── App.js        # Main app component
│   └── ...           # Other source files
├── .env              # (Optional) Environment variables
├── package.json      # Project configuration and scripts
└── ...
```

---

## 10. Troubleshooting

- **Port already in use:**  
  If you see an error about a port being in use, stop other running servers or change the port in your scripts.

- **Missing dependencies:**  
  Run `npm install` to ensure all dependencies are installed.

- **Firebase CLI not found:**  
  Install globally with `npm install -g firebase-tools`.

---

## 11. Updating Dependencies

To update all dependencies to their latest versions:

```sh
npm update
```

For a specific package:

```sh
npm install <package-name>@latest
```

---

## 12. Deployment

To deploy your app (for example, to Firebase Hosting):

1. Build the app:  
   ```sh
   npm run build
   ```
2. Deploy (if using Firebase):  
   ```sh
   firebase deploy
   ```

Refer to the Firebase documentation for more deployment options.

---

## 13. Getting Help / Contributing

- For issues or questions, open an issue in the repository.
- Contributions are welcome! Please fork the repo and submit a pull request.

---
