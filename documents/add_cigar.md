# AddCigar Component Guide

This document provides an overview and usage instructions for the `AddCigar` component in the Humidor Hub application.

---

## Purpose

The `AddCigar` component is a React functional component that provides a form interface for users to add a new cigar to a selected humidor. It supports both manual entry and AI-assisted auto-fill for cigar details.

---

## Features

- **Image Upload & AI Generation:**  
  Users can upload an image, paste a URL, or generate an image using AI for the cigar.

- **Auto-fill Details:**  
  The "✨ Auto-fill Details" button uses the Gemini API to fetch cigar details based on the entered name.

- **Form Fields:**  
  - Name / Line
  - Brand
  - Shape (with auto-complete and auto-filling of length/ring gauge)
  - Size, Length (inches), Ring Gauge
  - Wrapper, Binder, Filler, Country (with auto-complete)
  - Strength (with suggestions)
  - Price, Rating, Quantity
  - Short Description, Description
  - Date Added (defaults to today)
  - Flavor Notes (with modal for selection)

- **Quantity Control:**  
  Interactive control for adjusting the number of cigars.

- **Validation:**  
  Ensures required fields are filled before saving.

- **Save/Cancel Actions:**  
  - **Save:** Adds the new cigar to Firestore and navigates to the humidor view.
  - **Cancel:** Returns to the humidor view without saving.

---

## Usage

The component expects the following props:

- `navigate`: Function for navigation.
- `db`: Firestore database instance.
- `appId`: Application ID for Firestore pathing.
- `userId`: User ID for Firestore pathing.
- `humidorId`: The ID of the humidor to add the cigar to.
- `theme`: Theme object for styling.

Example usage in a parent component:

```jsx
<AddCigar
  navigate={navigate}
  db={db}
  appId={appId}
  userId={userId}
  humidorId={selectedHumidorId}
  theme={theme}
/>
```

---

## Notes

- **Auto-fill:**  
  The auto-fill feature requires a valid Gemini API key and internet access.

- **Image Handling:**  
  The image and its position are managed in the form state and can be edited via a modal.

- **Date Added:**  
  Defaults to the current date but can be manually set.

- **Flavor Notes:**  
  Selected via a modal with a predefined list of notes.

---

## Related Files

- `src/App.js` (component implementation)
- `SETUP.md` (project setup)
- `package.json` (dependencies)

---
