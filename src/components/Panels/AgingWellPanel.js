import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { calculateAge } from '../utils/calculateAge';
import { formatDate } from '../../utils/formatUtils';

/**
 * AgingWellPanel - Shows cigars that have been aging for over a year.
 * Highlights "Ready to Smoke" or "Perfectly Aged" cigars.
 */
const AgingWellPanel = ({ cigars, navigate, theme, isCollapsed, onToggle }) => {
    // Filter cigars aged over 1 year (365 days)
    const agedCigars = useMemo(() => {
        return cigars
            .filter(cigar => {
                // Only include cigars with a valid dateAdded
                if (!cigar.dateAdded) return false;
                
                const ageInDays = calculateAge(cigar.dateAdded, true); // Get age in days
                return ageInDays >= 365; // Check if age is 1 year or more
            })
            .sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded)); // Sort oldest first
    }, [cigars]);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
                <h3 className="font-bold text-amber-300 text-lg flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2" /> Aging Well / From the Cellar
                </h3>
                <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
            {!isCollapsed && (
                <div className="px-4 pb-4 space-y-2">
                    {agedCigars.length > 0 ? (
                        agedCigars.map(cigar => (
                            <button
                                key={cigar.id}
                                onClick={() => navigate('CigarDetail', { cigarId: cigar.id })}
                                className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex justify-between items-center"
                            >
                                <div>
                                    <span className="text-white font-semibold">{cigar.brand} {cigar.name}</span>
                                    <span className="block text-xs text-gray-400">
                                        Aging: {calculateAge(cigar.dateAdded)} {cigar.dateAdded ? `(Since ${formatDate(cigar.dateAdded)})` : ''}
                                    </span>
                                </div>
                                <span className="text-green-400 font-bold text-xs">
                                    {calculateAge(cigar.dateAdded, true) >= 730 ? "Perfectly Aged" : "Ready to Smoke"}
                                </span>
                            </button>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No cigars have been aging for over a year.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AgingWellPanel;