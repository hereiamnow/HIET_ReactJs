// File: DeeperStatisticsScreen.jsx
// Path: src/screens/DeeperStatisticsScreen.jsx
// Project: Humidor Hub
// Author: Extracted from App.js
// Date: July 23, 2025

// Description:
// A comprehensive statistics screen that provides detailed insights into the user's cigar collection.
// Features collection value calculations, user rating analytics, favorite brand/country analysis,
// oldest cigar tracking, and tasting preference visualization with strength distribution charts
// and top flavor notes. Used to give users deeper understanding of their collection patterns.

import React, { useMemo } from 'react';
import { ChevronLeft, DollarSign, Star, Box, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { getFlavorTagColor } from '../utils/colorUtils';
import { formatDate } from '../utils/formatUtils';
import { calculateAge } from '../components/utils/calculateAge';

const DeeperStatisticsScreen = ({ navigate, cigars, theme }) => {
    // 1. Collection Value
    const totalValue = cigars.reduce((sum, c) => sum + ((c.price || 0) * (c.quantity || 0)), 0);

    // 2. Average User Rating (only rated cigars)
    const ratedCigars = cigars.filter(c => typeof c.userRating === 'number' && c.userRating > 0);
    const avgUserRating = ratedCigars.length > 0
        ? (ratedCigars.reduce((sum, c) => sum + c.userRating, 0) / ratedCigars.length).toFixed(1)
        : 'N/A';

    // 3. Favorite Brand/Country
    const getMostCommon = (arr, key) => {
        const counts = arr.reduce((acc, item) => {
            const val = (item[key] || '').trim();
            if (val) acc[val] = (acc[val] || 0) + (item.quantity || 1);
            return acc;
        }, {});
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? { name: sorted[0][0], count: sorted[0][1] } : null;
    };
    const favoriteBrand = getMostCommon(cigars, 'brand');
    const favoriteCountry = getMostCommon(cigars, 'country');

    // 4. Oldest Cigar
    const oldestCigar = cigars
        .filter(c => c.dateAdded)
        .sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded))[0];

    // Tasting Preferences Panel logic
    const strengthOptions = ['Mild', 'Mild-Medium', 'Medium', 'Medium-Full', 'Full'];
    const strengthCounts = useMemo(() => {
        const counts = {};
        cigars.forEach(cigar => {
            const strength = cigar.strength || 'Unknown';
            counts[strength] = (counts[strength] || 0) + (cigar.quantity || 1);
        });
        return counts;
    }, [cigars]);
    const totalStrengthCigars = strengthOptions.reduce((sum, s) => sum + (strengthCounts[s] || 0), 0);
    const preferredStrength = useMemo(() => {
        let max = 0, pref = 'N/A';
        for (const s of strengthOptions) {
            if ((strengthCounts[s] || 0) > max) {
                max = strengthCounts[s];
                pref = s;
            }
        }
        return pref;
    }, [strengthCounts]);
    const topFlavors = useMemo(() => {
        const flavorCounts = cigars.flatMap(c => c.flavorNotes || []).reduce((acc, flavor) => {
            acc[flavor] = (acc[flavor] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(flavorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(entry => entry[0]);
    }, [cigars]);

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className={`w-7 h-7 ${theme.text}`} />
                </button>
                <h1 className="text-3xl font-bold text-white">Deeper Statistics & Insights</h1>
            </div>
            <div className="space-y-6">
                {/* 1. Collection Value */}
                <div className={`${theme.card} p-4 rounded-xl flex items-center gap-4`}>
                    <DollarSign className="w-8 h-8 text-green-400" />
                    <div>
                        <p className="text-lg font-bold text-white">Collection Value</p>
                        <p className="text-2xl text-green-300 font-bold">${totalValue.toFixed(2)}</p>
                    </div>
                </div>
                {/* 2. Average User Rating */}
                <div className={`${theme.card} p-4 rounded-xl flex items-center gap-4`}>
                    <Star className="w-8 h-8 text-yellow-400" />
                    <div>
                        <p className="text-lg font-bold text-white">Average My Rating</p>
                        <p className="text-2xl text-yellow-300 font-bold">{avgUserRating}</p>
                        <p className="text-xs text-gray-400">{ratedCigars.length} cigars rated</p>
                    </div>
                </div>
                {/* 3. Favorite Brand/Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`${theme.card} p-4 rounded-xl flex items-center gap-4`}>
                        <Box className="w-8 h-8 text-amber-400" />
                        <div>
                            <p className="text-lg font-bold text-white">Favorite Brand</p>
                            <p className="text-xl text-amber-300 font-bold">{favoriteBrand ? favoriteBrand.name : 'N/A'}</p>
                            {favoriteBrand && <p className="text-xs text-gray-400">{favoriteBrand.count} cigars</p>}
                        </div>
                    </div>
                    <div className={`${theme.card} p-4 rounded-xl flex items-center gap-4`}>
                        <MapPin className="w-8 h-8 text-blue-400" />
                        <div>
                            <p className="text-lg font-bold text-white">Favorite Country</p>
                            <p className="text-xl text-blue-300 font-bold">{favoriteCountry ? favoriteCountry.name : 'N/A'}</p>
                            {favoriteCountry && <p className="text-xs text-gray-400">{favoriteCountry.count} cigars</p>}
                        </div>
                    </div>
                </div>
                {/* 4. Oldest Cigar */}
                <div className={`${theme.card} p-4 rounded-xl flex items-center gap-4`}>
                    <CalendarIcon className="w-8 h-8 text-purple-400" />
                    <div>
                        <p className="text-lg font-bold text-white">Oldest Cigar</p>
                        {oldestCigar ? (
                            <>
                                <p className="text-xl text-purple-300 font-bold">{oldestCigar.brand} {oldestCigar.name}</p>
                                <p className="text-xs text-gray-400">Aging since {formatDate(oldestCigar.dateAdded)} ({calculateAge(oldestCigar.dateAdded)})</p>
                            </>
                        ) : (
                            <p className="text-gray-400">No cigars with a date added.</p>
                        )}
                    </div>
                </div>
                {/* --- Tasting Preferences Panel --- */}
                <div id="pnlTastingPreferences" className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="font-bold text-amber-300 text-lg mb-3">Tasting Preferences</h3>
                    <div>
                        <h4 className="font-semibold text-white mb-2">Preferred Strength</h4>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-400">Most Common:</span>
                            <span className="font-bold text-amber-400">{preferredStrength}</span>
                        </div>
                        <div className="flex gap-1 w-full mb-1">
                            {strengthOptions.map(strength => {
                                const count = strengthCounts[strength] || 0;
                                const percent = totalStrengthCigars > 0 ? (count / totalStrengthCigars) * 100 : 0;
                                return (
                                    <div
                                        key={strength}
                                        className={`h-3 rounded-full transition-all duration-300 ${count > 0 ? 'bg-amber-500' : 'bg-gray-700'}`}
                                        style={{ width: `${percent}%`, minWidth: count > 0 ? '8%' : '2px' }}
                                        title={`${strength}: ${count}`}
                                    />
                                );
                            })}
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            {strengthOptions.map(strength => (
                                <span key={strength} className="w-1/5 text-center">{strength}</span>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-semibold text-white mb-2">Top Flavors</h4>
                        <div className="flex flex-wrap gap-2">{topFlavors.map(note => (<span key={note} className={`text-xs font-semibold px-3 py-1 rounded-full ${getFlavorTagColor(note)}`}>{note}</span>))}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeeperStatisticsScreen;