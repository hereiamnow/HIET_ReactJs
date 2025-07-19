/**
 * FilterSortModal - A modal component for filtering and sorting cigars
 * Allows users to select filters like brand, country, strength, and flavor notes
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.filters - Current filter values
 * @param {string} props.sortBy - Current sort criteria
 * @param {string} props.sortOrder - Current sort order (asc/desc)
 * @param {Function} props.onFilterChange - Function to handle filter changes
 * @param {Function} props.onFlavorNoteToggle - Function to toggle flavor notes
 * @param {Function} props.onSortChange - Function to handle sort changes
 * @param {Function} props.onClearFilters - Function to clear all filters
 * @param {Array} props.uniqueBrands - Array of unique brand names
 * @param {Array} props.uniqueCountries - Array of unique countries
 * @param {Array} props.availableFlavorNotes - Array of available flavor notes
 * @param {Object} props.theme - Theme object for styling
 */
import React from 'react';
import { Filter, X, ArrowUp, ArrowDown } from 'lucide-react';
import { strengthOptions } from '../../constants/cigarOptions';

const FilterSortModal = ({
    isOpen,
    onClose,
    filters,
    sortBy,
    sortOrder,
    onFilterChange,
    onFlavorNoteToggle,
    onSortChange,
    onClearFilters,
    uniqueBrands,
    uniqueCountries,
    availableFlavorNotes,
    theme
}) => {
    if (!isOpen) return null;

    const handleSortClick = (sortCriteria) => {
        onSortChange(sortCriteria);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center p-4 z-[200]" onClick={onClose}>
            <div className="bg-gray-800 rounded-t-2xl p-6 w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><Filter className="w-5 h-5 mr-2" /> Filter & Sort</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Sorting Section */}
                    <div>
                        <h4 className="font-bold text-white text-base mb-2">Sort By</h4>
                        <div className="flex flex-wrap gap-2">
                            {['name', 'brand', 'rating', 'quantity', 'price', 'dateAdded'].map(criteria => (
                                <button
                                    key={criteria}
                                    onClick={() => handleSortClick(criteria)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 transition-colors ${sortBy === criteria ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                                >
                                    {criteria === 'dateAdded' ? 'Date Added' : criteria.charAt(0).toUpperCase() + criteria.slice(1)}
                                    {sortBy === criteria && (sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtering Section */}
                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <h4 className="font-bold text-white text-base mb-2">Filter By</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`${theme.subtleText} text-sm mb-1 block`}>Brand</label>
                                <select value={filters.brand} onChange={(e) => onFilterChange('brand', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                                    <option value="">All Brands</option>
                                    {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`${theme.subtleText} text-sm mb-1 block`}>Country</label>
                                <select value={filters.country} onChange={(e) => onFilterChange('country', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                                    <option value="">All Countries</option>
                                    {uniqueCountries.map(country => <option key={country} value={country}>{country}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className={`${theme.subtleText} text-sm mb-1 block`}>Strength</label>
                                <select value={filters.strength} onChange={(e) => onFilterChange('strength', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                                    <option value="">All Strengths</option>
                                    {strengthOptions.map(strength => <option key={strength} value={strength}>{strength}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className={`${theme.subtleText} text-sm mb-1 block`}>Flavor Notes</label>
                            <div className="flex flex-wrap gap-2">
                                {availableFlavorNotes.map(note => (
                                    <button key={note} onClick={() => onFlavorNoteToggle(note)} className={`text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all duration-200 ${filters.flavorNotes.includes(note) ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                                        {note}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700">
                    <button onClick={onClearFilters} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors flex-grow">Clear Filters</button>
                    <button onClick={onClose} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors flex-grow">Done</button>
                </div>
            </div>
        </div>
    );
};

export default FilterSortModal;