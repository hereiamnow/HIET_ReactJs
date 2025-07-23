// File: calculateAge.js
// Path: src/components/utils/calculateAge.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 14, 2025
// Time: 10:06 PM CDT

// Description: Calculates the age of a cigar based on its added date.
// Returns a human-readable string like "1 Year, 2 Months".

export const calculateAge = (isoString) => {
    if (!isoString) return 'N/A';
    const startDate = new Date(isoString);
    const now = new Date();

    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();

    if (months < 0 || (months === 0 && now.getDate() < startDate.getDate())) {
        years--;
        months = (months + 12) % 12;
    }

    if (years > 0) {
        return `${years} Year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} Month${months > 1 ? 's' : ''}` : ''}`;
    }
    if (months > 0) {
        return `${months} Month${months > 1 ? 's' : ''}`;
    }

    // Calculate days if less than a month
    const diffTime = Math.abs(now - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Day${diffDays !== 1 ? 's' : ''}`;
};
