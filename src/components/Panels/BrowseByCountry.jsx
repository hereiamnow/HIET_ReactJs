// File: BrowseByCountry.js
// Path: src/components/Drawers/BrowseByCountry.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 21, 2025
// Time: 10:30 AM
// Description: Drawer component for browsing cigars by country of origin with collapsible interface

import React, { useMemo } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

const BrowseByCountry = ({ cigars, navigate, theme, isCollapsed, onToggle }) => {
    const countryCategories = useMemo(() => [
        { label: 'Dominican Cigars', filterValue: 'Dominican Republic' },
        { label: 'Nicaraguan Cigars', filterValue: 'Nicaragua' },
        { label: 'Honduran Cigars', filterValue: 'Honduras' },
        { label: 'American Cigars', filterValue: 'USA' },
        { label: 'Cuban Cigars', filterValue: 'Cuba' },
        { label: 'Mexican Cigars', filterValue: 'Mexico' },
        { label: 'Peruvian Cigars', filterValue: 'Peru' },
        { label: 'Ecuadorian Cigars', filterValue: 'Ecuador' },
        { label: 'Colombian Cigars', filterValue: 'Colombia' },
        { label: 'Brazilian Cigars', filterValue: 'Brazil' },
        { label: 'Panamanian Cigars', filterValue: 'Panama' },
        { label: 'Costa Rican Cigars', filterValue: 'Costa Rica' },
        { label: 'Other Countries', filterValue: 'Other' } // Catch-all for unlisted countries
    ], []);

    const countryData = useMemo(() => {
        const counts = cigars.reduce((acc, cigar) => {
            const country = cigar.country || 'Unknown';
            const matchedCategory = countryCategories.find(cat => cat.filterValue.toLowerCase() === country.toLowerCase());

            if (matchedCategory) {
                acc[matchedCategory.label] = (acc[matchedCategory.label] || 0) + cigar.quantity;
            } else {
                acc['Other Countries'] = (acc['Other Countries'] || 0) + cigar.quantity;
            }
            return acc;
        }, {});

        // Map back to the original category labels, including those with zero count if desired,
        // but here we filter to only show categories with actual cigars.
        return countryCategories
            .map(category => ({
                label: category.label,
                quantity: counts[category.label] || 0,
                filterValue: category.filterValue
            }))
            .filter(item => item.quantity > 0)
            .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label
    }, [cigars, countryCategories]);

    return (
        <div id="pnlBrowseByCountry" className={`${theme.drawerBg} border ${theme.borderColor} rounded-xl overflow-hidden`}>
            <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
                <h3 className={`font-bold ${theme.primary} text-lg flex items-center`}>
                    {/* <MapPin className={`w-5 h-5 mr-2 ${theme.primary}`} />  */}
                    Browse by Country of Origin
                </h3>
                <ChevronDown className={`w-5 h-5 ${theme.primary} transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
            {!isCollapsed && (
                <div className="px-4 pb-4 space-y-2">
                    {countryData.length > 0 ? (
                        countryData.map(({ label, quantity, filterValue }) => (
                            <button
                                key={label}
                                onClick={() => navigate('HumidorsScreen', { preFilterCountry: filterValue })}
                                className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex justify-between items-center"
                            >
                                <span className="text-gray-300">{label}</span>
                                <span className="text-gray-400">({quantity})</span>
                            </button>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No country of origin data available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BrowseByCountry;