# AddHumidor Component Guide

This document provides an overview and usage instructions for the `AddHumidor` component in the Humidor Hub application.

---

## Purpose

The `AddHumidor` component is a React functional component that presents a form for users to add a new humidor to their collection. It supports image upload, environment tracking, and various humidor details.

---

## Features

- **Image Upload & AI Generation:**  
  Users can upload an image, paste a URL, or generate an image using AI for the humidor.

- **Form Fields:**  
  - Humidor Name
  - Short Description
  - Long Description
  - Type (e.g., Desktop, Cabinet, Travel, etc.)
  - Size (e.g., 150-count)
  - Location (e.g., Office)
  - Image (with preview and editing)
  - Environment Tracking (temperature and humidity)

- **Environment Tracking:**  
  Option to enable tracking of temperature and humidity for the humidor.

- **Validation:**  
  Ensures required fields are filled before saving.

- **Save/Cancel Actions:**  
  - **Save:** Adds the new humidor to Firestore and navigates to the humidors list.
  - **Cancel:** Returns to the humidors list without saving.

---

## Usage

The component expects the following props:

- `navigate`: Function for navigation.
- `db`: Firestore database instance.
- `appId`: Application ID for Firestore pathing.
- `userId`: User ID for Firestore pathing.
- `theme`: Theme object for styling.

Example usage in a parent component:

```jsx
<AddHumidor
  navigate={navigate}
  db={db}
  appId={appId}
  userId={userId}
  theme={theme}
/>
```

---

## Notes

- **Image Handling:**  
  The image and its position are managed in the form state and can be edited via a modal.

- **Environment Tracking:**  
  When enabled, users can input temperature and humidity values for the humidor.

- **Default Values:**  
  If no image is provided, a placeholder image is used.

---

## Related Files

- `src/App.js` (component implementation)
- `SETUP.md` (project setup)
- `package.json` (dependencies)

---
