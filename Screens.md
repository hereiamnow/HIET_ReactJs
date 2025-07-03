Of course. Here is the markdown code for the screen summary document.

```markdown
## Humidor Hub: Screen Breakdown

This document outlines the primary screens available in the Humidor Hub application and their functionalities.

### Main Navigation Screens

These are accessible from the bottom navigation bar.

* #### Dashboard
    * **Purpose:** Provides a high-level overview of the user's entire cigar collection.
    * **Features:**
        * Displays key statistics like total number of cigars, estimated value, and humidor count.
        * Shows a "Live Environment" card with mock temperature and humidity data (with a toggle between gauge and graph views).
        * Features "Roxy's Corner" for random cigar-related tips.
        * Includes an "Inventory Analysis" section with charts for top brands, countries, and strength distribution.
        * Offers a Gemini-powered feature to generate a narrative summary of the collection.

* #### My Humidors (`HumidorsScreen`)
    * **Purpose:** To browse and manage all of the user's humidors.
    * **Features:**
        * Lists all humidors, each with a summary card showing its name, location, cigar count, and environmental data.
        * Allows users to add a new humidor.
        * Includes a search bar to find specific cigars across all humidors.

* #### Alerts (`AlertsScreen`)
    * **Purpose:** To configure notifications for environmental changes within humidors.
    * **Features:**
        * Allows users to enable or disable humidity and temperature alerts for each humidor.
        * Provides fields to set minimum and maximum thresholds for these alerts.

* #### Settings (`SettingsScreen`)
    * **Purpose:** Central hub for application settings and customization.
    * **Features:**
        * Provides navigation to Profile, Notifications, Integrations, Data & Sync, and About screens.
        * Allows users to change the application's visual theme.

### Sub-Screens

These screens are accessed from other parts of the application.

* #### My Humidor (`MyHumidor`)
    * **Purpose:** View and manage the contents of a single, specific humidor.
    * **Features:**
        * Displays a list or grid of all cigars within that humidor.
        * Includes an "Edit" button to navigate to the `EditHumidor` screen.
        * Provides options to search, sort, and change the view layout.
        * Allows for multi-selecting cigars to move them to another humidor.

* #### Cigar Detail (`CigarDetail`)
    * **Purpose:** Show all information for a single cigar.
    * **Features:**
        * Displays a comprehensive profile including brand, origin, strength, wrapper, binder, and filler.
        * Shows a list of user-defined flavor notes.
        * Allows for adjusting the quantity of that cigar.
        * Features Gemini-powered buttons to:
            * Suggest drink pairings.
            * Generate a sample tasting note.
            * Find similar cigars.

* #### Add/Edit Cigar (`AddCigar`, `EditCigar`)
    * **Purpose:** To add a new cigar to a humidor or edit an existing one.
    * **Features:**
        * Provides a form to input all cigar details.
        * Includes a Gemini-powered "Auto-fill Details" button on the "Add Cigar" screen to automatically populate fields based on the cigar's name.

* #### Add/Edit Humidor (`AddHumidor`, `EditHumidor`)
    * **Purpose:** To create a new humidor or modify an existing one.
    * **Features:**
        * Form to input humidor details like name, description, size, and location.
        * The "Edit Humidor" screen contains a (currently disabled) dropdown for linking a Govee sensor.

* #### Integrations (`IntegrationsScreen`)
    * **Purpose:** Manage connections to third-party services.
    * **Features:**
        * Provides a field to enter and save a Govee API key to enable live sensor data.

* #### Data & Sync (`DataSyncScreen`)
    * **Purpose:** Allows users to import and export their collection data.
    * **Features:**
        * Export the entire cigar collection to a CSV or JSON file.
        * Import cigars from a CSV file into a selected humidor.

* #### Profile & About (`ProfileScreen`, `AboutScreen`)
    * **Purpose:** Display user profile information and application details.
    * **Features:**
        * The Profile screen shows a user avatar and summary statistics.
        * The About screen provides version information and links to legal documents.
```