// File: MyHumidor.js
// Path: src/screens/MyHumidor.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 20, 2025
// Time: 10:01 PM CDT

// Description: My Humidor screen component - displays individual humidor details
// with cigars, environmental data, and management options

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Edit, Plus, Search, Filter, LayoutGrid, List, Thermometer, Droplets, Box, DollarSign, Star, Move, Trash2, CheckSquare, ArrowUp, ArrowDown, X } from 'lucide-react';
import { doc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { parseHumidorSize, formatDate } from '../utils/formatUtils';
import { callGeminiAPI } from '../services/geminiService';
import { strengthOptions } from '../constants/cigarOptions';

// Import components
import FilterSortModal from '../components/UI/FilterSortModal';
import HumidorActionMenu from '../components/Menus/HumidorActionMenu';
import GridCigarCard from '../components/Cigar/GridCigarCard';
import ListCigarCard from '../components/Cigar/ListCigarCard';

// Import modal components
import ManualReadingModal from '../components/Modals/Forms/ManualReadingModal';
import MoveCigarsModal from '../components/Modals/Actions/MoveCigarsModal';
import DeleteHumidorModal from '../components/Modals/Actions/DeleteHumidorModal';
import DeleteCigarsModal from '../components/Modals/Actions/DeleteCigarsModal';
import ExportModal from '../components/Modals/Data/ExportModal';
const MyHumidor = ({ humidor, navigate, cigars, humidors, db, appId, userId, theme }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedCigarIds, setSelectedCigarIds] = useState([]);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isDeleteHumidorModalOpen, setIsDeleteHumidorModalOpen] = useState(false);
    const [isDeleteCigarsModalOpen, setIsDeleteCigarsModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isManualReadingModalOpen, setIsManualReadingModalOpen] = useState(false);
    const [isFilterSortModalOpen, setIsFilterSortModalOpen] = useState(false);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [filters, setFilters] = useState({ brand: '', country: '', strength: '', flavorNotes: [] });
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    // --- Auto-fill Missing Cigar Details Banner Logic ---
    const [showAutofillBanner, setShowAutofillBanner] = useState(true);
    const [isAutofilling, setIsAutofilling] = useState(false);
    const [autofillStatus, setAutofillStatus] = useState(""); // For feedback

    // Fields to auto-fill (do NOT include shape, size, length_inches, ring_gauge)
    const FIELDS_TO_AUTOFILL = [
        "shortDescription", "description", "wrapper", "binder", "filler", "rating", "flavorNotes", "price"
    ];

    const filteredAndSortedCigars = useMemo(() => {
        let currentCigars = cigars.filter(c => c.humidorId === humidor.id);

        if (searchQuery) {
            currentCigars = currentCigars.filter(cigar => cigar.name.toLowerCase().includes(searchQuery.toLowerCase()) || cigar.brand.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        if (filters.brand) currentCigars = currentCigars.filter(cigar => cigar.brand === filters.brand);
        if (filters.country) currentCigars = currentCigars.filter(cigar => cigar.country === filters.country);
        if (filters.strength) currentCigars = currentCigars.filter(cigar => cigar.strength === filters.strength);
        if (filters.flavorNotes.length > 0) {
            currentCigars = currentCigars.filter(cigar => filters.flavorNotes.every(note => cigar.flavorNotes.includes(note)));
        }

        currentCigars.sort((a, b) => {
            let valA, valB;
            switch (sortBy) {
                case 'name': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
                case 'brand': valA = a.brand.toLowerCase(); valB = b.brand.toLowerCase(); break;
                case 'rating': valA = a.rating || 0; valB = b.rating || 0; break;
                case 'quantity': valA = a.quantity; valB = b.quantity; break;
                case 'price': valA = a.price || 0; valB = b.price || 0; break;
                case 'dateAdded': valA = a.dateAdded; valB = b.dateAdded; break;
                default: return 0;
            }
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return currentCigars;
    }, [cigars, humidor.id, searchQuery, filters, sortBy, sortOrder]);

    // Find cigars with missing fields (only for this humidor)
    const cigarsWithMissingDetails = filteredAndSortedCigars.filter(cigar =>
        FIELDS_TO_AUTOFILL.some(field =>
            cigar[field] === undefined ||
            cigar[field] === "" ||
            (Array.isArray(cigar[field]) && cigar[field].length === 0)
        )
    );

    const isFilterActive = useMemo(() => {
        return filters.brand || filters.country || filters.strength || filters.flavorNotes.length > 0;
    }, [filters]);

    const uniqueBrands = useMemo(() => [...new Set(cigars.filter(c => c.humidorId === humidor.id).map(c => c.brand))].sort(), [cigars, humidor.id]);
    const uniqueCountries = useMemo(() => [...new Set(cigars.filter(c => c.humidorId === humidor.id).map(c => c.country))].sort(), [cigars, humidor.id]);
    const availableFlavorNotes = useMemo(() => [...new Set(cigars.filter(c => c.humidorId === humidor.id).flatMap(c => c.flavorNotes))].sort(), [cigars, humidor.id]);

    const totalQuantity = filteredAndSortedCigars.reduce((sum, c) => sum + c.quantity, 0);
    const humidorValue = filteredAndSortedCigars.reduce((sum, c) => sum + (c.quantity * (c.price || 0)), 0);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1) {
            const allSuggestions = cigars.filter(c => c.humidorId === humidor.id).map(c => c.brand).concat(cigars.filter(c => c.humidorId === humidor.id).map(c => c.name)).filter(name => name.toLowerCase().includes(query.toLowerCase()));
            setSuggestions([...new Set(allSuggestions)].slice(0, 5));
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

    const handleToggleSelectMode = () => {
        setIsSelectMode(!isSelectMode);
        setSelectedCigarIds([]);
    };

    const handleSelectCigar = (cigarId) => {
        setSelectedCigarIds(prev => prev.includes(cigarId) ? prev.filter(id => id !== cigarId) : [...prev, cigarId]);
    };

    // Function to handle the Move Cigars action
    const handleMoveCigars = async (destinationHumidorId) => {
        // Get a new write batch
        const batch = writeBatch(db);
        // Iterate over each selected cigar ID
        selectedCigarIds.forEach(cigarId => {
            // Correctly reference the cigar document using the cigarId from the loop
            const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigarId);
            // Update the humidorId and reset the dateAdded for the moved cigar
            batch.update(cigarRef, { humidorId: destinationHumidorId, dateAdded: new Date().toISOString() });
        });
        // Commit the batch update
        await batch.commit();
        // Reset state and navigate to the destination humidor
        setIsMoveModalOpen(false);
        setIsSelectMode(false);
        setSelectedCigarIds([]);
        navigate('MyHumidor', { humidorId: destinationHumidorId });
    };

    const handleConfirmDeleteHumidor = async ({ action, destinationHumidorId }) => {
        const batch = writeBatch(db);
        const cigarsToDelete = cigars.filter(c => c.humidorId === humidor.id);

        switch (action) {
            case 'move':
                cigarsToDelete.forEach(cigar => {
                    const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigar.id);
                    batch.update(cigarRef, { humidorId: destinationHumidorId });
                });
                break;
            case 'export':
            case 'deleteAll':
                cigarsToDelete.forEach(cigar => {
                    const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigar.id);
                    batch.delete(cigarRef);
                });
                break;
            default: break;
        }

        const humidorRef = doc(db, 'artifacts', appId, 'users', userId, 'humidors', humidor.id);
        batch.delete(humidorRef);

        await batch.commit();
        setIsDeleteHumidorModalOpen(false);
        navigate('HumidorsScreen');
    };

    const handleAutofillMissingDetails = async () => {
        setIsAutofilling(true);
        setAutofillStatus("Auto-filling details...");

        for (const cigar of cigarsWithMissingDetails) {
            // Build prompt for Gemini
            const missingFields = FIELDS_TO_AUTOFILL.filter(f =>
                cigar[f] === undefined ||
                cigar[f] === "" ||
                (Array.isArray(cigar[f]) && cigar[f].length === 0)
            );
            if (!cigar.name || missingFields.length === 0) continue;

            const prompt = `You are a cigar database. Fill in missing details for this cigar as a JSON object.
Cigar: "${cigar.brand} ${cigar.name}".
Missing fields: ${missingFields.join(", ")}.
Schema: { "shortDescription": "string", "description": "string", "wrapper": "string", "binder": "string", "filler": "string", "rating": "number", "flavorNotes": ["string"], "price": "number" }.
If you cannot determine a value, use "" or [] or 0. Only return the JSON object.`;

            const responseSchema = {
                type: "OBJECT",
                properties: {
                    shortDescription: { type: "STRING" },
                    description: { type: "STRING" },
                    wrapper: { type: "STRING" },
                    binder: { type: "STRING" },
                    filler: { type: "STRING" },
                    rating: { type: "NUMBER" },
                    flavorNotes: { type: "ARRAY", items: { type: "STRING" } },
                    price: { type: "NUMBER" }
                }
            };

            const result = await callGeminiAPI(prompt, responseSchema);

            if (typeof result === "object" && result !== null) {
                // Only update missing fields
                const updateData = {};
                FIELDS_TO_AUTOFILL.forEach(field => {
                    if (
                        (!cigar[field] || (Array.isArray(cigar[field]) && cigar[field].length === 0)) &&
                        result[field] !== undefined
                    ) {
                        updateData[field] = result[field];
                    }
                });
                console.log("Fields to update for", cigar.name, updateData);
                if (Object.keys(updateData).length > 0) {
                    const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigar.id);
                    await updateDoc(cigarRef, updateData);
                }
            } else {
                setAutofillStatus(`Roxy couldn't find any details for "${cigar.name}".`);
                console.warn("No data returned from Gemini for", cigar.name, result);
            }
        }
        setAutofillStatus("Auto-fill complete!");
        setIsAutofilling(false);
        setShowAutofillBanner(false);
    };

    // Function to handle the confirmation of deleting selected cigars
    const handleConfirmDeleteCigars = async () => {
        // Get a new write batch
        const batch = writeBatch(db);
        // Iterate over each selected cigar ID
        selectedCigarIds.forEach(cigarId => {
            // Correctly reference the cigar document using the cigarId from the loop
            const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigarId);
            // Delete the document
            batch.delete(cigarRef);
        });
        // Commit the batch deletion
        await batch.commit();
        // Reset the state
        setIsDeleteCigarsModalOpen(false);
        setIsSelectMode(false);
        setSelectedCigarIds([]);
    };

    const handleSaveManualReading = async (newTemp, newHumidity) => {
        const humidorRef = doc(db, 'artifacts', appId, 'users', userId, 'humidors', humidor.id);
        await updateDoc(humidorRef, { temp: newTemp, humidity: newHumidity });
        setIsManualReadingModalOpen(false);
    };

    const handleFilterChange = (filterName, value) => setFilters(prev => ({ ...prev, [filterName]: value }));

    const handleFlavorNoteToggle = (note) => {
        setFilters(prev => ({ ...prev, flavorNotes: prev.flavorNotes.includes(note) ? prev.flavorNotes.filter(n => n !== note) : [...prev.flavorNotes, note] }));
    };

    const handleSortChange = (sortCriteria) => {
        if (sortBy === sortCriteria) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(sortCriteria);
            setSortOrder('asc');
        }
    };

    const handleClearFilters = () => {
        setFilters({ brand: '', country: '', strength: '', flavorNotes: [] });
    };

    return (
        <div className="bg-gray-900 min-h-screen pb-24">
            {isManualReadingModalOpen && <ManualReadingModal humidor={humidor} onClose={() => setIsManualReadingModalOpen(false)} onSave={handleSaveManualReading} theme={theme} />}
            {isMoveModalOpen && <MoveCigarsModal onClose={() => setIsMoveModalOpen(false)} onMove={handleMoveCigars} destinationHumidors={humidors.filter(h => h.id !== humidor.id)} theme={theme} />}
            <DeleteHumidorModal isOpen={isDeleteHumidorModalOpen} onClose={() => setIsDeleteHumidorModalOpen(false)} onConfirm={handleConfirmDeleteHumidor} humidor={humidor} cigarsInHumidor={filteredAndSortedCigars} otherHumidors={humidors.filter(h => h.id !== humidor.id)} />
            <DeleteCigarsModal isOpen={isDeleteCigarsModalOpen} onClose={() => setIsDeleteCigarsModalOpen(false)} onConfirm={handleConfirmDeleteCigars} count={selectedCigarIds.length} />
            {isExportModalOpen && <ExportModal data={filteredAndSortedCigars} dataType="cigar" onClose={() => setIsExportModalOpen(false)} />}

            <div className="relative">
                {/* ...main MyHumidor content... */}
                <img src={humidor.image || `https://placehold.co/600x400/3a2d27/ffffff?font=playfair-display&text=${humidor.name.replace(/\s/g, '+')}`} alt={humidor.name} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <button onClick={() => navigate('HumidorsScreen')} className="p-2 bg-black/50 rounded-full">
                        <ChevronLeft className="w-7 h-7 text-white" />
                    </button>
                    <HumidorActionMenu
                        onEdit={() => navigate('EditHumidor', { humidorId: humidor.id })}
                        onTakeReading={() => setIsManualReadingModalOpen(true)}
                        onExport={() => setIsExportModalOpen(true)}
                        onDelete={() => setIsDeleteHumidorModalOpen(true)}
                        onImport={() => navigate('DataSync')} // Navigate to DataSync for import options
                    />

                </div>
                <div className="absolute bottom-0 p-4">
                    <div className="flex items-center">
                        <Box className={`w-8 h-8 mr-3 ${theme.primary}`} />
                        <h1 className="text-3xl font-bold text-white">{humidor.name}</h1>
                    </div>
                    <p className="text-sm text-gray-300">{humidor.shortDescription || humidor.description}</p>
                </div>
            </div> {/* End main MyHumidor content */}

            <div className="p-4">
                <div id="pnlHumidityTemperatureValue" className="flex justify-around items-center bg-gray-800/50 p-3 rounded-xl mb-6 text-center">
                    <div className="flex flex-col items-center"><Droplets className="w-5 h-5 text-blue-400 mb-1" /><p className="text-sm text-gray-400">Humidity</p><p className="font-bold text-white text-base">{humidor.humidity}%</p></div>
                    <div className="h-10 w-px bg-gray-700"></div>
                    <div className="flex flex-col items-center"><Thermometer className="w-5 h-5 text-red-400 mb-1" /><p className="text-sm text-gray-400">Temperature</p><p className="font-bold text-white text-base">{humidor.temp}°F</p></div>
                    <div className="h-10 w-px bg-gray-700"></div>
                    <div className="flex flex-col items-center"><svg className="w-5 h-5 text-green-400 mb-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg><p className="text-sm text-gray-400">Est. Value</p><p className="font-bold text-white text-base">${humidorValue.toFixed(2)}</p></div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Search this humidor..." value={searchQuery} onChange={handleSearchChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    {searchQuery && (
                        <button onClick={handleClearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-b-xl mt-1 z-20 overflow-hidden">
                            {suggestions.map(suggestion => (<div key={suggestion} onMouseDown={() => handleSuggestionClick(suggestion)} className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors cursor-pointer">{suggestion}</div>))}
                        </div>
                    )}
                </div>

                <div id="pnlHumidorFilterContainer" className="flex justify-between items-center mb-6 px-2">
                    <div id="pnlHumidorStats">
                        <p className="text-sm text-gray-400"><span className="font-bold text-gray-200">{filteredAndSortedCigars.length}</span> Unique Cigars</p>
                        <p className="text-xs text-gray-400"><span className="font-bold text-gray-200">{totalQuantity}</span> Total Cigars</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Action buttons */}
                        <button id="btnFilterNew" Tooltip="Filter" onClick={() => setIsFilterPanelOpen(prev => !prev)} className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"><Filter className="w-5 h-5" /></button>
                        {/* <button id="btnFilter" Tooltip="Filter Modal" onClick={() => setIsFilterSortModalOpen(true)} className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"><Filter className="w-5 h-5" /></button> */}
                        <div className="flex bg-gray-800 border border-gray-700 rounded-full p-1">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-colors duration-200 ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-gray-400'}`}><LayoutGrid className="w-5 h-5" /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-full transition-colors duration-200 ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-gray-400'}`}><List className="w-5 h-5" /></button>
                        </div>
                        <button onClick={handleToggleSelectMode} className={`p-2 rounded-full transition-colors duration-200 ${isSelectMode ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-400'}`}><CheckSquare className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Show the autofill banner if enabled and there are cigars with missing details */}
                {showAutofillBanner && cigarsWithMissingDetails.length > 0 && (
                    <div
                        id="pnlAutofillBanner"
                        className="relative bg-amber-900/20 border border-amber-800 rounded-xl p-4 mb-4 flex flex-col shadow-lg overflow-hidden"
                        style={{ boxShadow: '0 2px 12px 0 rgba(255, 193, 7, 0.10)' }}
                    >
                        {/* Close button in top right */}
                        <button
                            onClick={() => setShowAutofillBanner(false)}
                            className="absolute top-2 right-2 text-yellow-300 hover:text-white text-2xl font-bold z-10"
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center justify-center bg-amber-400 rounded-full w-10 h-10 mr-2 shadow">
                                {/* Use the same icon as Roxy's Corner */}
                                <svg className="w-7 h-7 text-amber-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M3 16s.5-1 2-1 2 1 2 1 1-1 2-1 2 1 2 1 1-1 2-1 2 1 2 1 1-1 2-1 2 1 2 1" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <h3 className="font-bold text-amber-200 text-lg flex items-center">Roxy's Corner</h3>
                        </div>
                        <span className="text-amber-100 text-sm mb-3">
                            Some imported cigars are missing details. Let Roxy auto-fill them for you!
                        </span>
                        <button
                            onClick={handleAutofillMissingDetails}
                            disabled={isAutofilling}
                            className="bg-amber-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors w-full sm:w-auto"
                        >
                            {isAutofilling ? "Auto-filling..." : "Auto-fill Details"}
                        </button>
                        {autofillStatus && (
                            <div className="mt-2 text-amber-200 text-xs">{autofillStatus}</div>
                        )}
                    </div>
                )}

                {isFilterActive && (
                    <div className="flex justify-between items-center mb-4 bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-300">Filtering by:</span>
                            {filters.brand && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50">{filters.brand}</span>}
                            {filters.country && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50">{filters.country}</span>}
                            {filters.strength && <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50">{filters.strength}</span>}
                            {filters.flavorNotes.map(note => <span key={note} className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50">{note}</span>)}
                        </div>
                        <button onClick={handleClearFilters} className="p-1 rounded-full hover:bg-amber-800 transition-colors text-amber-400"><X className="w-4 h-4" /></button>
                    </div>
                )}

                {/* change the grid layout columns */}
                <div className={viewMode === 'grid' ? "grid grid-cols-1 gap-4" : "flex flex-col gap-4"}>
                    {filteredAndSortedCigars.map(cigar => (viewMode === 'grid' ? <GridCigarCard key={cigar.id} cigar={cigar} navigate={navigate} isSelectMode={isSelectMode} isSelected={selectedCigarIds.includes(cigar.id)} onSelect={handleSelectCigar} /> : <ListCigarCard key={cigar.id} cigar={cigar} navigate={navigate} isSelectMode={isSelectMode} isSelected={selectedCigarIds.includes(cigar.id)} onSelect={handleSelectCigar} />))}
                    {filteredAndSortedCigars.length === 0 && (
                        <div className="col-span-full text-center py-10">
                            <p className="text-gray-400">No cigars match your search.</p>
                        </div>
                    )}
                </div>

                {/* Floating Action Button for Add Cigar */}
                {!isSelectMode && (
                    <button
                        id="btnAddCigar"
                        onClick={() => navigate('AddCigar', { humidorId: humidor.id })}
                        className="fixed bottom-24 right-4 bg-amber-500 text-white p-4 rounded-full shadow-lg hover:bg-amber-600 transition-colors z-20"
                        aria-label="Add Cigar"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                )}

                {/* Panel for Select Mode */}
                {isSelectMode && (
                    <div id="pnlSelectMode" className="fixed bottom-20 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-4 z-20 border-t border-gray-700">
                        <div className="max-w-md mx-auto">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-white">{selectedCigarIds.length} Selected</h3>
                                <button onClick={handleToggleSelectMode} className="text-amber-400 font-semibold">Done</button>
                            </div>
                            {selectedCigarIds.length > 0 && (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsMoveModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 rounded-full hover:bg-amber-600 transition-colors shadow-lg"><Move className="w-5 h-5" />Move</button>
                                    <button onClick={() => setIsDeleteCigarsModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-full hover:bg-red-700 transition-colors shadow-lg"><Trash2 className="w-5 h-5" />Delete</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}{/* End Panel for Select Mode */}

                {/* Panel for Filter Mode */}
                {isFilterPanelOpen && (
                    <div id="pnlFilterMode" className="fixed bottom-20 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-4 z-20 border-t border-gray-700">
                        <div className="max-w-md mx-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-amber-400 flex items-center"><Filter className="w-5 h-5 mr-2" /> Filter & Sort</h3>
                                <button onClick={() => setIsFilterPanelOpen(false)} className="text-amber-400 font-semibold">Done</button>
                            </div>
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {/* Sorting Section */}
                                <div>
                                    <h4 className="font-bold text-white text-base mb-2">Sort By</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['name', 'brand', 'rating', 'quantity', 'price', 'dateAdded'].map(criteria => (
                                            <button
                                                key={criteria}
                                                onClick={() => handleSortChange(criteria)}
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
                                            <select value={filters.brand} onChange={(e) => handleFilterChange('brand', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                                                <option value="">All Brands</option>
                                                {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`${theme.subtleText} text-sm mb-1 block`}>Country</label>
                                            <select value={filters.country} onChange={(e) => handleFilterChange('country', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                                                <option value="">All Countries</option>
                                                {uniqueCountries.map(country => <option key={country} value={country}>{country}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className={`${theme.subtleText} text-sm mb-1 block`}>Strength</label>
                                            <select value={filters.strength} onChange={(e) => handleFilterChange('strength', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                                                <option value="">All Strengths</option>
                                                {strengthOptions.map(strength => <option key={strength} value={strength}>{strength}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className={`${theme.subtleText} text-sm mb-1 block`}>Flavor Notes</label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableFlavorNotes.map(note => (
                                                <button key={note} onClick={() => handleFlavorNoteToggle(note)} className={`text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all duration-200 ${filters.flavorNotes.includes(note) ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                                                    {note}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Panel Actions */}
                            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-700">
                                <button onClick={handleClearFilters} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors flex-grow">Clear Filters</button>
                                <button onClick={() => setIsFilterPanelOpen(false)} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors flex-grow">Done</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Place FilterSortModal here, outside the main content */}
            {isFilterSortModalOpen && (
                <FilterSortModal
                    isOpen={isFilterSortModalOpen}
                    onClose={() => setIsFilterSortModalOpen(false)}
                    filters={filters}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onFilterChange={handleFilterChange}
                    onFlavorNoteToggle={handleFlavorNoteToggle}
                    onSortChange={handleSortChange}
                    onClearFilters={handleClearFilters}
                    uniqueBrands={uniqueBrands}
                    uniqueCountries={uniqueCountries}
                    availableFlavorNotes={availableFlavorNotes}
                    theme={theme}
                />
            )}

        </div>
    );
};

export default MyHumidor;