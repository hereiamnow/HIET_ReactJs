import React, { useMemo } from 'react';
import { Cigarette, ChevronDown } from 'lucide-react';

const BrowseByStrengthDrawer = ({ cigars, navigate, theme, isCollapsed, onToggle }) => {
    const strengthCategories = useMemo(() => [
        { label: 'Mild Cigars', filterValue: 'Mild' },
        { label: 'Mild to Medium Cigars', filterValue: 'Mild-Medium' },
        { label: 'Medium Cigars', filterValue: 'Medium' },
        { label: 'Medium to Full Cigars', filterValue: 'Medium-Full' },
        { label: 'Full Bodied Cigars', filterValue: 'Full' }
    ], []);

    const strengthData = useMemo(() => {
        const counts = strengthCategories.map(category => {
            let quantity = 0;
            // Sum quantities for a specific strength
            quantity = cigars
                .filter(cigar => cigar.strength === category.filterValue)
                .reduce((sum, cigar) => sum + cigar.quantity, 0);
            return { label: category.label, quantity, filterValue: category.filterValue };
        });
        return counts.filter(item => item.quantity > 0); // Only show categories with cigars
    }, [cigars, strengthCategories]);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
                <h3 className="font-bold text-amber-300 text-lg flex items-center">
                    <Cigarette className="w-5 h-5 mr-2" /> Browse by Profile
                </h3>
                <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
            {!isCollapsed && (
                <div className="px-4 pb-4 space-y-2">
                    {strengthData.length > 0 ? (
                        strengthData.map(({ label, quantity, filterValue }) => (
                            <button
                                key={label}
                                onClick={() => navigate('HumidorsScreen', { preFilterStrength: filterValue })}
                                className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex justify-between items-center"
                            >
                                <span className="text-gray-300">{label}</span>
                                <span className="text-gray-400">({quantity})</span>
                            </button>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No strength or flavored cigar data available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BrowseByStrengthDrawer;