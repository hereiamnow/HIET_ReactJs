// File: HumidorsScreen.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 20, 2025
// Time: 10:01 PM CDT

// Description: Humidors screen component - displays all cigars with filtering, sorting,
// and search functionality. Supports pre-filtering by wrapper, strength, or country.

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, LayoutGrid, List, Plus, ChevronLeft } from 'lucide-react';
import FilterSortModal from '../components/UI/FilterSortModal';
import GridCigarCard from '../components/Cigar/GridCigarCard';
import ListCigarCard from '../components/Cigar/ListCigarCard';

const HumidorsScreen = ({ navigate, cigars, humidors, db, appId, userId, theme, preFilterWrapper, preFilterStrength, preFilterCountry }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        brand: '',
        wrapper: preFilterWrapper || '',
        strength: preFilterStrength || '',
        country: preFilterCountry || '',
        minRating: 0,
        maxPrice: 1000,
        sortBy: 'name',
        sortOrder: 'asc'
    });

    // Generate search suggestions based on cigar data
    useEffect(() => {
        if (searchQuery.length > 0) {
            const allSuggestions = new Set();
            cigars.forEach(cigar => {
                if (cigar.brand?.toLowerCase().includes(searchQuery.toLowerCase())) {
                    allSuggestions.add(cigar.brand);
                }
                if (cigar.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
                    allSuggestions.add(cigar.name);
                }
                if (cigar.wrapper?.toLowerCase().includes(searchQuery.toLowerCase())) {
                    allSuggestions.add(cigar.wrapper);
                }
            });
            setSuggestions(Array.from(allSuggestions).slice(0, 5));
        } else {
            setSuggestions([]);
        }
    }, [searchQuery, cigars]);

    // Filter and sort cigars
    const filteredCigars = useMemo(() => {
        let filtered = cigars.filter(cigar => {
            const matchesSearch = !searchQuery || 
                cigar.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cigar.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cigar.wrapper?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesBrand = !filters.brand || cigar.brand?.toLowerCase().includes(filters.brand.toLowerCase());
            const matchesWrapper = !filters.wrapper || cigar.wrapper === filters.wrapper;
            const matchesStrength = !filters.strength || cigar.strength === filters.strength;
            const matchesCountry = !filters.country || cigar.country === filters.country;
            const matchesRating = (cigar.rating || 0) >= filters.minRating;
            const matchesPrice = (cigar.price || 0) <= filters.maxPrice;

            return matchesSearch && matchesBrand && matchesWrapper && matchesStrength && 
                   matchesCountry && matchesRating && matchesPrice;
        });

        // Sort cigars
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (filters.sortBy) {
                case 'name':
                    aValue = a.name || '';
                    bValue = b.name || '';
                    break;
                case 'brand':
                    aValue = a.brand || '';
                    bValue = b.brand || '';
                    break;
                case 'rating':
                    aValue = a.rating || 0;
                    bValue = b.rating || 0;
                    break;
                case 'price':
                    aValue = a.price || 0;
                    bValue = b.price || 0;
                    break;
                case 'dateAdded':
                    aValue = new Date(a.dateAdded || 0);
                    bValue = new Date(b.dateAdded || 0);
                    break;
                default:
                    aValue = a.name || '';
                    bValue = b.name || '';
            }

            if (filters.sortOrder === 'desc') {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            } else {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            }
        });

        return filtered;
    }, [cigars, searchQuery, filters]);

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setSuggestions([]);
    };

    const clearFilters = () => {
        setFilters({
            brand: '',
            wrapper: '',
            strength: '',
            country: '',
            minRating: 0,
            maxPrice: 1000,
            sortBy: 'name',
            sortOrder: 'asc'
        });
        setSearchQuery('');
    };

    const activeFiltersCount = Object.values(filters).filter(value => 
        value !== '' && value !== 0 && value !== 1000 && value !== 'name' && value !== 'asc'
    ).length + (searchQuery ? 1 : 0);

    return (
        <div className="p-4 pb-24">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">My Collection</h1>
                <button
                    onClick={() => navigate('AddCigar')}
                    className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search cigars..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                    />
                </div>
                
                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg mt-1 z-10">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300 first:rounded-t-lg last:rounded-b-lg"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Filter and View Controls */}
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                        <span className="ml-2 bg-amber-600 text-white text-xs rounded-full px-2 py-1">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                <div className="flex bg-gray-800 border border-gray-700 rounded-lg">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'} transition-colors rounded-l-lg`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'} transition-colors rounded-r-lg`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-gray-400 text-sm">
                {filteredCigars.length} cigar{filteredCigars.length !== 1 ? 's' : ''} found
                {activeFiltersCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="ml-2 text-amber-400 hover:text-amber-300 underline"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Cigars Grid/List */}
            {filteredCigars.length > 0 ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                    {filteredCigars.map(cigar => (
                        viewMode === 'grid' ? (
                            <GridCigarCard
                                key={cigar.id}
                                cigar={cigar}
                                humidors={humidors}
                                onNavigate={navigate}
                                theme={theme}
                            />
                        ) : (
                            <ListCigarCard
                                key={cigar.id}
                                cigar={cigar}
                                humidors={humidors}
                                onNavigate={navigate}
                                theme={theme}
                            />
                        )
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        {searchQuery || activeFiltersCount > 0 ? 
                            'No cigars match your search criteria.' : 
                            'No cigars in your collection yet.'
                        }
                    </div>
                    {(!searchQuery && activeFiltersCount === 0) && (
                        <button
                            onClick={() => navigate('AddCigar')}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Add Your First Cigar
                        </button>
                    )}
                </div>
            )}

            {/* Filter Modal */}
            <FilterSortModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                filters={filters}
                onFiltersChange={setFilters}
                cigars={cigars}
                theme={theme}
            />
        </div>
    );
};

export default HumidorsScreen;