# Humidor Hub - Cigar Collection Management App

## Description

Humidor Hub is a web application designed for cigar aficionados to manage and track their personal cigar collections. It provides a detailed inventory system, allowing users to organize their cigars across multiple humidors, view detailed information about each cigar, and analyze their collection through various charts and AI-powered summaries.

This application is built with React and features a modern, responsive interface styled with Tailwind CSS.

## Key Features

* **Dashboard Overview:** A central hub to monitor the live environment (humidity & temperature) of your humidors, view key statistics, and get quick insights into your collection.
* **Multi-Humidor Management:** Add, edit, and manage multiple humidors, each with its own set of cigars.
* **Detailed Cigar Inventory:**
    * Add new cigars with detailed attributes like brand, shape, size, origin, wrapper, binder, filler, strength, and flavor notes.
    * View and edit details for each cigar.
    * Upload custom images for your cigars.
* **Bulk Cigar Management:**
    * Move multiple cigars from one humidor to another with an intuitive selection tool.
* **Data Analysis & Insights:**
    * **AI-Powered Summaries:** Use the Gemini API to get narrative summaries and tasting notes for your collection.
    * **Visual Charts:** View your inventory broken down by brand, country, and strength using both bar and pie charts.
* **Customization & Settings:**
    * **Theme Support:** Choose from multiple color themes (including light and dark modes) to personalize the app's appearance.
    * **Data Portability:** Export your entire collection to CSV or JSON formats for backup or use in other applications.
    * **Alerts:** Set up mock notifications for humidity and temperature thresholds for each humidor.
* **Roxy's Corner:** Get helpful tips and facts about cigar storage and enjoyment.

## Tech Stack

* **Frontend:** React.js
* **Styling:** Tailwind CSS
* **Charting:** Recharts
* **Icons:** Lucide React
* **AI Features:** Google Gemini API

## Getting Started: Development Environment Setup

Follow these steps to get the Humidor Hub application running on your local machine.

### Prerequisites

You'll need **Node.js** installed on your computer. This package includes **npm** (Node Package Manager), which you'll need to install the app's dependencies. You can download it from the official [Node.js website](https://nodejs.org/).

### Step-by-Step Guide

1.  **Create a New React App:**
    * Open your terminal or command prompt.
    * Navigate to the folder where you want to store your project.
    * Run the following command to create a new React project. You can replace `humidor-hub-app` with any name you like.
        ```bash
        npx create-react-app humidor-hub-app
        ```
    * Once it's finished, navigate into your new project folder:
        ```bash
        cd humidor-hub-app
        ```

2.  **Install Dependencies:**
    * The app uses a few libraries for charts and icons. Install them by running this command in your terminal:
        ```bash
        npm install recharts lucide-react
        ```
    * Next, install Tailwind CSS and its necessary peer dependencies:
        ```bash
        npm install -D tailwindcss postcss autoprefixer
        ```
    * Now, run the Tailwind initialization command. This will create both a `tailwind.config.js` and a `postcss.config.js` file for you.
        ```bash
        npx tailwindcss init -p
        ```
    * **If the command above fails** with an error like "'tailwindcss' is not recognized...", use the following command instead:
        ```bash
        ./node_modules/.bin/tailwindcss init -p
        ```

3.  **Configure Tailwind CSS:**
    * Open the `tailwind.config.js` file that was just created. Replace its contents with the following code to tell Tailwind which files to scan for its style classes.
        ```js
        /** @type {import('tailwindcss').Config} */
        module.exports = {
          content: [
            "./src/**/*.{js,jsx,ts,tsx}",
          ],
          theme: {
            extend: {},
          },
          plugins: [],
        }
        ```
    * Next, open the `src/index.css` file and replace its entire contents with these three lines to include Tailwind's base styles:
        ```css
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        ```

4.  **Add the Application Code:**
    * Open the `src/App.js` file located in your project's `src` folder.
    * Delete all of the existing code inside it.
    * Copy the **entire code** from the application I created for you and paste it into this empty `src/App.js` file.

5.  **Start the App:**
    * You're all set! Run the final command in your terminal from the project folder:
        ```bash
        npm start
        ```

Your web browser should automatically open to `http://localhost:3000`, where you'll see the Humidor Hub app running live.
