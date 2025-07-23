// File: App.js
// Path: src\App.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 20, 2025
// Time: 10:01 PM CDT

// Description of Changes:
// - Updated the "Description of Changes" header with a summary of the recent changes.

// Next Suggestions:
// - Implement drag-and-drop reordering for the dashboard panels on desktop.
// - Persist the user's custom panel order to local storage.
// - Enhance error handling with user-friendly messages for all API calls and database operations.
// - Add more robust input validation for all forms.
// - Give the user the option to reset the date when moving cigars to a new humidor.
// - Implement a "Cigar of the Day" feature that highlights a random cigar from the user's collection each day picked by Roxy.
// - Implement Firebase Storage integration for image uploads.

// Firebase configuration and initialization.
import { db, auth, firebaseConfigExport } from './firebase';

// FirebaseUI component for authentication.
import FirebaseAuthUI from './FirebaseAuthUI';// FirebaseUI component for handling user sign-in and authentication.

// React is the main library for building the user interface.
// useState, useEffect, and useMemo are "hooks" that let us use state and other React features in functional components.
import React, { useState, useEffect, useMemo, useRef } from 'react'; // Import useRef for flashing effect
// react-simple-maps provides a set of components for rendering maps.
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";


// lucide-react provides a set of clean, modern icons used throughout the app.
import { ArrowUp, ArrowDown, CheckSquare, AlertTriangle, BarChart2, Bell, Box, Calendar as CalendarIcon, Check, ChevronDown, ChevronLeft, Cigarette, Database, DollarSign, Download, Droplets, Edit, Filter, Info, LayoutGrid, Leaf, List, LoaderCircle, MapPin, Minus, Move, Palette, PieChart as PieChartIcon, Plus, Search, Settings as SettingsIcon, Sparkles, Star, Tag, Thermometer, Trash2, Upload, UploadCloud, User, Wind, X, Zap, Github, Bug, BookText } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse'; // Import papaparse for CSV parsing and exporting.
// Import Firebase libraries for database and authentication
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, writeBatch, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, connectAuthEmulator } from "firebase/auth";
import { themes } from './constants/themes';
import { roxysTips } from './constants/roxysTips';
import { fontOptions } from './constants/fontOptions';
import { strengthOptions, allFlavorNotes, commonCigarDimensions, cigarShapes, cigarLengths, cigarRingGauges, cigarWrapperColors, cigarBinderTypes, cigarFillerTypes, cigarCountryOfOrigin } from './constants/cigarOptions';
import { APP_HUMIDOR_FIELDS, APP_CIGAR_FIELDS } from './constants/fieldDefinitions';
import QuantityControl from './components/UI/QuantityControl';
import GridCigarCard from './components/Cigar/GridCigarCard';
import ListCigarCard from './components/Cigar/ListCigarCard';
import InputField from './components/UI/InputField';
import TextAreaField from './components/UI/TextAreaField';
import AutoCompleteInputField from './components/UI/AutoCompleteInputField';
import ChartCard from './components/UI/ChartCard';
import { getRatingColor } from './components/utils/getRatingColor';
import { calculateAge } from './components/utils/calculateAge';
import ProfileScreen from './components/Settings/ProfileScreen';
import AboutScreen from './components/Settings/AboutScreen';
import AddEditJournalEntry from './components/Journal/AddEditJournalEntry';
import JournalEntryCard from './components/Journal/JournalEntryCard';
import CigarJournalScreen from './components/Journal/CigarJournalScreen';

// Import components
import FilterSortModal from './components/UI/FilterSortModal';
import HumidorActionMenu from './components/Menus/HumidorActionMenu';
import CigarActionMenu from './components/Menus/CigarActionMenu';
import DraggableImage from './components/UI/DraggableImage';
import ImagePreview from './components/UI/ImagePreview';
import Gauge from './components/UI/Gauge';
import StatCard from './components/UI/StatCard';
import BottomNav from './components/Navigation/BottomNav';

// Import drawer components
import {
    BrowseByWrapperDrawer,
    BrowseByStrengthDrawer,
    BrowseByCountryDrawer,
    InteractiveWorldMapDrawer
} from './components/Drawers';

// Import panel components
import {
    InventoryAnalysisPanel,
    MyCollectionStatsCards,
    AgingWellPanel
} from './components/Panels';

// Import screens
import Dashboard from './screens/Dashboard';
import MyHumidor from './screens/MyHumidor';

// Import utilities
import { downloadFile, generateAiImage } from './utils/fileUtils';
import { getFlavorTagColor } from './utils/colorUtils';
import { parseHumidorSize, formatDate } from './utils/formatUtils';

// Import services
import { callGeminiAPI } from './services/geminiService';
import { fetchGoveeDevices } from './services/goveeService';

// Import modal components
import GeminiModal from './components/Modals/Content/GeminiModal';
import ThemeModal from './components/Modals/Content/ThemeModal';
import FlavorNotesModal from './components/Modals/Forms/FlavorNotesModal';
import ManualReadingModal from './components/Modals/Forms/ManualReadingModal';
import ImageUploadModal from './components/Modals/Forms/ImageUploadModal';
import MoveCigarsModal from './components/Modals/Actions/MoveCigarsModal';
import DeleteHumidorModal from './components/Modals/Actions/DeleteHumidorModal';
import DeleteCigarsModal from './components/Modals/Actions/DeleteCigarsModal';
import ImportCsvModal from './components/Modals/Data/ImportCsvModal';
import ExportModal from './components/Modals/Data/ExportModal';
import SmartImageModal from './components/Modals/Composite/SmartImageModal';

// Initialize Firebase Authentication token
const initialAuthToken = typeof window !== "undefined" && window.initialAuthToken ? window.initialAuthToken : null;

// List of countries known for producing cigars, used in the app for filtering and categorization.
const cigarCountries = [
    "United States",
    "Mexico",
    "Cuba",
    "Dominican Republic",
    "Honduras",
    "Nicaragua"
];

// URL for the world map data used in the Map component.
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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
        // NEW: Apply country filter - July 5, 2025 - 2:00:00 AM CDT
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
                        <div>
                            <p className="text-sm text-gray-300"><span className="font-bold text-white">{totalUniqueCigars}</span> Unique</p>
                            <p className="text-xs text-gray-400"><span className="font-bold text-gray-200">{totalQuantity}</span> Total Cigars</p>
                        </div>
                        <button onClick={() => navigate('AddHumidor')} className="flex items-center gap-2 bg-amber-500 text-white font-bold text-sm px-4 py-2 rounded-full hover:bg-amber-600 transition-colors">
                            <Plus className="w-4 h-4" />
                            Add Humidor
                        </button>
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

const AddHumidor = ({ navigate, db, appId, userId, theme }) => {
    const humidorTypes = ["Desktop Humidor", "Cabinet Humidor", "Glass Top Humidor", "Travel Humidor", "Cigar Cooler", "Walk-In Humidor", "Personalized Humidor"];
    const [formData, setFormData] = useState({
        name: '',
        shortDescription: '',
        longDescription: '',
        size: '',
        location: '',
        image: '',
        type: humidorTypes[0],
        temp: 70,
        humidity: 70,
    });
    const [trackEnvironment, setTrackEnvironment] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        //        if (!db) {
        //            alert(`Database not initialized.`);
        //            return;
        //        }
        try {
            const newHumidorData = {
                ...formData,
                image: formData.image || `https://placehold.co/600x400/3a2d27/ffffff?font=playfair-display&text=${formData.name.replace(/\s/g, '+') || 'New+Humidor'}`,
                goveeDeviceId: null,
                goveeDeviceModel: null,
                humidity: trackEnvironment ? Number(formData.humidity) : 70,
                temp: trackEnvironment ? Number(formData.temp) : 68,
            };
            const humidorsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'humidors');
            await addDoc(humidorsCollectionRef, newHumidorData);
            navigate('HumidorsScreen');
        } catch (error) {
            alert(`Failed to save humidor: ${error.message}`);
        }
    };

    // State in the parent form to hold the item's name, image URL, and image position.
    // This will be passed to the SmartImageModal.
    const [itemName, setItemName] = useState('Arturo Fuente Hemingway');
    const [itemImage, setItemImage] = useState('');
    const [itemImagePosition, setItemImagePosition] = useState({ x: 50, y: 50 });

    // This function is passed to the SmartImageModal and called when the user clicks "Accept Image".
    // It updates the main form's state with the new image and its position.
    const handleImageAccept = (image, position) => {
        setItemImage(image);
        setItemImagePosition(position);
    };
    return (
        <div className="pb-24">
            <div className="relative">
                <SmartImageModal
                    itemName={formData.name}
                    itemCategory="humidor"
                    itemType={formData.type}
                    theme={theme}
                    currentImage={formData.image || `https://placehold.co/400x600/5a3825/ffffff?font=playfair-display&text=${formData.name.replace(/\s/g, '+') || 'Humidor'}`}
                    currentPosition={formData.imagePosition || { x: 50, y: 50 }}
                    onImageAccept={(img, pos) => setFormData(prev => ({
                        ...prev,
                        image: img,
                        imagePosition: pos
                    }))}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
                <div className="absolute top-4 left-4 z-10">
                    <button onClick={() => navigate('HumidorsScreen')} className="p-2 -ml-2 mr-2 bg-black/50 rounded-full">
                        <ChevronLeft className={`w-7 h-7 ${theme.text}`} />
                    </button>
                </div>
                <div className="absolute bottom-0 p-4 z-10 pointer-events-none">
                    <h1 className={`text-3xl font-bold ${theme.text}`}>Add New Humidor</h1>
                </div>
            </div>
            <div className="p-4 space-y-6">
                <InputField name="name" label="Humidor Name" placeholder="e.g., The Big One" value={formData.name} onChange={handleInputChange} theme={theme} />
                <InputField name="shortDescription" label="Short Description" placeholder="e.g., Main aging unit" value={formData.shortDescription} onChange={handleInputChange} theme={theme} />
                <TextAreaField name="longDescription" label="Long Description" placeholder="e.g., A 150-count mahogany humidor with a Spanish cedar interior..." value={formData.longDescription} onChange={handleInputChange} theme={theme} />

                <div>
                    <label className={`text-sm font-medium ${theme.subtleText} mb-1 block`}>Type of Humidor</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className={`w-full ${theme.inputBg} border ${theme.borderColor} rounded-lg py-2 px-3 ${theme.text} focus:outline-none focus:ring-2 ${theme.ring}`}>
                        {humidorTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <InputField name="size" label="Size" placeholder="e.g., 150-count" value={formData.size} onChange={handleInputChange} theme={theme} />
                    <InputField name="location" label="Location" placeholder="e.g., Office" value={formData.location} onChange={handleInputChange} theme={theme} />
                </div>

                <div className={`${theme.card} p-4 rounded-xl`}>
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-amber-300 flex items-center"><Thermometer className="w-5 h-5 mr-2" /> Environment Tracking</h3>
                        <button onClick={() => setTrackEnvironment(!trackEnvironment)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${trackEnvironment ? 'bg-amber-500' : 'bg-gray-600'}`}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${trackEnvironment ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    {trackEnvironment && (
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
                            <InputField name="temp" label="Temperature (°F)" type="number" value={formData.temp} onChange={handleInputChange} theme={theme} />
                            <InputField name="humidity" label="Humidity (%)" type="number" value={formData.humidity} onChange={handleInputChange} theme={theme} />
                        </div>
                    )}
                </div>

                <div className="pt-4 flex space-x-4">
                    <button
                        onClick={handleSave}
                        className={`w-full ${theme.primaryBg} ${theme.text === 'text-white' ? 'text-white' : 'text-black'} font-bold py-3 rounded-lg ${theme.hoverPrimaryBg} transition-colors`}
                    >
                        Save Humidor
                    </button>
                    <button
                        onClick={() => navigate('HumidorsScreen')}
                        className={`w-full ${theme.button} ${theme.text} font-bold py-3 rounded-lg transition-colors`}
                    >
                        Cancel
                    </button>
                </div>


            </div>
        </div>
    );
};

const EditHumidor = ({ navigate, db, appId, userId, humidor, goveeApiKey, goveeDevices, theme }) => {
    const humidorTypes = ["Desktop Humidor", "Cabinet Humidor", "Glass Top Humidor", "Travel Humidor", "Cigar Cooler", "Walk-In Humidor", "Personalized Humidor"];
    const [formData, setFormData] = useState({
        ...humidor,
        shortDescription: humidor.shortDescription || '',
        longDescription: humidor.longDescription || humidor.description || '', // Migrate old description
        trackingMethod: humidor.goveeDeviceId ? 'govee' : 'manual'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGoveeDeviceChange = (e) => {
        const selectedDeviceId = e.target.value;
        const selectedDevice = goveeDevices.find(d => d.device === selectedDeviceId);
        setFormData(prev => ({ ...prev, goveeDeviceId: selectedDevice?.device || null, goveeDeviceModel: selectedDevice?.model || null }));
    };

    const handleSave = async () => {
        const humidorRef = doc(db, 'artifacts', appId, 'users', userId, 'humidors', humidor.id);
        const { id, description, ...dataToSave } = formData; // Exclude id and old description field
        const updatedHumidor = {
            ...dataToSave,
            goveeDeviceId: formData.trackingMethod === 'manual' ? null : formData.goveeDeviceId,
            goveeDeviceModel: formData.trackingMethod === 'manual' ? null : formData.goveeDeviceModel,
            image: formData.image || `https://placehold.co/600x400/3a2d27/ffffff?font=playfair-display&text=${formData.name.replace(/\s/g, '+') || 'Humidor'}`,
        };
        await updateDoc(humidorRef, updatedHumidor);
        navigate('MyHumidor', { humidorId: humidor.id });
    };

    // State in the parent form to hold the item's name, image URL, and image position.
    // This will be passed to the SmartImageModal.
    const [itemName, setItemName] = useState('Arturo Fuente Hemingway');
    const [itemImage, setItemImage] = useState('');
    const [itemImagePosition, setItemImagePosition] = useState({ x: 50, y: 50 });

    // This function is passed to the SmartImageModal and called when the user clicks "Accept Image".
    // It updates the main form's state with the new image and its position.
    const handleImageAccept = (image, position) => {
        setItemImage(image);
        setItemImagePosition(position);
    };

    return (
        <div className="p-4 pb-24">
            <div className="relative">
                {/* Image */}
                <SmartImageModal
                    itemName={formData.name}
                    itemCategory="humidor"
                    itemType={formData.type}
                    theme={theme}
                    currentImage={formData.image || `https://placehold.co/600x400/EEE/31343C?font=playfair-display&text=${formData.name.replace(/\s/g, '+') || 'My Humidor'}`}
                    currentPosition={formData.imagePosition || { x: 50, y: 50 }}
                    onImageAccept={(img, pos) => setFormData(prev => ({
                        ...prev,
                        image: img,
                        imagePosition: pos
                    }))}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
                <div className="absolute top-4 left-4 z-10">
                    <button onClick={() => navigate('HumidorsScreen')} className="p-2 -ml-2 mr-2 bg-black/50 rounded-full">
                        <ChevronLeft className={`w-7 h-7 ${theme.text}`} />
                    </button>
                </div>
                <div className="absolute bottom-0 p-4 z-10 pointer-events-none">
                    <h1 className={`text-3xl font-bold ${theme.text}`}>Edit  Humidor</h1>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Humidor Name */}
                <InputField name="name" label="Humidor Name" placeholder="e.g., The Big One" value={formData.name} onChange={handleInputChange} theme={theme} />
                {/* Short Description */}
                <InputField name="shortDescription" label="Short Description" placeholder="e.g., Main aging unit" value={formData.shortDescription} onChange={handleInputChange} theme={theme} />
                {/* Long Description */}
                <TextAreaField name="longDescription" label="Long Description" placeholder="e.g., A 150-count mahogany humidor..." value={formData.longDescription} onChange={handleInputChange} theme={theme} />

                {/* Type of Humidor */}
                <div>
                    <label className={`text-sm font-medium ${theme.subtleText} mb-1 block`}>Type of Humidor</label>
                    <select name="type" value={formData.type} onChange={handleInputChange} className={`w-full ${theme.inputBg} border ${theme.borderColor} rounded-lg py-2 px-3 ${theme.text} focus:outline-none focus:ring-2 ${theme.ring}`}>
                        {humidorTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                {/* Size and location */}
                <div id="pnlSizeAndLocation" className="grid grid-cols-2 gap-4">
                    <InputField name="size" label="Size" placeholder="e.g., 150-count" value={formData.size} onChange={handleInputChange} theme={theme} />
                    <InputField name="location" label="Location" placeholder="e.g., Office" value={formData.location} onChange={handleInputChange} theme={theme} />
                </div>
                {/* Environment Tracking */}
                <div pnl="pnlEnvironmentTracking" className={`${theme.card} p-4 rounded-xl`}>
                    <h3 className="font-bold text-xl text-amber-300 mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2" /> Environment Tracking</h3>
                    <div className="space-y-4">
                        <div>
                            <label className={`text-sm font-medium ${theme.subtleText} mb-2 block`}>Tracking Method</label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center"><input type="radio" name="trackingMethod" value="manual" checked={formData.trackingMethod === 'manual'} onChange={handleInputChange} className="form-radio text-amber-500 h-4 w-4" /><span className={`ml-2 ${theme.text}`}>Manual Input</span></label>
                                <label className="inline-flex items-center"><input type="radio" name="trackingMethod" value="govee" checked={formData.trackingMethod === 'govee'} onChange={handleInputChange} className="form-radio text-amber-500 h-4 w-4" /><span className={`ml-2 ${theme.text}`}>Govee Sensor</span></label>
                            </div>
                        </div>
                        {formData.trackingMethod === 'manual' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <InputField name="temp" label="Temperature (°F)" placeholder="e.g., 68" type="number" value={formData.temp} onChange={handleInputChange} theme={theme} />
                                <InputField name="humidity" label="Humidity (%)" placeholder="e.g., 70" type="number" value={formData.humidity} onChange={handleInputChange} theme={theme} />
                            </div>
                        ) : (
                            <div>
                                <label className={`text-sm font-medium ${theme.subtleText} mb-1 block`}>Govee Sensor</label>
                                <select value={formData.goveeDeviceId || ''} onChange={handleGoveeDeviceChange} disabled={!goveeApiKey || goveeDevices.length === 0} className={`w-full ${theme.inputBg} border ${theme.borderColor} rounded-lg py-2 px-3 ${theme.text} disabled:bg-gray-800 disabled:cursor-not-allowed`}>
                                    <option value="">{!goveeApiKey ? "Connect Govee first" : (goveeDevices.length === 0 ? "No sensors found" : "Select a sensor")}</option>
                                    {goveeDevices.map(device => (<option key={device.device} value={device.device}>{device.deviceName} ({device.model})</option>))}
                                </select>
                                {!goveeApiKey && (<p className="text-xs text-red-300 mt-1">Please connect your Govee API key in Integrations settings.</p>)}
                                {goveeApiKey && goveeDevices.length === 0 && (<p className="text-xs text-yellow-300 mt-1">No Govee sensors found. Check your key and Govee app.</p>)}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <InputField name="temp" label="Current Temp (°F)" value={humidor.temp} type="number" onChange={() => { }} theme={theme} disabled={true} />
                                    <InputField name="humidity" label="Current Humidity (%)" value={humidor.humidity} type="number" onChange={() => { }} theme={theme} disabled={true} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Save and Cancel buttons */}
                <div pnl="pnlSaveCancelButtons" className="pt-4 flex space-x-4">
                    <button onClick={handleSave} className={`w-full ${theme.primaryBg} ${theme.text === 'text-white' ? 'text-white' : 'text-black'} font-bold py-3 rounded-lg ${theme.hoverPrimaryBg} transition-colors`}>Save Changes</button>
                    <button onClick={() => navigate('MyHumidor', { humidorId: humidor.id })} className={`w-full ${theme.button} ${theme.text} font-bold py-3 rounded-lg transition-colors`}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

const CigarDetail = ({ cigar, navigate, db, appId, userId, journalEntries }) => {
    const [modalState, setModalState] = useState({ isOpen: false, type: null, content: '', isLoading: false });
    const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isRoxyOpen, setIsRoxyOpen] = useState(false);
    const [showSmokeConfirmation, setShowSmokeConfirmation] = useState(false);

    const journalEntriesForCigar = useMemo(() => {
        return journalEntries
            .filter(entry => entry.cigarId === cigar.id)
            .sort((a, b) => new Date(b.dateSmoked) - new Date(a.dateSmoked));
    }, [journalEntries, cigar.id]);

    const handleSmokeCigar = async () => {
        if (cigar.quantity > 0) {
            const newQuantity = cigar.quantity - 1;
            const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigar.id);
            await updateDoc(cigarRef, { quantity: newQuantity });
            // Navigate to log the experience
            navigate('AddEditJournalEntry', { cigarId: cigar.id });
        }
    };

    const handleDeleteCigar = async () => {
        const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigar.id);
        await deleteDoc(cigarRef);
        navigate('MyHumidor', { humidorId: cigar.humidorId });
    };

    const handleSuggestPairings = async () => {
        setModalState({ isOpen: true, type: 'pairings', content: '', isLoading: true });
        const prompt = `You are a world-class sommelier and cigar expert. Given the following cigar:\n- Brand: ${cigar.brand}\n- Name: ${cigar.name}\n- Strength: ${cigar.strength}\n- Wrapper: ${cigar.wrapper}\n\nSuggest three diverse drink pairings (e.g., a spirit, a coffee, a non-alcoholic beverage). For each, provide a one-sentence explanation for why it works well. Format the response clearly with headings for each pairing.`;
        const result = await callGeminiAPI(prompt);
        setModalState({ isOpen: true, type: 'pairings', content: result, isLoading: false });
    };

    const handleGenerateNote = async () => {
        setModalState({ isOpen: true, type: 'notes', content: '', isLoading: true });
        const prompt = `You are a seasoned cigar aficionado with a poetic command of language. Based on this cigar's profile:\n- Brand: ${cigar.brand}\n- Name: ${cigar.name}\n- Strength: ${cigar.strength}\n- Wrapper: ${cigar.wrapper}\n\nGenerate a short, evocative tasting note (2-3 sentences) that a user could use as inspiration for their own review. Focus on potential flavors and the overall experience.`;
        const result = await callGeminiAPI(prompt);
        setModalState({ isOpen: true, type: 'notes', content: result, isLoading: false });
    };

    const handleFindSimilar = async () => {
        setModalState({ isOpen: true, type: 'similar', content: '', isLoading: true });
        const prompt = `You are a cigar expert. A user likes the '${cigar.brand} ${cigar.name}'. Based on its profile (Strength: ${cigar.strength}, Wrapper: ${cigar.wrapper}, Filler: ${cigar.filler}, Origin: ${cigar.country}, Flavors: ${cigar.flavorNotes.join(', ')}), suggest 3 other cigars that they might also enjoy. For each suggestion, provide the Brand and Name, and a 1-sentence reason why it's a good recommendation. Format as a list.`;
        const result = await callGeminiAPI(prompt);
        setModalState({ isOpen: true, type: 'similar', content: result, isLoading: false });
    };

    const handleAgingPotential = async () => {
        setModalState({ isOpen: true, type: 'aging', content: '', isLoading: true });
        const timeInHumidor = calculateAge(cigar.dateAdded);
        const prompt = `You are a master tobacconist and cigar aging expert named Roxy. A user is asking about the aging potential of their cigar.

Cigar Details:
- Name: ${cigar.brand} ${cigar.name}
- Wrapper: ${cigar.wrapper}
- Strength: ${cigar.strength}
- Time already aged: ${timeInHumidor}

Provide a brief, encouraging, and slightly personalized note about this cigar's aging potential. Mention when it might be at its peak for smoking. Keep it to 2-3 sentences and maintain your persona as a friendly, knowledgeable dog.`;
        const result = await callGeminiAPI(prompt);
        setModalState({ isOpen: true, type: 'aging', content: result, isLoading: false });
    };

    const closeModal = () => setModalState({ isOpen: false, type: null, content: '', isLoading: false });

    const RatingBadge = ({ rating }) => {
        if (!rating || rating === 0) return null;
        return (
            <div
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 aspect-square ${getRatingColor(rating)} bg-gray-900/50 backdrop-blur-sm`}
                style={{ aspectRatio: '1 / 1' }} // Ensures a perfect circle in all browsers
            >
                <span className="text-2xl font-bold text-white">{rating}</span>
                <span className="text-xs text-white/80 -mt-1">RATED</span>
            </div>
        );
    };

    const DetailItem = ({ label, value }) => (
        <div><p className="text-xs text-gray-400">{label}</p><p className="font-bold text-white text-sm">{value || 'N/A'}</p></div>
    );

    return (
        <div className="pb-24">
            {modalState.isOpen && <GeminiModal title={modalState.type === 'pairings' ? "Pairing Suggestions" : modalState.type === 'notes' ? "Tasting Note Idea" : modalState.type === 'aging' ? "Aging Potential" : "Similar Smokes"} content={modalState.content} isLoading={modalState.isLoading} onClose={closeModal} />}
            {isFlavorModalOpen && <FlavorNotesModal cigar={cigar} db={db} appId={appId} userId={userId} onClose={() => setIsFlavorModalOpen(false)} />}
            <DeleteCigarsModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteCigar} count={1} />
            {isExportModalOpen && <ExportModal data={[cigar]} dataType="cigar" onClose={() => setIsExportModalOpen(false)} />}

            <div className="relative">
                <img src={cigar.image || `https://placehold.co/400x600/5a3825/ffffff?font=playfair-display&text=${cigar.brand.replace(/\s/g, '+')}`} alt={cigar.name} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>

                {/* Page Header Action Buttons */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <button onClick={() => navigate('MyHumidor', { humidorId: cigar.humidorId })} className="p-2 bg-black/50 rounded-full text-white"><ChevronLeft className="w-7 h-7" /></button>
                    <CigarActionMenu
                        onEdit={() => navigate('EditCigar', { cigarId: cigar.id })}
                        onExport={() => setIsExportModalOpen(true)}
                        onDelete={() => setIsDeleteModalOpen(true)}
                        onAddJournal={() => navigate('AddEditJournalEntry', { cigarId: cigar.id })}
                    />
                </div>

                {/* Title and Rating Badge */}
                <div className="absolute bottom-0 p-4 w-full flex justify-between items-end">
                    <div>
                        <p className="text-gray-300 text-sm font-semibold uppercase">{cigar.brand}</p>
                        <h1 className="text-3xl font-bold text-white">{cigar.name}</h1>
                    </div>
                    <RatingBadge rating={cigar.rating} />
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* SMOKE THIS! Action Button */}
                <button onClick={handleSmokeCigar} disabled={cigar.quantity === 0} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <Cigarette className="w-5 h-5" /> Log This Smoke ({cigar.quantity} in stock)
                </button>
                {showSmokeConfirmation && (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        <span>Enjoy your smoke!</span>
                    </div>
                )}

                {/* Cigar Profile Panel */}
                <div className="bg-gray-800/50 p-4 rounded-xl space-y-4">

                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-amber-300 text-lg">Profile</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {/* Short Description */}
                        <div className="col-span-2">                            <p className="text-xs text-gray-400">Short Description</p>
                            <p className="font-light text-white text-sm break-words">{cigar.shortDescription || 'No short description provided.'}</p>
                        </div>

                        <DetailItem label="Shape" value={cigar.shape} />
                        {/* Updated Size display to combine length_inches and ring_gauge */}
                        <DetailItem label="Size" value={cigar.length_inches && cigar.ring_gauge ? `${cigar.length_inches} x ${cigar.ring_gauge}` : cigar.size} />
                        <DetailItem label="Origin" value={cigar.country} />
                        <DetailItem label="Strength" value={cigar.strength} />
                        <DetailItem label="Wrapper" value={cigar.wrapper} />
                        <DetailItem label="Binder" value={cigar.binder} />
                        <DetailItem label="Filler" value={cigar.filler} />
                        <DetailItem label="My Rating" value={cigar.userRating || 'N/A'} />
                        {/* <DetailItem label="Price Paid" value={cigar.price ? `$${Number(cigar.price).toFixed(2)}` : 'N/A'} /> */}
                        <DetailItem label="Date Added" value={formatDate(cigar.dateAdded)} />
                        <DetailItem label="Time in Humidor" value={calculateAge(cigar.dateAdded)} />
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <p className="text-xs text-gray-400">Description</p>
                        <p className="font-light text-white text-sm">{cigar.description || 'No description provided.'}</p>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <h4 className="font-bold text-white flex items-center mb-3"><Tag className="w-4 h-4 mr-2 text-amber-400" /> Flavor Notes</h4>
                        <div className="flex flex-wrap gap-2">
                            {cigar.flavorNotes && cigar.flavorNotes.length > 0 ?
                                cigar.flavorNotes.map(note => (<span key={note} className={`text-xs font-semibold px-3 py-1 rounded-full ${getFlavorTagColor(note)}`}>{note}</span>))
                                : <p className="text-sm text-gray-500">No flavor notes added.</p>
                            }
                        </div>
                    </div>
                </div>

                {/* Journal History Panel */}
                <div className="bg-gray-800/50 p-4 rounded-xl space-y-4">
                    <h3 className="font-bold text-amber-300 text-lg flex items-center"><BookText className="w-5 h-5 mr-2" /> Journal History</h3>
                    {journalEntriesForCigar.length > 0 ? (
                        <div className="space-y-4">
                            {journalEntriesForCigar.map(entry => (
                                <JournalEntryCard
                                    key={entry.id}
                                    entry={entry}
                                    theme={{ card: 'bg-gray-800' }}
                                    onEdit={() => navigate('AddEditJournalEntry', { cigarId: cigar.id, entryId: entry.id })}
                                    onDelete={async (entryId) => {
                                        if (window.confirm("Delete this entry?")) {
                                            const entryRef = doc(db, 'artifacts', appId, 'users', userId, 'journalEntries', entryId);
                                            await deleteDoc(entryRef);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No journal entries for this cigar yet. Smoke one to add an entry!</p>
                    )}
                </div>


                {/* Roxy's Corner Collapsible Panel */}
                <div className="bg-amber-900/20 border border-amber-800 rounded-xl overflow-hidden">
                    <button onClick={() => setIsRoxyOpen(!isRoxyOpen)} className="w-full p-4 flex justify-between items-center">
                        <h3 className="font-bold text-amber-300 text-lg flex items-center"><Wind className="w-5 h-5 mr-2" /> Roxy's Corner</h3>
                        <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isRoxyOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isRoxyOpen && (
                        <div className="px-4 pb-4 space-y-4">
                            <p className="text-amber-200 text-sm pt-2">Let Roxy help you get the most out of your smoke. What would you like to know?</p>
                            <button onClick={handleSuggestPairings} className="w-full flex items-center justify-center bg-amber-500/20 border border-amber-500 text-amber-300 font-bold py-3 rounded-lg hover:bg-amber-500/30 transition-colors"><Sparkles className="w-5 h-5 mr-2" /> Suggest Pairings</button>
                            <button onClick={handleGenerateNote} className="w-full flex items-center justify-center bg-sky-500/20 border border-sky-500 text-sky-300 font-bold py-3 rounded-lg hover:bg-sky-500/30 transition-colors"><Sparkles className="w-5 h-5 mr-2" /> Generate Note Idea</button>
                            <button onClick={handleFindSimilar} className="w-full flex items-center justify-center bg-green-500/20 border border-green-500 text-green-300 font-bold py-3 rounded-lg hover:bg-green-500/30 transition-colors"><Sparkles className="w-5 h-5 mr-2" /> Find Similar Smokes</button>
                            <button onClick={handleAgingPotential} className="w-full flex items-center justify-center bg-purple-500/20 border border-purple-500 text-purple-300 font-bold py-3 rounded-lg hover:bg-purple-500/30 transition-colors"><CalendarIcon className="w-5 h-5 mr-2" /> Aging Potential</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const AddCigar = ({ navigate, db, appId, userId, humidorId, theme }) => {
    // Initialize formData with new fields length_inches and ring_gauge
    const [formData, setFormData] = useState({ brand: '', name: '', shape: '', size: '', wrapper: '', binder: '', filler: '', country: '', strength: '', price: '', rating: '', quantity: 1, image: '', shortDescription: '', description: '', flavorNotes: [], dateAdded: new Date().toISOString().split('T')[0], length_inches: '', ring_gauge: '' });
    const [strengthSuggestions, setStrengthSuggestions] = useState([]);
    const [isAutofilling, setIsAutofilling] = useState(false);
    const [modalState, setModalState] = useState({ isOpen: false, content: '', isLoading: false });
    const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);

    // Refs for flashing effect
    const lengthInputRef = useRef(null);
    const gaugeInputRef = useRef(null);
    const [isLengthFlashing, setIsLengthFlashing] = useState(false);
    const [isGaugeFlashing, setIsGaugeFlashing] = useState(false);

    // State in the parent form to hold the item's name, image URL, and image position.
    const [itemName, setItemName] = useState('Arturo Fuente Hemingway');
    const [itemImage, setItemImage] = useState('');
    const [itemImagePosition, setItemImagePosition] = useState({ x: 50, y: 50 });

    // This function is passed to the modal and called when the user clicks "Accept Image".
    // It updates the main form's state with the new image and its position.
    const handleImageAccept = (image, position) => {
        setItemImage(image);
        setItemImagePosition(position);
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'strength') {
            setStrengthSuggestions(value ? strengthOptions.filter(opt => opt.toLowerCase().includes(value.toLowerCase())) : []);
        } else if (name === 'shape') {
            // Auto-update length_inches and ring_gauge based on selected shape
            const dimensions = commonCigarDimensions[value];
            if (dimensions) {
                setFormData(prev => ({
                    ...prev,
                    length_inches: dimensions.length_inches || '',
                    ring_gauge: dimensions.ring_gauge || ''
                }));
                // Trigger flashing effect for updated fields
                if (dimensions.length_inches) {
                    setIsLengthFlashing(true);
                    setTimeout(() => setIsLengthFlashing(false), 500);
                }
                if (dimensions.ring_gauge) {
                    setIsGaugeFlashing(true);
                    setTimeout(() => setIsGaugeFlashing(false), 500);
                }
            }
        }
    };

    const handleSuggestionClick = (value) => {
        setFormData({ ...formData, strength: value });
        setStrengthSuggestions([]);
    };

    const handlePriceBlur = (e) => {
        const { name, value } = e.target;
        if (name === 'price' && value) {
            const formattedPrice = Number(value).toFixed(2);
            setFormData(prev => ({ ...prev, price: formattedPrice }));
        }
    };

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity >= 0) {
            setFormData(prev => ({ ...prev, quantity: newQuantity }));
        }
    };

    const handleSave = async () => {
        const newCigar = {
            ...formData,
            humidorId: humidorId,
            dateAdded: new Date(formData.dateAdded).toISOString(),
            flavorNotes: Array.isArray(formData.flavorNotes) ? formData.flavorNotes : [],
            rating: Number(formData.rating) || 0,
            price: Number(formData.price) || 0,
            quantity: Number(formData.quantity) || 1,
            length_inches: Number(formData.length_inches) || 0, // Ensure number type
            ring_gauge: Number(formData.ring_gauge) || 0,     // Ensure number type
        };
        const cigarsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'cigars');
        await addDoc(cigarsCollectionRef, newCigar);
        navigate('MyHumidor', { humidorId: humidorId });
    };

    const handleAutofill = async () => {
        if (!formData.name) {
            setModalState({ isOpen: true, content: "Please enter a cigar name to auto-fill.", isLoading: false });
            return;
        }
        setIsAutofilling(true);
        const prompt = `You are a cigar database. Based on the cigar name "${formData.name}", provide its details as a JSON object. The schema MUST be: { "brand": "string", "shape": "string", "size": "string", "country": "string", "wrapper": "string", "binder": "string", "filler": "string", "strength": "Mild" | "Mild-Medium" | "Medium" | "Medium-Full" | "Full", "flavorNotes": ["string", "string", "string", "string"], "shortDescription": "string", "description": "string", "image": "string", "rating": "number", "price": "number", "length_inches": "number", "ring_gauge": "number" }. If you cannot determine a value, use an empty string "" or an empty array [] or 0 for numbers. Do not include any text or markdown formatting outside of the JSON object.`;

        const responseSchema = {
            type: "OBJECT",
            properties: {
                brand: { type: "STRING" },
                shape: { type: "STRING" },
                size: { type: "STRING" },
                country: { type: "STRING" },
                wrapper: { type: "STRING" },
                binder: { type: "STRING" },
                filler: { type: "STRING" },
                strength: { type: "STRING", enum: ["Mild", "Mild-Medium", "Medium", "Medium-Full", "Full"] },
                flavorNotes: { type: "ARRAY", items: { type: "STRING" } },
                shortDescription: { type: "STRING" },
                description: { type: "STRING" },
                image: { type: "STRING" },
                rating: { type: "NUMBER" },
                price: { type: "NUMBER" },
                length_inches: { type: "NUMBER" },
                ring_gauge: { type: "NUMBER" }
            },
            required: ["brand", "shape", "size", "country", "wrapper", "binder", "filler", "strength", "flavorNotes", "shortDescription", "description", "image", "rating", "price", "length_inches", "ring_gauge"]
        };

        // Call the Gemini API with the prompt and response schema
        const result = await callGeminiAPI(prompt, responseSchema);
        console.log("Gemini result for", formData.name, result);

        if (typeof result === 'object' && result !== null) {
            const updatedFields = [];
            const currentFormData = { ...formData }; // Get a snapshot of the current state

            // Determine which fields will be updated
            for (const key in result) {
                const hasExistingValue = currentFormData[key] && (!Array.isArray(currentFormData[key]) || currentFormData[key].length > 0);
                const hasNewValue = result[key] && (!Array.isArray(result[key]) || result[key].length > 0);

                if (!hasExistingValue && hasNewValue) {
                    updatedFields.push(key);
                }
            }

            if (updatedFields.length > 0) {
                // Apply the updates to the form state
                setFormData(prevData => {
                    const updatedData = { ...prevData };
                    updatedFields.forEach(key => {
                        updatedData[key] = result[key];
                    });
                    return updatedData;
                });

                // Create a user-friendly list of changes for the modal
                const changesList = updatedFields
                    .map(field => `- ${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`)
                    .join('\n');
                const modalContent = `Woof! Roxy found some details for you and updated the following:\n\n${changesList}`;
                setModalState({ isOpen: true, content: modalContent, isLoading: false });
                setTimeout(() => setModalState({ isOpen: false, content: '', isLoading: false }), 8000); // Show for 8 seconds
            } else {
                // If no fields were updated, show a different message
                setModalState({ isOpen: true, content: "Ruff! Roxy looked, but all your details seem to be filled in already. Good job!", isLoading: false });
                setTimeout(() => setModalState({ isOpen: false, content: '', isLoading: false }), 5000); // Disappear after 5 seconds
            }
        } else {
            console.error("Gemini API response was not a valid object:", result);
            setModalState({ isOpen: true, content: `Ruff! Roxy couldn't fetch details. Try a different name or fill manually. Error: ${result}`, isLoading: false });
            setTimeout(() => setModalState({ isOpen: false, content: '', isLoading: false }), 5000); // Disappear after 5 seconds
        }

        setIsAutofilling(false);
    };

    const closeModal = () => setModalState({ isOpen: false, content: '', isLoading: false });

    // Function to update flavor notes from modal
    const handleFlavorNotesUpdate = (newNotes) => {
        setFormData(prev => ({ ...prev, flavorNotes: newNotes }));
    };

    return (
        <div className="pb-24">
            {modalState.isOpen && <GeminiModal title="Auto-fill Status" content={modalState.content} isLoading={modalState.isLoading} onClose={closeModal} />}
            {isFlavorModalOpen && <FlavorNotesModal cigar={{ flavorNotes: formData.flavorNotes }} db={db} appId={appId} userId={userId} onClose={() => setIsFlavorModalOpen(false)} setSelectedNotes={handleFlavorNotesUpdate} />}

            <div className="relative">
                <SmartImageModal
                    itemName={formData.name}
                    theme={theme}
                    currentImage={formData.image || `https://placehold.co/400x600/5a3825/ffffff?font=playfair-display&text=${formData.name.replace(/\s/g, '+') || 'Cigar+Image'}`}
                    currentPosition={formData.imagePosition || { x: 50, y: 50 }}
                    onImageAccept={(img, pos) => setFormData(prev => ({
                        ...prev,
                        image: img,
                        imagePosition: pos
                    }))}
                />
                {/* <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div> */}
                <div className="absolute top-4 left-4">
                    <button onClick={() => navigate('MyHumidor', { humidorId })} className="p-2 -ml-2 mr-2 bg-black/50 rounded-full">
                        <ChevronLeft className={`w-7 h-7 ${theme.text}`} />
                    </button>
                </div>
                <div className="absolute bottom-0 p-4">
                    <h1 className={`text-3xl font-bold ${theme.text}`}>Add New Cigar</h1>
                </div>
            </div>

            {/* Cigar Name and Details */}
            <div id="pnlCigarNameAndDetails" className="p-4 space-y-4">
                {/* Name / Line */}
                <InputField name="name" label="Name / Line" placeholder="e.g., 1964 Anniversary" value={formData.name} onChange={handleInputChange} theme={theme} />
                {/* Auto-fill Button */}
                <button onClick={handleAutofill} disabled={isAutofilling} className="w-full flex items-center justify-center gap-2 bg-purple-600/20 border border-purple-500 text-purple-300 font-bold py-2 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50">
                    {isAutofilling ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isAutofilling ? 'Thinking...' : '✨ Auto-fill Details'}
                </button>
                {/* Short Description */}
                <InputField name="shortDescription" label="Short Description" placeholder="Brief overview of the cigar..." value={formData.shortDescription} onChange={handleInputChange} theme={theme} />
                {/* Description */}
                <TextAreaField name="description" label="Description" placeholder="Notes on this cigar..." value={formData.description} onChange={handleInputChange} theme={theme} />
                {/* Brand */}
                <InputField name="brand" label="Brand" placeholder="e.g., Padrón" value={formData.brand} onChange={handleInputChange} theme={theme} />
                <div id="pnlShapeAndSize" className="grid grid-cols-2 gap-3">
                    <AutoCompleteInputField
                        name="shape"
                        label="Shape"
                        placeholder="e.g., Toro"
                        value={formData.shape}
                        onChange={handleInputChange}
                        suggestions={cigarShapes}
                        theme={theme}
                    />
                    <InputField name="size" label="Size" placeholder="e.g., 5.5x50" value={formData.size} onChange={handleInputChange} theme={theme} />
                </div>
                {/* Length and Ring Gauge */}
                <div id="pnlLengthAndRing" className="grid grid-cols-2 gap-3">
                    <AutoCompleteInputField
                        name="length_inches"
                        label="Length (inches)"
                        placeholder="e.g., 6"
                        type="number"
                        value={formData.length_inches}
                        onChange={handleInputChange}
                        theme={theme}
                        className={isLengthFlashing ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                        inputRef={lengthInputRef}
                        suggestions={cigarLengths}
                    />
                    <AutoCompleteInputField
                        name="ring_gauge"
                        label="Ring Gauge"
                        placeholder="e.g., 52"
                        type="number"
                        value={formData.ring_gauge}
                        onChange={handleInputChange}
                        theme={theme}
                        className={isGaugeFlashing ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                        inputRef={gaugeInputRef}
                        suggestions={cigarRingGauges}
                    />
                </div>
                {/* Wrapper and Binder */}
                <div id="pnlWrapperAndBinder" className="grid grid-cols-2 gap-3">
                    <AutoCompleteInputField
                        name="wrapper"
                        label="Wrapper"
                        placeholder="e.g., Maduro"
                        value={formData.wrapper}
                        onChange={handleInputChange}
                        suggestions={cigarWrapperColors}
                        theme={theme}
                    />
                    <AutoCompleteInputField
                        name="binder"
                        label="Binder"
                        placeholder="e.g., Nicaraguan"
                        value={formData.binder}
                        onChange={handleInputChange}
                        suggestions={cigarBinderTypes}
                        theme={theme}
                    />
                </div>
                {/* Filler and Country */}
                <div id="pnlFillerAndCountry" className="grid grid-cols-2 gap-3">
                    <AutoCompleteInputField
                        name="filler"
                        label="Filler"
                        placeholder="e.g., Dominican"
                        value={formData.filler}
                        onChange={handleInputChange}
                        suggestions={cigarFillerTypes}
                        theme={theme}
                    />
                    <AutoCompleteInputField
                        name="country"
                        label="Country"
                        placeholder="e.g., Cuba"
                        value={formData.country}
                        onChange={handleInputChange}
                        suggestions={cigarCountryOfOrigin}
                        theme={theme}
                    />
                </div>
                {/* Profile and Price */}
                <div id="pnlProfileAndPrice" className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <AutoCompleteInputField
                            name="profile"
                            label="Profile"
                            placeholder="e.g., Full"
                            value={formData.strength}
                            onChange={handleInputChange}
                            suggestions={strengthOptions}
                            theme={theme}
                        />

                        {strengthSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-b-xl mt-1 z-20 overflow-hidden">
                                {strengthSuggestions.map(suggestion => (<div key={suggestion} onMouseDown={() => handleSuggestionClick(suggestion)} className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors cursor-pointer">{suggestion}</div>))}
                            </div>
                        )}
                    </div>
                    {/* TODO: Add to Gimini lookup as MSRP price */}
                    <InputField name="price" label="Price" placeholder="e.g., 23.50" type="number" value={formData.price} onChange={handleInputChange} theme={theme} />
                </div>
                {/* Rating and Date Added */}
                <div id="pnlRatingAndDate" className="grid grid-cols-2 gap-3">
                    <InputField name="rating" label="Rating" placeholder="e.g., 94" type="number" value={formData.rating} onChange={handleInputChange} theme={theme} />
                    <InputField name="dateAdded" Tooltip="Date Added to Humidor" label="Date Added" type="date" value={formData.dateAdded} onChange={handleInputChange} theme={theme} />
                </div>
                {/* User Rating */}
                <div id="pnlUserRating" className="grid grid-cols-2 gap-3">
                    <InputField
                        name="userRating"
                        label="User Rating"
                        placeholder="e.g., 90"
                        type="number"
                        value={formData.userRating}
                        onChange={handleInputChange}
                        theme={theme}
                    />
                </div>
                {/* Flavor Notes */}
                <div id="pnlFlavorNotes" className="bg-gray-800/50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-amber-300 text-lg flex items-center"><Tag className="w-5 h-5 mr-3 text-amber-400" /> Flavor Notes</h3>
                        <button type="button" onClick={() => setIsFlavorModalOpen(true)} className="text-gray-400 hover:text-amber-400 p-1"><Edit className="w-4 h-4" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.flavorNotes.length > 0 ? (
                            formData.flavorNotes.map(note => (<span key={note} className={`text-xs font-semibold px-3 py-1 rounded-full ${getFlavorTagColor(note)}`}>{note}</span>))
                        ) : (
                            <p className="text-sm text-gray-500">No notes selected. Click the edit icon to add some!</p>
                        )}
                    </div>
                </div>
                {/* QuantityControl Component */}
                <div id="pnlQuantity" className="flex flex-col items-center py-4">
                    <label className={`text-sm font-medium ${theme.subtleText} mb-2`}>Quantity</label>
                    <QuantityControl quantity={formData.quantity} onChange={handleQuantityChange} theme={theme} />
                </div>
            </div>
            {/* Save/Cancel Buttons */}
            <div id="pnlSaveCancelButtons" className="pt-4 flex space-x-4">
                <button onClick={handleSave} className={`w-full ${theme.primaryBg} ${theme.text === 'text-white' ? 'text-white' : 'text-black'} font-bold py-3 rounded-lg ${theme.hoverPrimaryBg} transition-colors`}>Save Cigar</button>
                <button onClick={() => navigate('MyHumidor', { humidorId })} className={`w-full ${theme.button} ${theme.text} font-bold py-3 rounded-lg transition-colors`}>Cancel</button>
            </div>
        </div>
    );
};

const EditCigar = ({ navigate, db, appId, userId, cigar, theme }) => {
    const [formData, setFormData] = useState({ ...cigar, shortDescription: cigar.shortDescription || '', description: cigar.description || '', flavorNotes: cigar.flavorNotes || [], dateAdded: cigar.dateAdded ? cigar.dateAdded.split('T')[0] : new Date().toISOString().split('T')[0], length_inches: cigar.length_inches || '', ring_gauge: cigar.ring_gauge || '' });
    const [strengthSuggestions, setStrengthSuggestions] = useState([]);
    const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
    const [isAutofilling, setIsAutofilling] = useState(false);
    const [modalState, setModalState] = useState({ isOpen: false, content: '', isLoading: false });
    const [flashingFields, setFlashingFields] = useState({});

    // Refs for flashing effect
    const lengthInputRef = useRef(null);
    const gaugeInputRef = useRef(null);
    const [isLengthFlashing, setIsLengthFlashing] = useState(false);
    const [isGaugeFlashing, setIsGaugeFlashing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'strength') {
            setStrengthSuggestions(value ? strengthOptions.filter(opt => opt.toLowerCase().includes(value.toLowerCase())) : []);
        } else if (name === 'shape') {
            // Auto-update length_inches and ring_gauge based on selected shape
            const dimensions = commonCigarDimensions[value];
            if (dimensions) {
                setFormData(prev => ({
                    ...prev,
                    length_inches: dimensions.length_inches || '',
                    ring_gauge: dimensions.ring_gauge || ''
                }));
                // Trigger flashing effect for updated fields
                if (dimensions.length_inches) {
                    setIsLengthFlashing(true);
                    setTimeout(() => setIsLengthFlashing(false), 500);
                }
                if (dimensions.ring_gauge) {
                    setIsGaugeFlashing(true);
                    setTimeout(() => setIsGaugeFlashing(false), 500);
                }
            }
        }
    };

    const handlePriceBlur = (e) => {
        const { name, value } = e.target;
        if (name === 'price' && value) {
            const formattedPrice = Number(value).toFixed(2);
            setFormData(prev => ({ ...prev, price: formattedPrice }));
        }
    };

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity >= 0) {
            setFormData(prev => ({ ...prev, quantity: newQuantity }));
        }
    };

    const handleSuggestionClick = (value) => {
        setFormData({ ...formData, strength: value });
        setStrengthSuggestions([]);
    };

    const handleSave = async () => {
        const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigar.id);
        const { id, ...dataToSave } = formData;
        dataToSave.flavorNotes = Array.isArray(dataToSave.flavorNotes) ? dataToSave.flavorNotes : [];
        dataToSave.dateAdded = new Date(formData.dateAdded).toISOString();
        dataToSave.length_inches = Number(formData.length_inches) || 0;
        dataToSave.ring_gauge = Number(formData.ring_gauge) || 0;
        await updateDoc(cigarRef, dataToSave);
        navigate('CigarDetail', { cigarId: cigar.id });
    };

    const handleAutofill = async () => {
        if (!formData.name) {
            setModalState({ isOpen: true, content: "Please enter a cigar name to auto-fill.", isLoading: false });
            setTimeout(() => setModalState({ isOpen: false, content: '', isLoading: false }), 3000);
            return;
        }
        setIsAutofilling(true);
        setModalState({ isOpen: true, content: "Roxy is on the hunt for details...", isLoading: true });

        const prompt = `You are a cigar database. A user is editing an existing cigar record and wants to fill in any missing details.

Here is the existing data for the cigar:
- Brand: ${formData.brand || 'Not specified'}
- Name: ${formData.name}
- Shape: ${formData.shape || 'Not specified'}
- Size: ${formData.size || 'Not specified'}
- Country: ${formData.country || 'Not specified'}
- Wrapper: ${formData.wrapper || 'Not specified'}
- Binder: ${formData.binder || 'Not specified'}
- Filler: ${formData.filler || 'Not specified'}
- Strength: ${formData.strength || 'Not specified'}
- Price: ${formData.price ? 'Already has a price.' : 'Not specified'}
- Description: ${formData.description ? 'Already has a description.' : 'Not specified'}

Based on the cigar name "${formData.name}", provide a complete and accurate JSON object with all available details. The schema MUST be: { "brand": "string", "shape": "string", "size": "string", "country": "string", "wrapper": "string", "binder": "string", "filler": "string", "strength": "Mild" | "Mild-Medium" | "Medium" | "Medium-Full" | "Full", "flavorNotes": ["string"], "shortDescription": "string", "description": "string", "image": "string", "rating": "number", "price": "number", "length_inches": "number", "ring_gauge": "number" }.

Do not include any text or markdown formatting outside of the JSON object.`;

        const responseSchema = {
            type: "OBJECT",
            properties: {
                brand: { type: "STRING" },
                shape: { type: "STRING" },
                size: { type: "STRING" },
                country: { type: "STRING" },
                wrapper: { type: "STRING" },
                binder: { type: "STRING" },
                filler: { type: "STRING" },
                strength: { type: "STRING", enum: ["Mild", "Mild-Medium", "Medium", "Medium-Full", "Full"] },
                flavorNotes: { type: "ARRAY", items: { type: "STRING" } },
                shortDescription: { type: "STRING" },
                description: { type: "STRING" },
                image: { type: "STRING" },
                rating: { type: "NUMBER" },
                price: { type: "NUMBER" },
                length_inches: { type: "NUMBER" },
                ring_gauge: { type: "NUMBER" }
            },
        };

        const result = await callGeminiAPI(prompt, responseSchema);

        if (typeof result === 'object' && result !== null) {
            const updatedFields = {};
            for (const key in result) {
                const existingValue = formData[key];
                const newValue = result[key];
                if ((!existingValue || (Array.isArray(existingValue) && existingValue.length === 0)) && (newValue && (!Array.isArray(newValue) || newValue.length > 0))) {
                    updatedFields[key] = newValue;
                }
            }

            if (Object.keys(updatedFields).length > 0) {
                setFormData(prevData => ({ ...prevData, ...updatedFields }));

                const flashState = {};
                Object.keys(updatedFields).forEach(key => {
                    flashState[key] = true;
                });
                setFlashingFields(flashState);
                setTimeout(() => setFlashingFields({}), 1500); // Clear flashing after 1.5 seconds

                setModalState({ isOpen: true, content: 'Woof! Roxy found some details for you. Looks good!', isLoading: false });
                setTimeout(() => setModalState({ isOpen: false, content: '', isLoading: false }), 3000); // Disappear after 3 seconds
            } else {
                setModalState({ isOpen: true, content: "Ruff! Roxy looked, but all your details seem to be filled in already. Good job!", isLoading: false });
                setTimeout(() => setModalState({ isOpen: false, content: '', isLoading: false }), 3000);
            }
        } else {
            console.error("Gemini API response was not a valid object:", result);
            setModalState({ isOpen: true, content: `Ruff! Roxy couldn't fetch details. Try a different name or fill manually. Error: ${result}`, isLoading: false });
            setTimeout(() => setModalState({ isOpen: false, content: '', isLoading: false }), 3000); // Disappear after 3 seconds
        }

        setIsAutofilling(false);
    };

    const closeModal = () => setModalState({ isOpen: false, content: '', isLoading: false });

    // Function to update flavor notes from modal
    const handleFlavorNotesUpdate = (newNotes) => {
        setFormData(prev => ({ ...prev, flavorNotes: newNotes }));
    };

    return (
        <div className="pb-24">
            {modalState.isOpen && <GeminiModal title="Auto-fill Status" content={modalState.content} isLoading={modalState.isLoading} onClose={closeModal} />}
            {isFlavorModalOpen && <FlavorNotesModal cigar={{ flavorNotes: formData.flavorNotes }} db={db} appId={appId} userId={userId} onClose={() => setIsFlavorModalOpen(false)} setSelectedNotes={handleFlavorNotesUpdate} />}

            <div className="relative">
                <SmartImageModal
                    itemName={formData.name}
                    theme={theme}
                    currentImage={formData.image || `https://placehold.co/400x600/5a3825/ffffff?font=playfair-display&text=${formData.name.replace(/\s/g, '+') || 'Cigar+Image'}`}
                    currentPosition={formData.imagePosition || { x: 50, y: 50 }}
                    onImageAccept={(img, pos) => setFormData(prev => ({
                        ...prev,
                        image: img,
                        imagePosition: pos
                    }))}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
                <div className="absolute top-4 left-4">
                    <button onClick={() => navigate('CigarDetail', { cigarId: cigar.id })} className="p-2 -ml-2 mr-2 bg-black/50 rounded-full">
                        <ChevronLeft className="w-7 h-7 text-white" />
                    </button>
                </div>
                <div id="pnlEditCigarTitle" className="absolute bottom-0 p-4">
                    <h1 className="text-3xl font-bold text-white">Edit Cigar</h1>
                </div>
            </div>

            {/* Cigar Name and Details */}
            <div id="pnlCigarNameAndDetails" className="p-4 space-y-4">
                {/* Brand */}
                <InputField name="brand" label="Brand" placeholder="e.g., Padrón" value={formData.brand} onChange={handleInputChange} theme={theme} className={flashingFields.brand ? 'ring-2 ring-amber-400 animate-pulse' : ''} />
                {/* Name / Line */}
                <InputField name="name" label="Name / Line" placeholder="e.g., 1964 Anniversary" value={formData.name} onChange={handleInputChange} theme={theme} className={flashingFields.name ? 'ring-2 ring-amber-400 animate-pulse' : ''} />
                {/* Auto-fill Button */}
                <button onClick={handleAutofill} disabled={isAutofilling} className="w-full flex items-center justify-center gap-2 bg-purple-600/20 border border-purple-500 text-purple-300 font-bold py-2 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50">
                    {isAutofilling ? <LoaderCircle className="w-5 h-5 animate-pulse" /> : <Sparkles className="w-5 h-5" />}
                    {isAutofilling ? 'Thinking...' : '✨ Auto-fill Details'}
                </button>
                {/* Short Description */}
                <InputField name="shortDescription" label="Short Description" placeholder="Brief overview of the cigar..." value={formData.shortDescription} onChange={handleInputChange} theme={theme} className={flashingFields.shortDescription ? 'ring-2 ring-amber-400 animate-pulse' : ''} />
                {/* Description */}
                <TextAreaField name="description" label="Description" placeholder="Notes on this cigar..." value={formData.description} onChange={handleInputChange} theme={theme} className={flashingFields.description ? 'ring-2 ring-amber-400 animate-pulse' : ''} />
                {/* Shape and Size */}
                <div id="pnlShapeAndSize" className="grid grid-cols-2 gap-3">
                    <AutoCompleteInputField
                        id="EditCigarShape"
                        name="shape"
                        label="Shape"
                        placeholder="e.g., Toro"
                        value={formData.shape}
                        onChange={handleInputChange}
                        suggestions={cigarShapes}
                        theme={theme}
                        className={flashingFields.shape ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                    />
                    <InputField name="size" label="Size" placeholder="e.g., 5.5x50" value={formData.size} onChange={handleInputChange} theme={theme} className={flashingFields.size ? 'ring-2 ring-amber-400 animate-pulse' : ''} />
                </div>
                {/* Length and Ring Gauge */}
                <div id="pnlLengthAndRing" className="grid grid-cols-2 gap-3">
                    <AutoCompleteInputField
                        name="length_inches"
                        label="Length (inches)"
                        placeholder="e.g., 6"
                        type="number"
                        value={formData.length_inches}
                        onChange={handleInputChange}
                        theme={theme}
                        className={`${isLengthFlashing ? 'ring-2 ring-amber-400 animate-pulse' : ''} ${flashingFields.length_inches ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
                        inputRef={lengthInputRef}
                        suggestions={cigarLengths}
                    />
                    <AutoCompleteInputField
                        name="ring_gauge"
                        label="Ring Gauge"
                        placeholder="e.g., 52"
                        type="number"
                        value={formData.ring_gauge}
                        onChange={handleInputChange}
                        theme={theme}
                        className={`${isGaugeFlashing ? 'ring-2 ring-amber-400 animate-pulse' : ''} ${flashingFields.ring_gauge ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
                        inputRef={gaugeInputRef}
                        suggestions={cigarRingGauges}
                    />
                </div>
                {/* Wrapper and Binder */}
                <div id="pnlWrapperAndBinder" className="grid grid-cols-2 gap-3">
                    <AutoCompleteInputField
                        name="wrapper"
                        label="Wrapper"
                        placeholder="e.g., Maduro"
                        value={formData.wrapper}
                        onChange={handleInputChange}
                        suggestions={cigarWrapperColors}
                        theme={theme}
                        className={flashingFields.wrapper ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                    />
                    <AutoCompleteInputField
                        name="binder"
                        label="Binder"
                        placeholder="e.g., Nicaraguan"
                        value={formData.binder}
                        onChange={handleInputChange}
                        suggestions={cigarBinderTypes}
                        theme={theme}
                        className={flashingFields.binder ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                    />
                </div>
                {/* Filler and Country */}
                <div id="pnlFillerAndCountry" className="grid grid-cols-2 gap-3">
                    <AutoCompleteInputField
                        name="filler"
                        label="Filler"
                        placeholder="e.g., Dominican"
                        value={formData.filler}
                        onChange={handleInputChange}
                        suggestions={cigarFillerTypes}
                        theme={theme}
                        className={flashingFields.filler ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                    />
                    <AutoCompleteInputField
                        name="country"
                        label="Country"
                        placeholder="e.g., Cuba"
                        value={formData.country}
                        onChange={handleInputChange}
                        suggestions={cigarCountryOfOrigin}
                        theme={theme}
                        className={flashingFields.country ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                    />
                </div>
                {/* Profile and Price */}
                <div id="pnlProfileAndPrice" className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <InputField name="strength" label="Strength" placeholder="e.g., Full" value={formData.strength} onChange={handleInputChange} theme={theme} className={flashingFields.strength ? 'ring-2 ring-amber-400 animate-pulse' : ''} />
                        {strengthSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-b-xl mt-1 z-20 overflow-hidden">
                                {strengthSuggestions.map(suggestion => (<div key={suggestion} onMouseDown={() => handleSuggestionClick(suggestion)} className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors cursor-pointer">{suggestion}</div>))}
                            </div>
                        )}
                    </div>
                    <InputField name="price" label="Price Paid" placeholder="e.g., 15.50" type="number" value={formData.price} onChange={handleInputChange} onBlur={handlePriceBlur} theme={theme} className={flashingFields.price ? 'ring-2 ring-amber-400 animate-pulse' : ''} />
                </div>
                {/* Rating and Date Added */}
                <div id="pnlRatingAndDate" className="grid grid-cols-2 gap-3">
                    <InputField
                        name="rating"
                        label="Rating"
                        placeholder="e.g., 94"
                        type="number"
                        value={formData.rating}
                        onChange={handleInputChange}
                        theme={theme}
                        className={flashingFields.rating ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                    />
                    <InputField
                        name="dateAdded"
                        label="Date Added"
                        type="date"
                        value={formData.dateAdded}
                        onChange={handleInputChange}
                        theme={theme}
                    />
                </div>
                {/* User Rating */}
                <div id="pnlRatingAndDate" className="grid grid-cols-2 gap-3">
                    <InputField
                        name="userRating"
                        label="User Rating"
                        placeholder="e.g., 90"
                        type="number"
                        value={formData.userRating}
                        onChange={handleInputChange}
                        theme={theme}
                        className={flashingFields.userRating ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                    />
                </div>

                {/* Flavor Notes */}
                <div id="pnlFlavorNotes" className="bg-gray-800/50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-amber-300 text-lg flex items-center"><Tag className="w-5 h-5 mr-3 text-amber-400" /> Flavor Notes</h3>
                        <button type="button" onClick={() => setIsFlavorModalOpen(true)} className="text-gray-400 hover:text-amber-400 p-1"><Edit className="w-4 h-4" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.flavorNotes.length > 0 ? (
                            formData.flavorNotes.map(note => (<span key={note} className={`text-xs font-semibold px-3 py-1 rounded-full ${getFlavorTagColor(note)}`}>{note}</span>))
                        ) : (
                            <p className="text-sm text-gray-500">No notes selected. Click the edit icon to add some!</p>
                        )}
                    </div>
                </div>
                {/* QuantityControl Component */}
                <div id="pnlQuantity" className="flex flex-col items-center py-4">
                    <label className={`text-sm font-medium ${theme.subtleText} mb-2`}>Quantity</label>
                    <QuantityControl quantity={formData.quantity} onChange={handleQuantityChange} theme={theme} />
                </div>
                {/* Save/Cancel Buttons */}
                <div id="pnlSaveCancelButtons" className="pt-4 flex space-x-4">
                    <button onClick={handleSave} className="w-full bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors">Save Changes</button>
                    <button onClick={() => navigate('CigarDetail', { cigarId: cigar.id })} className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                </div>
            </div>
        </div>
    );
};

const AlertsScreen = ({ navigate, humidors }) => {
    const [alertSettings, setAlertSettings] = useState(
        humidors.map(h => ({ humidorId: h.id, name: h.name, humidityAlert: false, minHumidity: 68, maxHumidity: 72, tempAlert: false, minTemp: 65, maxTemp: 70 }))
    );

    const handleToggle = (humidorId, type) => {
        setAlertSettings(prev => prev.map(s => s.humidorId === humidorId ? { ...s, [type]: !s[type] } : s));
    };

    const handleValueChange = (humidorId, type, value) => {
        setAlertSettings(prev => prev.map(s => s.humidorId === humidorId ? { ...s, [type]: value } : s));
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className="w-7 h-7 text-white" /></button>
                <h1 className="text-3xl font-bold text-white">Alerts</h1>
            </div>
            <div className="space-y-6">
                {humidors && humidors.length > 0 ? (
                    alertSettings.map(setting => (
                        <div key={setting.humidorId} className="bg-gray-800/50 p-4 rounded-xl">
                            <h3 className="font-bold text-xl text-amber-300 mb-4">{setting.name}</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Humidity Alert</span>
                                    <button onClick={() => handleToggle(setting.humidorId, 'humidityAlert')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${setting.humidityAlert ? 'bg-amber-500' : 'bg-gray-600'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${setting.humidityAlert ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                                </div>
                                {setting.humidityAlert && (
                                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-700 ml-2">
                                        <div className="flex items-center space-x-2"><label className="text-sm text-gray-400">Min:</label><input type="number" value={setting.minHumidity} onChange={(e) => handleValueChange(setting.humidorId, 'minHumidity', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" /><span className="text-gray-400">%</span></div>
                                        {/* FIX: Changed unit from °F to % for max humidity */}
                                        <div className="flex items-center space-x-2"><label className="text-sm text-gray-400">Max:</label><input type="number" value={setting.maxHumidity} onChange={(e) => handleValueChange(setting.humidorId, 'maxHumidity', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" /><span className="text-gray-400">%</span></div>
                                    </div>
                                )}
                                <div className="border-t border-gray-700"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Temperature Alert</span>
                                    <button onClick={() => handleToggle(setting.humidorId, 'tempAlert')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${setting.tempAlert ? 'bg-amber-500' : 'bg-gray-600'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${setting.tempAlert ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                                </div>
                                {setting.tempAlert && (
                                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-700 ml-2">
                                        <div className="flex items-center space-x-2"><label className="text-sm text-gray-400">Min:</label><input type="number" value={setting.minTemp} onChange={(e) => handleValueChange(setting.humidorId, 'minTemp', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" /><span className="text-gray-400">°F</span></div>
                                        <div className="flex items-center space-x-2"><label className="text-sm text-gray-400">Max:</label><input type="number" value={setting.maxTemp} onChange={(e) => handleValueChange(setting.humidorId, 'maxTemp', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" /><span className="text-gray-400">°F</span></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-6 text-center">
                        <h3 className="font-bold text-amber-300 text-lg flex items-center justify-center mb-3">
                            <Wind className="w-5 h-5 mr-2" /> Roxy's Corner
                        </h3>
                        <p className="text-amber-200 text-sm mb-4">
                            Ruff! You need to add a humidor before you can set up any alerts. Let's get your first one set up!
                        </p>
                        <button
                            onClick={() => navigate('AddHumidor')}
                            className="flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors w-full"
                        >
                            <Plus className="w-4 h-4" /> Add a Humidor
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const SettingsScreen = ({ navigate, theme, setTheme, dashboardPanelVisibility, setDashboardPanelVisibility, selectedFont, setSelectedFont }) => {
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const appVersion = process.env.REACT_APP_VERSION || '1.1.0-dev';
    const SettingItem = ({ icon: Icon, title, subtitle, onClick }) => (
        <button onClick={onClick} className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-left">
            <div className="p-2 bg-gray-700 rounded-full"><Icon className={`w-6 h-6 ${theme.primary}`} /></div>
            <div>
                <p className={`font-bold ${theme.text}`}>{title}</p>
                <p className={`text-xs ${theme.subtleText}`}>{subtitle}</p>
            </div>
        </button>
    );

    return (
        <div className="p-4 pb-24">
            {isThemeModalOpen && <ThemeModal currentTheme={theme} setTheme={setTheme} onClose={() => setIsThemeModalOpen(false)} />}
            <div className="flex items-center mb-6">
                <SettingsIcon className={`w-8 h-8 mr-3 ${theme.primary}`} />
                <h1 className="text-3xl font-bold text-white">Settings</h1>
            </div>
            <div className="space-y-4">
                <SettingItem icon={User} title="Profile" subtitle="Manage your account details" onClick={() => navigate('Profile')} />
                <SettingItem icon={Database} title="Data & Sync" subtitle="Export or import your collection" onClick={() => navigate('DataSync')} />
                <SettingItem icon={LayoutGrid} title="Dashboard Components" subtitle="Customize what appears on your dashboard" onClick={() => navigate('DashboardSettings')} />
                {/* <SettingItem icon={Bell} title="Notifications" subtitle="Set up alerts for humidity and temp" onClick={() => navigate('Notifications')} /> */}
                {/* <SettingItem icon={Zap} title="Integrations" subtitle="Connect to Govee and other services" onClick={() => navigate('Integrations')} /> */}
                <SettingItem icon={Palette} title="Theme" subtitle={`Current: ${theme.name}`} onClick={() => setIsThemeModalOpen(true)} />
                <SettingItem icon={Info} title="Fonts" subtitle="Choose your preferred font combination" onClick={() => navigate('Fonts')} disabled={true} />
                <SettingItem icon={BarChart2} title="Deeper Statistics & Insights" subtitle="Explore advanced stats about your collection" onClick={() => navigate('DeeperStatistics')} />
                <SettingItem icon={Info} title="About Humidor Hub" subtitle={`Version ${appVersion}`} onClick={() => navigate('About')} />
            </div>
        </div>
    );
};

const DashboardSettingsScreen = ({ navigate, theme, dashboardPanelVisibility, setDashboardPanelVisibility }) => {
    const ToggleSwitch = ({ label, isChecked, onToggle }) => (
        <div className="flex justify-between items-center py-2">
            <span className="text-gray-300">{label}</span>
            <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isChecked ? 'bg-amber-500' : 'bg-gray-600'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className={`w-7 h-7 ${theme.text}`} /></button>
                <h1 className={`text-3xl font-bold ${theme.text}`}>Dashboard Components</h1>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl space-y-2">
                <ToggleSwitch
                    label="Inventory Analysis"
                    isChecked={dashboardPanelVisibility.showInventoryAnalysis}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showInventoryAnalysis: !prev.showInventoryAnalysis }))}
                />
                <ToggleSwitch
                    label="Interactive World Map"
                    isChecked={dashboardPanelVisibility.showWorldMap}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showWorldMap: !prev.showWorldMap }))}
                />
                <ToggleSwitch
                    label="Browse by Wrapper"
                    isChecked={dashboardPanelVisibility.showWrapperPanel}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showWrapperPanel: !prev.showWrapperPanel }))}
                />
                <ToggleSwitch
                    label="Browse by Strength"
                    isChecked={dashboardPanelVisibility.showStrengthPanel}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showStrengthPanel: !prev.showStrengthPanel }))}
                />
                <ToggleSwitch
                    label="Browse by Country"
                    isChecked={dashboardPanelVisibility.showCountryPanel}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showCountryPanel: !prev.showCountryPanel }))}
                />
                <ToggleSwitch
                    label="Aging Well / From the Cellar"
                    isChecked={dashboardPanelVisibility.showAgingWellPanel}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showAgingWellPanel: !prev.showAgingWellPanel }))}
                />
            </div>
        </div>
    );
};

const FontPicker = ({ selectedFont, setSelectedFont, theme }) => (
    <div id="font-picker" className="mb-4">
        <label className={`block text-sm font-bold mb-2 ${theme.text}`}>Font Style</label>
        <select
            value={selectedFont.label}
            onChange={e => {
                const font = fontOptions.find(f => f.label === e.target.value);
                if (font) {
                    setSelectedFont(font);
                }
            }}
            className={`w-full p-2 rounded border ${theme.inputBg} ${theme.text} ${theme.borderColor}`}
        >
            {fontOptions.map(font => (
                <option key={font.label} value={font.label}>
                    {font.label}
                </option>
            ))}
        </select>
        <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-900/50">
            <h3
                style={{
                    fontFamily: selectedFont.heading,
                    fontWeight: 700,
                    fontSize: '1.25rem', // 20px
                    color: theme.text === 'text-white' ? '#E5E7EB' : '#1F2937' // gray-200 or gray-800
                }}
            >
                Heading Example
            </h3>
            <p
                className="text-base" // Use a standard body size for preview
                style={{
                    fontFamily: selectedFont.body,
                    color: theme.text === 'text-white' ? '#D1D5DB' : '#374151' // gray-300 or gray-700
                }}
            >
                This is an example of the body text. It will change as you select a different font combination from the dropdown menu above, giving you a live preview.
            </p>
        </div>
    </div>
);

const FontsScreen = ({ navigate, selectedFont, setSelectedFont, theme }) => {
    // Local state for the font preview. Initialized with the currently active app font.
    const [previewFont, setPreviewFont] = useState(selectedFont);

    // Handler to save the selected preview font as the new app-wide font.
    const handleSaveChanges = () => {
        setSelectedFont(previewFont);
        navigate('Settings'); // Go back to settings after saving.
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className={`w-7 h-7 ${theme.text}`} />
                </button>
                <h1 className="text-3xl font-bold text-white">Fonts</h1>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
                {/* Pass the local preview state and its setter to the FontPicker */}
                <FontPicker selectedFont={previewFont} setSelectedFont={setPreviewFont} theme={theme} />
            </div>
            <p className="mt-6 text-gray-400 text-sm">
                Choose your preferred font combination for the app. This will change the look and feel of all text throughout Humidor Hub.
            </p>
            {/* Save Changes Button */}
            <div className="mt-6 flex gap-4">
                <button
                    onClick={handleSaveChanges}
                    className={`w-full ${theme.primaryBg} ${theme.text === 'text-white' ? 'text-white' : 'text-black'} font-bold py-3 rounded-lg ${theme.hoverPrimaryBg} transition-colors`}
                >
                    Save Changes
                </button>
                <button
                    onClick={() => navigate('Settings')}
                    className={`w-full ${theme.button} ${theme.text} font-bold py-3 rounded-lg transition-colors`}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

const IntegrationsScreen = ({ navigate, goveeApiKey, setGoveeApiKey, goveeDevices, setGoveeDevices, theme }) => {
    const [key, setKey] = useState(goveeApiKey || '');
    const [status, setStatus] = useState(goveeApiKey ? 'Connected' : 'Not Connected');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleConnectGovee = async () => {
        setIsLoading(true);
        setMessage('');
        setGoveeDevices([]);

        if (!key) {
            setMessage('Please enter a Govee API Key.');
            setIsLoading(false);
            return;
        }

        try {
            const devices = await fetchGoveeDevices(key);
            if (devices.length > 0) {
                setGoveeApiKey(key);
                setGoveeDevices(devices);
                setStatus('Connected');
                setMessage(`Successfully connected! Found ${devices.length} Govee device(s).`);
            } else {
                setGoveeApiKey('');
                setGoveeDevices([]);
                setStatus('Not Connected');
                setMessage('No Govee devices found with this API key. Please check your key and ensure devices are online.');
            }
        } catch (error) {
            console.error("Error connecting to Govee:", error);
            setGoveeApiKey('');
            setGoveeDevices([]);
            setStatus('Not Connected');
            setMessage(`Failed to connect to Govee: ${error.message}.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className={`w-7 h-7 ${theme.text}`} /></button>
                <h1 className={`text-3xl font-bold ${theme.text}`}>Integrations</h1>
            </div>
            <div className="space-y-6">
                <div className={`${theme.card} p-4 rounded-xl`}>
                    <h3 className="font-bold text-xl text-amber-300 mb-2">Govee</h3>
                    <p className={`${theme.subtleText} text-sm mb-4`}>Connect your Govee account to automatically sync temperature and humidity data.</p>
                    <div className="space-y-2">
                        <label className={`text-sm font-medium ${theme.subtleText} mb-1 block`}>Govee API Key</label>
                        <input type="text" placeholder="Enter your Govee API Key (e.g., TEST_KEY_123)" value={key} onChange={(e) => { setKey(e.target.value); setStatus('Not Connected'); setMessage(''); }} className={`w-full ${theme.inputBg} border ${theme.borderColor} rounded-lg py-2 px-3 ${theme.text} placeholder-gray-500 focus:outline-none focus:ring-2 ${theme.ring}`} />
                        <p className={`${theme.subtleText} text-xs`}>Get this from the Govee Home app under "About Us {'>'} Apply for API Key".</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <span className={`text-sm font-bold ${status === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>Status: {isLoading ? 'Connecting...' : status}</span>
                        <button onClick={handleConnectGovee} disabled={isLoading} className={`flex items-center gap-2 ${theme.primaryBg} text-white font-bold text-sm px-4 py-2 rounded-full ${theme.hoverPrimaryBg} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>
                            {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {isLoading ? 'Connecting...' : 'Connect'}
                        </button>
                    </div>
                    {message && (<p className={`mt-3 text-sm ${status === 'Connected' ? 'text-green-300' : 'text-red-300'}`}>{message}</p>)}
                    {goveeDevices.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-300 font-semibold mb-2">Found Devices:</p>
                            <ul className="list-disc list-inside text-gray-400 text-xs">{goveeDevices.map(d => (<li key={d.device}>{d.deviceName} ({d.model})</li>))}</ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const NotificationsScreen = ({ navigate, humidors }) => {
    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
            </div>
            <div className="space-y-6">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="font-bold text-xl text-amber-300 mb-2">Notification Preferences</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Choose how you want to be notified about important events in your humidor collection.
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">In-App Alerts</span>
                            <input type="checkbox" checked readOnly className="accent-amber-500 w-5 h-5" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">Email Notifications</span>
                            <input type="checkbox" disabled className="accent-amber-500 w-5 h-5" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">Push Notifications</span>
                            <input type="checkbox" disabled className="accent-amber-500 w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="font-bold text-xl text-amber-300 mb-2">Recent Alerts</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Here you’ll see a history of recent humidity and temperature alerts for your humidors.
                    </p>
                    <ul className="text-sm text-gray-300 space-y-2">
                        <li>No recent alerts. All your humidors are in the safe zone!</li>
                        {/* Example: <li>Humidity dropped below 68% in "Office Humidor" (July 7, 2025)</li> */}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const DataSyncScreen = ({ navigate, db, appId, userId, cigars, humidors }) => {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [modalDataType, setModalDataType] = useState(null); // 'cigar' or 'humidor'

    const exportEnvironmentData = () => {
        let headers = ['humidorId,name,humidity,temp'];
        let envCsv = humidors.reduce((acc, humidor) => {
            const { id, name, humidity, temp } = humidor;
            acc.push([id, name, humidity, temp].join(','));
            return acc;
        }, []);
        downloadFile({ data: [...headers, ...envCsv].join('\n'), fileName: 'humidor_environment_export.csv', fileType: 'text/csv' });
    };

    const handleOpenExportModal = (type) => {
        setModalDataType(type);
        setIsExportModalOpen(true);
    };

    const handleOpenImportModal = (type) => {
        setModalDataType(type);
        setIsImportModalOpen(true);
    };

    return (
        <div className="p-4 pb-24">
            {isImportModalOpen && <ImportCsvModal dataType={modalDataType} data={modalDataType === 'cigar' ? cigars : humidors} db={db} appId={appId} userId={userId} onClose={() => setIsImportModalOpen(false)} humidors={humidors} navigate={navigate} />}
            {isExportModalOpen && <ExportModal dataType={modalDataType} data={modalDataType === 'cigar' ? cigars : humidors} onClose={() => setIsExportModalOpen(false)} />}

            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className="w-7 h-7 text-white" /></button>                <h1 className="text-3xl font-bold text-white">Import & Export</h1>
            </div>

            <div className="space-y-6">
                <CollapsiblePanel title="Cigar Collection" description="Import or export your individual cigar data." icon={Cigarette}>
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => handleOpenImportModal('cigar')} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"><UploadCloud className="w-5 h-5" />Import Cigars from CSV</button>
                        <button onClick={() => handleOpenExportModal('cigar')} className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"><Download className="w-5 h-5" />Export Cigars</button>
                    </div>
                </CollapsiblePanel>

                <CollapsiblePanel title="Humidor Management" description="Transfer your humidor setup and details." icon={Box}>
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => handleOpenImportModal('humidor')} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"><UploadCloud className="w-5 h-5" />Import Humidors from CSV</button>
                        <button onClick={() => handleOpenExportModal('humidor')} className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"><Download className="w-5 h-5" />Export Humidors</button>
                    </div>
                </CollapsiblePanel>

                <CollapsiblePanel title="Environment Data" description="Download historical temperature and humidity data for all humidors." icon={Thermometer}>
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={exportEnvironmentData} className="w-full flex items-center justify-center gap-2 bg-purple-600/80 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors"><Download className="w-5 h-5" />Export Environment CSV</button>
                    </div>
                </CollapsiblePanel>
            </div>
        </div>
    );
};

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


const CollapsiblePanel = ({ title, description, children, icon: Icon, theme }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full p-4 flex justify-between items-center">
                <h3 className="font-bold text-amber-300 text-lg flex items-center">
                    {Icon && <Icon className="w-5 h-5 mr-2" />} {title}
                </h3>
                <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
            {!isCollapsed && (
                <div className="px-4 pb-4 space-y-4">
                    <p className="text-gray-400 text-sm">{description}</p>
                    {children}
                </div>
            )}
        </div>
    );
};

export default function App() {
    const [navigation, setNavigation] = useState({ screen: 'Dashboard', params: {} });
    const [cigars, setCigars] = useState([]);
    const [humidors, setHumidors] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);
    const [theme, setTheme] = useState(themes["Humidor Hub"]);
    const [goveeApiKey, setGoveeApiKey] = useState('');
    const [goveeDevices, setGoveeDevices] = useState([]);

    const [selectedFont, setSelectedFont] = useState(fontOptions[0]);

    // State for controlling dashboard panel visibility
    // This state will determine which panels are shown in the Dashboard.
    // It is initialized to show all panels by default, will be conditionally overridden in Dashboard component
    const [dashboardPanelVisibility, setDashboardPanelVisibility] = useState({
        showWrapperPanel: false,
        showStrengthPanel: false,
        showCountryPanel: false,

        showInventoryAnalysis: true,
        showWorldMap: true,
        showAgingWellPanel: true,
    });

    // New state to manage the open/closed status of dashboard panels
    const [dashboardPanelStates, setDashboardPanelStates] = useState({
        roxy: true,
        liveEnvironment: true,
        inventoryAnalysis: true,
        wrapper: true,
        strength: true,
        country: true,
        worldMap: true,
        agingWell: true
    });

    // Gemini TODO:Firebase state
    // This state will hold the Firebase database and authentication instances.
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch

    // Extract appId from the Firebase configuration to pass as a prop.
    const appId = firebaseConfigExport.appId;

    // One-time Firebase initialization and authentication
    useEffect(() => {
        try {
            // Check if the Firebase config object is available.
            if (Object.keys(firebaseConfigExport).length === 0) {
                console.error("Firebase config is empty. App cannot initialize.");
                setIsLoading(false);
                return;
            }

            // Initialize the Firebase app with the provided configuration.
            const app = initializeApp(firebaseConfigExport);
            // Get instances of Firestore and Authentication services.
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);

            // --- LOCAL DEVELOPMENT EMULATOR SETUP ---
            // This checks if the app is running on 'localhost'.
            // If it is, it connects to the local Firebase emulators instead of the live cloud services.
            // This is crucial for development to avoid touching production data.
            const isLocalDev = window.location.hostname === 'localhost';
            if (isLocalDev) {
                console.log("Connecting to local Firebase emulators...");

                // Connect to the Auth emulator. The default port is 9099.
                connectAuthEmulator(firebaseAuth, "http://localhost:9099");

                // Connect to the Firestore emulator. The default port is 8080.
                connectFirestoreEmulator(firestoreDb, 'localhost', 8080);
            }
            // --- END OF EMULATOR SETUP ---

            // Set the initialized db and auth instances to state.
            setDb(firestoreDb);
            setAuth(firebaseAuth);

            // Set the Firebase app ID for use in Firestore paths.
            onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    console.log("User signed in:", user.uid);
                } else {
                    if (isLocalDev || !initialAuthToken) {
                        // Gemini TODO: App hangs here when loading into Capacitor
                        console.log("No user signed in. Using anonymous sign-in.");
                        // Local dev or no token: use anonymous sign-in
                        await signInAnonymously(firebaseAuth);
                    } else {
                        // Production with token: use custom token
                        console.log("Using custom auth token for sign-in.");
                        try {
                            await signInWithCustomToken(firebaseAuth, initialAuthToken);
                        } catch (error) {
                            console.error("Failed to sign in with custom token:", error);
                            await signInAnonymously(firebaseAuth);
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            setIsLoading(false);
        }
    }, []); // The empty dependency array `[]` ensures this effect runs only once when the component mounts.

    // Effect for fetching data from Firestore
    // This effect runs whenever the `db` or `userId` state changes.
    useEffect(() => {
        // We only proceed if both the database connection and the user ID are available.
        if (db && userId) {
            setIsLoading(true); // Set loading to true while we fetch data.

            // Set up a real-time listener for the 'humidors' collection.
            // `onSnapshot` will automatically update the `humidors` state whenever data changes in Firestore.
            const humidorsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'humidors');
            const unsubscribeHumidors = onSnapshot(humidorsCollectionRef, (snapshot) => {
                const humidorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHumidors(humidorsData);
            }, (error) => {
                console.error("Error fetching humidors:", error);
            });

            // Set up a real-time listener for the 'cigars' collection.
            const cigarsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'cigars');
            const unsubscribeCigars = onSnapshot(cigarsCollectionRef, (snapshot) => {
                const cigarsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCigars(cigarsData);
                setIsLoading(false); // Set loading to false after the initial cigar data is loaded.
            }, (error) => {
                console.error("Error fetching cigars:", error);
                setIsLoading(false);
            });

            // Set up a real-time listener for the 'journalEntries' collection.
            const journalEntriesCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'journalEntries');
            const unsubscribeJournalEntries = onSnapshot(journalEntriesCollectionRef, (snapshot) => {
                const entriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setJournalEntries(entriesData);
            }, (error) => {
                console.error("Error fetching journal entries:", error);
            });



            // This is a cleanup function. When the component unmounts (or `db`/`userId` changes),
            // it will detach the listeners to prevent memory leaks.
            return () => {
                console.log("Cleaning up Firestore listeners...");
                unsubscribeHumidors();
                console.log("Unsubscribing from humidors updates.");
                unsubscribeCigars();
                console.log("Unsubscribing from cigars updates.");
                unsubscribeJournalEntries();
                console.log("Unsubscribing from journal entries updates.");
            };
        }
    }, [db, userId]); // Dependencies for this effect.

    // This effect runs whenever the `navigation` state changes.
    // It is used to scroll the window to the top smoothly when navigating between screens.
    // Scroll to top on navigation change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [navigation]);

    // Function to handle navigation between screens.
    // It takes the screen name and any parameters to pass to that screen.
    const navigate = (screen, params = {}) => {
        setNavigation({ screen, params });
    };

    // This function determines which screen component to render based on the current navigation state.
    const renderScreen = () => {
        const { screen, params } = navigation;

        // A loading screen is shown while Firebase is initializing and fetching data.
        if (isLoading) {
            return (
                <div className={`w-full h-screen flex flex-col items-center justify-center ${theme.bg}`}>
                    <LoaderCircle className={`w-12 h-12 ${theme.primary} animate-spin`} />
                    <p className={`mt-4 ${theme.text}`}>Loading Your Collection...</p>
                </div>
            );
        }

        // A `switch` statement is used to select the correct component.
        switch (screen) {
            case 'Dashboard':
                return <Dashboard navigate={navigate} cigars={cigars}
                    humidors={humidors} theme={theme}
                    showWrapperPanel={dashboardPanelVisibility.showWrapperPanel}
                    showStrengthPanel={dashboardPanelVisibility.showStrengthPanel}
                    showCountryPanel={dashboardPanelVisibility.showCountryPanel}

                    showInventoryAnalysis={dashboardPanelVisibility.showInventoryAnalysis}
                    panelStates={dashboardPanelStates}
                    setPanelStates={setDashboardPanelStates}
                    dashboardPanelVisibility={dashboardPanelVisibility} />;
            case 'HumidorsScreen':
                return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} db={db} appId={appId} userId={userId} theme={theme} {...params} />;
            case 'MyHumidor':
                const humidor = humidors.find(h => h.id === params.humidorId);
                return humidor ? <MyHumidor humidor={humidor} navigate={navigate} cigars={cigars} humidors={humidors} db={db} appId={appId} userId={userId} theme={theme} /> : <div>Humidor not found</div>;
            case 'CigarDetail':
                const cigar = cigars.find(c => c.id === params.cigarId);
                return cigar ? <CigarDetail cigar={cigar} navigate={navigate} db={db} appId={appId} userId={userId} journalEntries={journalEntries} /> : <div>Cigar not found</div>; case 'AddCigar':
                return <AddCigar navigate={navigate} db={db} appId={appId} userId={userId} humidorId={params.humidorId} theme={theme} />;
            case 'EditCigar':
                const cigarToEdit = cigars.find(c => c.id === params.cigarId);
                return cigarToEdit ? <EditCigar navigate={navigate} db={db} appId={appId} userId={userId} cigar={cigarToEdit} theme={theme} /> : <div>Cigar not found</div>;
            case 'Alerts':
                return <AlertsScreen navigate={navigate} humidors={humidors} />;
            case 'Fonts':
                return <FontsScreen navigate={navigate} selectedFont={selectedFont} setSelectedFont={setSelectedFont} theme={theme} />;
            case 'Settings':
                return <SettingsScreen navigate={navigate} theme={theme} setTheme={setTheme} dashboardPanelVisibility={dashboardPanelVisibility} setDashboardPanelVisibility={setDashboardPanelVisibility} selectedFont={selectedFont} setSelectedFont={setSelectedFont} />;
            case 'AddHumidor':
                return <AddHumidor navigate={navigate} db={db} appId={appId} userId={userId} theme={theme} />;
            case 'EditHumidor':
                const humidorToEdit = humidors.find(h => h.id === params.humidorId);
                return humidorToEdit ? <EditHumidor navigate={navigate} db={db} appId={appId} userId={userId} humidor={humidorToEdit} goveeApiKey={goveeApiKey} goveeDevices={goveeDevices} theme={theme} /> : <div>Humidor not found</div>;
            case 'CigarJournal':
                return <CigarJournalScreen navigate={navigate} journalEntries={journalEntries} theme={theme} db={db} appId={appId} userId={userId} />;
            case 'AddEditJournalEntry':
                const cigarForJournal = cigars.find(c => c.id === params.cigarId);
                const entryToEdit = journalEntries.find(e => e.id === params.entryId);
                return cigarForJournal ? <AddEditJournalEntry navigate={navigate} db={db} appId={appId} userId={userId} cigar={cigarForJournal} existingEntry={entryToEdit} theme={theme} /> : <div>Cigar not found for journal entry.</div>;
            case 'DashboardSettings':
                return <DashboardSettingsScreen navigate={navigate} theme={theme} dashboardPanelVisibility={dashboardPanelVisibility} setDashboardPanelVisibility={setDashboardPanelVisibility} />;

            case 'DeeperStatistics':
                return <DeeperStatisticsScreen navigate={navigate} cigars={cigars} theme={theme} />;
            case 'Integrations':
                return <IntegrationsScreen navigate={navigate} goveeApiKey={goveeApiKey} setGoveeApiKey={setGoveeApiKey} goveeDevices={goveeDevices} setGoveeDevices={setGoveeDevices} theme={theme} />;
            case 'DataSync':
                return <DataSyncScreen navigate={navigate} db={db} appId={appId} userId={userId} cigars={cigars} humidors={humidors} />;
            case 'Notifications':
                return <NotificationsScreen navigate={navigate} humidors={humidors} />;
            case 'About':
                return <AboutScreen navigate={navigate} />;
            case 'Profile':
                return <ProfileScreen navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} userId={userId} auth={auth} />;
            default:
                return <Dashboard navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} showWrapperPanel={dashboardPanelVisibility.showWrapperPanel} showStrengthPanel={dashboardPanelVisibility.showStrengthPanel} showCountryPanel={dashboardPanelVisibility.showCountryPanel} showInventoryAnalysis={dashboardPanelVisibility.showInventoryAnalysis} panelStates={dashboardPanelStates} setPanelStates={setDashboardPanelStates} />;
        }
    }; //end of renderScreen function

    // If the user is not signed in and Firebase auth is available, show the Firebase Auth UI.
    // This component handles user authentication.
    if (!userId && auth) {
        return <FirebaseAuthUI auth={auth} onSignIn={setUserId} />;
    }

    // The main return statement for the App component.
    return (
        <div
            className={`min-h-screen ${theme.bg} ${theme.text}`}
            style={{
                fontFamily: selectedFont.body,
            }}
        >
            <div className="max-w-md mx-auto">
                {renderScreen()}
            </div>
            <BottomNav activeScreen={navigation.screen} navigate={navigate} theme={theme} />
        </div>
    );
}
