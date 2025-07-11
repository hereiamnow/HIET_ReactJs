# CigarDetail Component Guide

This document provides a detailed overview and usage instructions for the `CigarDetail` component in the Humidor Hub application.

---

## Purpose

The `CigarDetail` component displays comprehensive information about a single cigar, including its profile, flavor notes, and actions such as editing, deleting, exporting, and smoking the cigar. It also integrates AI-powered features for pairing suggestions, tasting notes, similar cigars, and aging potential.

---

## Features

- **Cigar Profile Display:**  
  Shows brand, name, shape, size, origin, strength, wrapper, binder, filler, date added, time in humidor, rating, and descriptions.

- **Flavor Notes:**  
  Displays a static list of flavor notes associated with the cigar.

- **Image Display:**  
  Shows the cigar image or a placeholder if none is available.

- **Actions Toolbar:**  
  - **Edit:** Navigate to the EditCigar screen.
  - **Delete:** Delete the cigar (with confirmation).
  - **Export:** Export cigar data as CSV or JSON.
  - **Smoke This:** Decrease the quantity and show a confirmation message.

- **Roxy's Corner Panel:**  
  Collapsible panel with AI-powered actions:
  - **Suggest Pairings:** Get drink pairing suggestions.
  - **Generate Note Idea:** Generate a tasting note.
  - **Find Similar Smokes:** Get recommendations for similar cigars.
  - **Aging Potential:** Get an analysis of the cigar's aging potential.

- **GeminiModal Integration:**  
  Displays AI-generated content in a modal dialog.

- **FlavorNotesModal Integration:**  
  Allows editing of flavor notes (if enabled).

---

## Usage

The component expects the following props:

- `cigar`: The cigar object to display.
- `navigate`: Navigation function.
- `db`: Firestore database instance.
- `appId`: Application ID for Firestore pathing.
- `userId`: User ID for Firestore pathing.

Example usage in a parent component:

```jsx
<CigarDetail
  cigar={selectedCigar}
  navigate={navigate}
  db={db}
  appId={appId}
  userId={userId}
/>
```

---

## Notes

- **Smoke Confirmation:**  
  When the "Smoke This" button is clicked, the cigar's quantity is decremented and a confirmation message is shown for 3 seconds.

- **AI Features:**  
  The Roxy's Corner panel uses the Gemini API for generating content. Ensure a valid API key is configured.

- **Date and Aging:**  
  The component displays both the date the cigar was added and the calculated time it has spent in the humidor.

- **Export:**  
  Users can export the cigar's data in CSV or JSON format.

---

## Related Files

- `src/App.js` (component implementation)
- `add_cigar.md` (AddCigar component)
- `SETUP.md` (project setup)

---
