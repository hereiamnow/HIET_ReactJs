// File: HumidorsScreen.jsx
// Path: src/screens/HumidorsScreen.jsx
// Project: Humidor Hub
// Author: Extracted from App.js
// Date: July 23, 2025

// Description:
// A comprehensive screen for managing and viewing all humidors in the user's collection.
// Features advanced search and filtering capabilities by wrapper, strength, and country,
// displays humidor cards with capacity visualization, temperature/humidity monitoring,
// and collection statistics. Supports both humidor overview mode and filtered cigar
// browsing with real-time search suggestions and filter management.

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Plus, Thermometer, Droplets, ShieldPlus, MapPin, Leaf } from 'lucide-react';
import ListCigarCard from '../components/Cigar/ListCigarCard';
import { parseHumidorSize } from '../utils/formatUtils';

const HumidorsScreen = ({ navigate, cigars, humidors, db, appId, userId, theme, preFilterWrapper, preFilterStrength, preFilterCountry }) => { // July 5, 2025 - 2:00:00 AM CDT: Added preFilterCountry prop
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [activeWrapperFilter, setActiveWrapperFilter] = useState(preFilterWrapper || '');
    const [activeStrengthFilter, setActiveStrengthFilter] = useState(preFilterStrength || '');
    const [activeCountryFilter, setActiveCountryFilter] = useState(preFilterCountry || '');

    const DollarSignIcon = (props) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    );

    // New function to handle clearing filters.
    // It navigates to the Dashboard if a pre-filter was active.
    const handleClearFilter = () => {
        if (preFilterWrapper || preFilterStrength || preFilterCountry) {
            navigate('Dashboard');
        } else {
            // Clear local filters if they were not set via props
            setActiveWrapperFilter('');
            setActiveStrengthFilter('');
            setActiveCountryFilter('');
        }
    };

    // Effect to update activeWrapperFilter when preFilterWrapper prop changes
    useEffect(() => {
        if (preFilterWrapper) {
            setActiveWrapperFilter(preFilterWrapper);
            setSearchQuery(''); // Clear general search if a wrapper filter is applied
            setActiveStrengthFilter(''); // Clear strength filter if wrapper filter is applied
            setActiveCountryFilter(''); // July 5, 2025 - 2:00:00 AM CDT: Clear country filter if wrapper filter is applied
        } else {
            setActiveWrapperFilter(''); // Clear filter if preFilterWrapper is removed
        }
    }, [preFilterWrapper]);

    // Effect to update activeStrengthFilter when preFilterStrength prop changes
    useEffect(() => {
        if (preFilterStrength) {
            setActiveStrengthFilter(preFilterStrength);
            setSearchQuery(''); // Clear general search if a strength filter is applied
            setActiveWrapperFilter(''); // Clear wrapper filter if strength filter is applied
            setActiveCountryFilter(''); // July 5, 2025 - 2:00:00 AM CDT: Clear country filter if strength filter is applied
        } else {
            setActiveStrengthFilter(''); // Clear filter if preFilterStrength is removed
        }
    }, [preFilterStrength]);

    // Effect to update activeCountryFilter when preFilterCountry prop changes
    useEffect(() => {
        if (preFilterCountry) {
            setActiveCountryFilter(preFilterCountry);
            setSearchQuery(''); // Clear general search if a country filter is applied
            setActiveWrapperFilter(''); // Clear wrapper filter if country filter is applied
            setActiveStrengthFilter(''); // Clear strength filter if country filter is applied
        } else {
            setActiveCountryFilter(''); // Clear filter if preFilterCountry is removed
        }
    }, [preFilterCountry]);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1) {
            const allSuggestions = cigars.map(c => c.brand).concat(cigars.map(c => c.name)).filter(name => name && name.toLowerCase().includes(query.toLowerCase()));
            const uniqueSuggestions = [...new Set(allSuggestions)];
            setSuggestions(uniqueSuggestions.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setSuggestions([]);
    };

    const filteredCigars = useMemo(() => {
        let currentCigars = cigars;
        if (searchQuery) {
            currentCigars = currentCigars.filter(cigar =>
                cigar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cigar.brand.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        // Apply wrapper filter
        if (activeWrapperFilter) {
            currentCigars = currentCigars.filter(cigar =>
                cigar.wrapper && cigar.wrapper.toLowerCase() === activeWrapperFilter.toLowerCase()
            );
        }
        // Apply strength filter
        if (activeStrengthFilter) {
            if (activeStrengthFilter === 'Flavored') {
                currentCigars = currentCigars.filter(cigar => cigar.flavorNotes && cigar.flavorNotes.length > 0);
            } else {
                currentCigars = currentCigars.filter(cigar =>
                    cigar.strength && cigar.strength.toLowerCase() === activeStrengthFilter.toLowerCase()
                );
            }
        }

        if (activeCountryFilter) {
            if (activeCountryFilter === 'Other') {
                // Filter for cigars whose country is not explicitly listed in countryCategories
                const explicitCountries = ['dominican republic', 'nicaragua', 'honduras', 'usa', 'cuba'];
                currentCigars = currentCigars.filter(cigar =>
                    cigar.country && !explicitCountries.includes(cigar.country.toLowerCase())
                );
            } else {
                currentCigars = currentCigars.filter(cigar =>
                    cigar.country && cigar.country.toLowerCase() === activeCountryFilter.toLowerCase()
                );
            }
        }
        return currentCigars;
    }, [cigars, searchQuery, activeWrapperFilter, activeStrengthFilter, activeCountryFilter]);

    const totalUniqueCigars = filteredCigars.length;
    const totalQuantity = filteredCigars.reduce((sum, c) => sum + c.quantity, 0);

    return (
        <div className="p-4 pb-24">
            <h1 className="text-3xl font-bold text-white mb-6">My Humidors</h1>

            <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Search all cigars..." value={searchQuery} onChange={handleSearchChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                {searchQuery && (
                    <button onClick={handleClearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                )}
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-b-xl mt-1 z-20 overflow-hidden">
                        {suggestions.map(suggestion => (
                            <div key={suggestion} onMouseDown={() => handleSuggestionClick(suggestion)} className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors cursor-pointer">
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {activeWrapperFilter && (
                <div className="flex justify-between items-center mb-4 bg-amber-900/20 border border-amber-800 rounded-lg p-3">
                    <div>
                        <span className="text-amber-200 text-sm">Filtering by: <span className="font-bold text-amber-100">{activeWrapperFilter} Wrapper</span></span>
                        <p className="text-xs text-amber-300">Found {filteredCigars.length} matching cigars.</p>
                    </div>
                    <button onClick={handleClearFilter} className="p-1 rounded-full hover:bg-amber-800 transition-colors text-amber-300"><X className="w-4 h-4" /></button>
                </div>
            )}

            {activeStrengthFilter && (
                <div className="flex justify-between items-center mb-4 bg-amber-900/20 border border-amber-800 rounded-lg p-3">
                    <div>
                        <span className="text-amber-200 text-sm">Filtering by: <span className="font-bold text-amber-100">{activeStrengthFilter === 'Flavored' ? 'Flavored Cigars' : `${activeStrengthFilter} Strength`}</span></span>
                        <p className="text-xs text-amber-300">Found {filteredCigars.length} matching cigars.</p>
                    </div>
                    <button onClick={handleClearFilter} className="p-1 rounded-full hover:bg-amber-800 transition-colors text-amber-300"><X className="w-4 h-4" /></button>
                </div>
            )}

            {activeCountryFilter && (
                <div className="flex justify-between items-center mb-4 bg-amber-900/20 border border-amber-800 rounded-lg p-3">
                    <div>
                        <span className="text-amber-200 text-sm">Filtering by: <span className="font-bold text-amber-100">{activeCountryFilter === 'Other' ? 'Other Countries' : `${activeCountryFilter}`}</span></span>
                        <p className="text-xs text-amber-300">Found {filteredCigars.length} matching cigars.</p>
                    </div>
                    <button onClick={handleClearFilter} className="p-1 rounded-full hover:bg-amber-800 transition-colors text-amber-300"><X className="w-4 h-4" /></button>
                </div>
            )}

            {searchQuery === '' && !activeWrapperFilter && !activeStrengthFilter && !activeCountryFilter ? (
                <>
                    <div className="flex justify-between items-center mb-6 px-2">

                        <div id="pnlHumidorStatsNum" className="relative group">
                            <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 backdrop-blur-sm">
                                <div className="flex items-center justify-center gap-1">
                                    <span
                                        className="font-bold text-amber-400 text-lg hover:text-amber-300 transition-colors cursor-help"
                                        title="Unique cigars"
                                    >
                                        {totalUniqueCigars}
                                    </span>
                                    <span className="text-gray-500 font-medium">/</span>
                                    <span
                                        className="font-bold text-blue-400 text-lg hover:text-blue-300 transition-colors cursor-help"
                                        title="Total cigars"
                                    >
                                        {totalQuantity}
                                    </span>
                                </div>
                                {/* <div className="text-xs text-gray-500 text-center mt-0.5">cigars</div> */}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
                                <div className="text-center">
                                    <div className="text-amber-300">{totalUniqueCigars} unique cigars</div>
                                    <div className="text-blue-300">{totalQuantity} total cigars</div>
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                        </div>

                        {/* Browse by mode buttons */}
                        <div id="toolbar-buttons" className="flex justify-center gap-4">
                            <div className="relative group">
                                <button
                                    id="btnBrowseByWrapper"
                                    className={`p-3 bg-gray-800/50 border border-gray-700 rounded-full ${theme.primary} hover:bg-gray-700 transition-colors`}
                                >
                                    <Leaf className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
                                    Browse by Wrapper
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                                </div>
                            </div>

                            <div className="relative group">
                                <button
                                    id="btnBrowseByStrength"
                                    className={`p-3 bg-gray-800/50 border border-gray-700 rounded-full ${theme.primary} hover:bg-gray-700 transition-colors`}
                                >
                                    <ShieldPlus className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
                                    Browse by Strength
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                                </div>
                            </div>

                            <div className="relative group">
                                <button
                                    id="btnBrowseByCountry"
                                    className={`p-3 bg-gray-800/50 border border-gray-700 rounded-full ${theme.primary} hover:bg-gray-700 transition-colors`}
                                >
                                    <MapPin className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
                                    Browse by Country
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                                </div>
                            </div>

                            <div className="relative group">
                                <button
                                    id="btnAddHumidor"
                                    onClick={() => navigate('AddHumidor')}
                                    className="p-3 bg-amber-500 border border-amber-400 rounded-full text-white hover:bg-amber-600 transition-colors">
                                    <Plus className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
                                    Add Humidor
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
                                </div>
                            </div>

                        </div>

                    </div>


                    <div className="space-y-6">
                        {humidors.map(humidor => {
                            const cigarsInHumidor = cigars.filter(c => c.humidorId === humidor.id);
                            const cigarCount = cigarsInHumidor.reduce((sum, c) => sum + c.quantity, 0);
                            const humidorValue = cigarsInHumidor.reduce((sum, c) => sum + (c.quantity * (c.price || 0)), 0);
                            const humidorCapacity = parseHumidorSize(humidor.size);
                            const percentageFull = humidorCapacity > 0 ? Math.min(Math.round((cigarCount / humidorCapacity) * 100), 100) : 0;
                            const capacityColor = percentageFull > 90 ? 'bg-red-500' : theme.primaryBg;

                            return (
                                <div key={humidor.id} className="bg-gray-800/50 rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-amber-500/20 transition-shadow duration-300" onClick={() => navigate('MyHumidor', { humidorId: humidor.id })}>
                                    <div className="relative">
                                        <img src={humidor.image} alt={humidor.name} className="w-full h-32 object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 p-4">
                                            <h2 className="text-2xl font-bold text-white">{humidor.name}</h2>
                                            <p className="text-sm text-gray-300">{humidor.location}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-800 flex gap-4">
                                        <div className="flex flex-col justify-center items-center space-y-2 pr-4 border-r border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <Thermometer className="w-6 h-6 text-red-400" />
                                                <span className="text-2xl font-bold text-white">{humidor.temp}°F</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Droplets className="w-6 h-6 text-blue-400" />
                                                <span className="text-2xl font-bold text-white">{humidor.humidity}%</span>
                                            </div>
                                        </div>
                                        <div className="flex-grow flex flex-col justify-center">
                                            <div>
                                                <label className="text-xs text-gray-400">Capacity</label>
                                                <div className="relative w-full bg-gray-700 rounded-full h-6 mt-1">
                                                    <div style={{ width: `${percentageFull}%` }} className={`h-full rounded-full ${capacityColor} transition-all duration-500`}></div>
                                                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{percentageFull}% Full</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <div className="text-xs text-gray-400">
                                                    Value: <span className="font-bold text-white">${humidorValue.toFixed(2)}</span>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Cigars: <span className="font-bold text-white">{cigarCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredCigars.map(cigar => (
                        <ListCigarCard key={cigar.id} cigar={cigar} navigate={navigate} />
                    ))}
                    {filteredCigars.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-400">No cigars match your search.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HumidorsScreen;