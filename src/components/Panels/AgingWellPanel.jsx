import React, { useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Clock, Award } from 'lucide-react';
import { calculateAge } from '../utils/calculateAge';
import { formatDate } from '../../utils/formatUtils';

/**
 * AgingWellPanel - Shows the three oldest cigars from the collection.
 * Displays aging status with visual indicators for mobile-friendly viewing.
 */
const AgingWellPanel = ({ cigars, navigate, theme, isCollapsed, onToggle }) => {
    // Get the three oldest cigars with valid dates
    const oldestCigars = useMemo(() => {
        return cigars
            .filter(cigar => cigar.dateAdded) // Only include cigars with valid dates
            .sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded)) // Sort oldest first
            .slice(0, 3); // Take only the first 3 (oldest)
    }, [cigars]);

    // Helper function to get aging status and color
    const getAgingStatus = (ageInDays) => {
        if (ageInDays >= 730) return { text: 'Perfectly Aged', color: 'text-amber-400 bg-amber-400/20' };
        if (ageInDays >= 365) return { text: 'Ready to Smoke', color: 'text-green-400 bg-green-400/20' };
        if (ageInDays >= 180) return { text: 'Maturing', color: 'text-blue-400 bg-blue-400/20' };
        return { text: 'Young', color: 'text-gray-400 bg-gray-400/20' };
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
                <h3 className={`font-bold ${theme.primary} text-lg flex items-center`}>
                    <Award className={`w-5 h-5 mr-2 ${theme.primary}`} /> Aging Well / From the Cellar
                </h3>
                <ChevronDown className={`w-5 h-5 ${theme.primary} transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
            {!isCollapsed && (
                <div className="p-4 space-y-3">
                    {oldestCigars.length > 0 ? (
                        oldestCigars.map((cigar, index) => {
                            const ageInDays = calculateAge(cigar.dateAdded, true);
                            const agingStatus = getAgingStatus(ageInDays);
                            
                            return (
                                <button
                                    key={cigar.id}
                                    onClick={() => navigate('CigarDetail', { cigarId: cigar.id })}
                                    className="w-full text-left p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-200 border border-gray-600/30"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-amber-400 bg-amber-400/20 px-2 py-1 rounded-full">
                                                    #{index + 1} Oldest
                                                </span>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${agingStatus.color}`}>
                                                    {agingStatus.text}
                                                </span>
                                            </div>
                                            <h4 className="text-white font-semibold text-sm mb-1 truncate">
                                                {cigar.brand} {cigar.name}
                                            </h4>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{calculateAge(cigar.dateAdded)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    <span>Since {formatDate(cigar.dateAdded)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="text-center py-6">
                            <Clock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No cigars with aging dates found.</p>
                            <p className="text-gray-600 text-xs mt-1">Add some cigars to start tracking aging!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AgingWellPanel;