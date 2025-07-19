/**
 * A helper function to parse the numerical capacity from a humidor's size string.
 * e.g., "150-count" -> 150
 * @param {string} sizeString - The size string to parse
 * @returns {number} The parsed numerical capacity
 */
export const parseHumidorSize = (sizeString) => {
    if (!sizeString || typeof sizeString !== 'string') return 0;
    const match = sizeString.match(/\d+/); // Find the first sequence of digits
    return match ? parseInt(match[0], 10) : 0;
};

/**
 * Formats an ISO date string into a more readable format (e.g., "July 5, 2025").
 * @param {string} isoString - The ISO date string to format
 * @returns {string} The formatted date string
 */
export const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    // Add timeZone to prevent off-by-one day errors
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
};