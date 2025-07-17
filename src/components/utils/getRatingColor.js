
/**
 * A helper function to determine the color of the rating badge based on the score.
 */
export const getRatingColor = (rating) => {
    if (rating >= 95) return 'bg-blue-500/80 border-blue-400';
    if (rating >= 90) return 'bg-green-500/80 border-green-400';
    if (rating >= 85) return 'bg-yellow-500/80 border-yellow-400';
    if (rating >= 80) return 'bg-orange-500/80 border-orange-400';
    if (rating >= 75) return 'bg-red-500/80 border-red-400';
    if (rating >= 70) return 'bg-purple-500/80 border-purple-400';
    return 'bg-gray-600/80 border-gray-500';
};
