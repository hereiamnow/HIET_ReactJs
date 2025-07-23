// File: styleUtils.js
// Path: src/components/utils/styleUtils.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 14, 2025
// Time: 9:11 PM CDT

// Description: Style utility functions for UI components and theming

/**
 * A helper function to determine the color of a flavor tag based on the note.
 * This makes the UI more visually interesting and informative.
 * @param {string} note - The flavor note to get color for
 * @returns {string} CSS classes for the flavor tag styling
 */
export const getFlavorTagColor = (note) => {
    const lowerNote = note.toLowerCase();
    switch (lowerNote) {
        // Earthy/Woody
        case 'earthy': case 'woody': case 'leather': case 'oak': case 'toasted':
            return 'bg-yellow-900/50 text-yellow-200 border border-yellow-800';

        // Sweet
        case 'almond': case 'caramel': case 'chocolate': case 'coconut':
        case 'honey': case 'maple': case 'molasses': case 'raisin':
        case 'sweet': case 'vanilla':
            return 'bg-amber-700/60 text-amber-100 border border-amber-600';

        // Spicy
        case 'anise': case 'cardamom': case 'cinnamon': case 'clove':
        case 'ginger': case 'pepper': case 'paprika': case 'saffron':
        case 'spicy':
            return 'bg-red-800/60 text-red-200 border border-red-700';

        // Fruity
        case 'black cherry': case 'candle wax': case 'citrus':
        case 'floral': case 'fruity': case 'mint': case 'toasted bread':
            return 'bg-purple-800/60 text-purple-200 border border-purple-700';

        // Creamy/Nutty
        case 'buttery': case 'creamy': case 'nutty': case 'smoky':
            return 'bg-orange-900/60 text-orange-200 border border-orange-800';

        // Other
        case 'charred': case 'coffee':
            return 'bg-yellow-950/60 text-yellow-100 border border-yellow-900';

        // Default case for unrecognized notes
        default:
            return 'bg-gray-700 text-gray-200 border border-gray-600';
    }
};