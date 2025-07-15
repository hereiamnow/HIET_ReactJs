// File: App.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 9, 2025
// Time: 10:01 PM CDT

// Description of Changes:
// - Updated the "Description of Changes" header with a summary of the recent changes.

// Next Suggestions:
// - Implement drag-and-drop reordering for the dashboard panels on desktop.
// - Persist the user's custom panel order to local storage.
// - Implement full Firebase authentication flow (sign-up, login, password reset).
// - Enhance error handling with user-friendly messages for all API calls and database operations.
// - Add more robust input validation for all forms.
// - Give the user the option to reset the date when moving cigars to a new humidor.
// - Add font support in ThemeModal for custom fonts. Serif and sans-serif fonts.
// - Implement a "Cigar of the Day" feature that highlights a random cigar from the user's collection each day picked by Roxy.
// - Add a "Cigar Journal" feature where users can log their smoking experiences, notes, and ratings for each cigar.
// - Implement Firebase Storage integration for image uploads.

// Firebase configuration and initialization.
import { db, auth, firebaseConfigExport } from './firebase';

// FirebaseUI component for authentication.
import FirebaseAuthUI from './FirebaseAuthUI';// FirebaseUI component for handling user sign-in and authentication.

// React is the main library for building the user interface.
// useState, useEffect, and useMemo are "hooks" that let us use state and other React features in functional components.
import React, { useState, useEffect, useMemo, useRef } from 'react'; // Import useRef for flashing effect
// lucide-react provides a set of clean, modern icons used throughout the app.

import { ArrowUp, ArrowDown, MoreVertical, CheckSquare, AlertTriangle, BarChart2, Bell, Box, Calendar as CalendarIcon, Check, ChevronDown, ChevronLeft, Cigarette, Database, DollarSign, Download, Droplets, Edit, FileText, Filter, Info, LayoutGrid, Leaf, List, LoaderCircle, LogOut, MapPin, Minus, Move, Palette, PieChart as PieChartIcon, Plus, Search, Settings as SettingsIcon, Sparkles, Star, Tag, Thermometer, Trash2, Upload, UploadCloud, User, Wind, X, Zap } from 'lucide-react';
// recharts is a library for creating the charts (bar, line, pie) on the dashboard.
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse'; // Import papaparse for CSV parsing and exporting.
// Import Firebase libraries for database and authentication
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, writeBatch, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, connectAuthEmulator } from "firebase/auth";
import { themes } from './constants/themes';
import { roxysTips } from './constants/roxysTips';
import { fontOptions } from './constants/fontOptions';
import { strengthOptions, allFlavorNotes, commonCigarDimensions, cigarShapes, cigarLengths, cigarRingGauges, cigarWrapperColors, cigarBinderTypes, cigarFillerTypes, cigarCountryOfOrigin } from './constants/cigarOptions';
import QuantityControl from './components/UI/QuantityControl';
import GridCigarCard from './components/Cigar/GridCigarCard';
import ListCigarCard from './components/Cigar/ListCigarCard';
import InputField from './components/UI/InputField';
import TextAreaField from './components/UI/TextAreaField';
import AutoCompleteInputField from './components/UI/AutoCompleteInputField';
import ChartCard from './components/UI/ChartCard';
import { getRatingColor } from './components/utils/getRatingColor';
import { calculateAge } from './components/utils/calculateAge';
import  ProfileScreen  from './components/Settings/ProfileScreen';

const initialAuthToken = typeof window !== "undefined" && window.initialAuthToken ? window.initialAuthToken : null;

// --- HELPER & UI COMPONENTS ---

/**
 * A helper function to trigger a file download in the browser.
 * This is used for exporting data.
 */
const downloadFile = ({ data, fileName, fileType }) => {
    const blob = new Blob([data], { type: fileType });
    const a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
};

/**
 * Generates an image using the Gemini (Imagen 3) API.
 * @param {string} itemName - The name of the item to generate an image for.
 * @param {string} [itemCategory] - The category of the item (e.g., 'cigar', 'humidor').
 * @param {string} [itemType] - The specific type of the item (e.g., 'Desktop Humidor').
 * @returns {Promise<string>} A promise that resolves to a base64 image data URL.
 */
const generateAiImage = async (itemName, itemCategory, itemType) => {
    // This prompt is sent to the AI to guide the image generation.
    let prompt;
    if (itemCategory === 'humidor') {
        prompt = `A professional, high-quality, photorealistic image of a ${itemType || ''} ${itemName} humidor, suitable for a product catalog. The background should be clean and simple, focusing on the product.`;
    } else {
        // Default prompt for cigars or other items
        prompt = `A professional, high-quality, photorealistic image of a ${itemName}, suitable for a product catalog. The background should be clean and simple, focusing on the product.`;
    }

    // The payload is the data structure required by the Gemini API endpoint.
    const payload = {
        instances: [{ prompt: prompt }],
        parameters: { "sampleCount": 1 }
    };

    const apiKey = firebaseConfigExport.apiKey;
    const projectId = firebaseConfigExport.projectId;

    const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-generate-002:predict`;

    try {
        // We use a try/catch block to handle potential network errors.
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // Use Bearer token for authentication
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // If the API returns an error status (e.g., 400, 500), we throw an error.
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            // The API returns the image as a base64 string. We format it into a data URL
            // that can be used directly in an <img> src attribute.
            return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        } else {
            // This case handles a successful API call that doesn't return the expected image data.
            console.error("AI image generation failed:", result);
            return `https://placehold.co/600x400/ef4444/ffffff?font=playfair-display&text=Generation+Failed`;
        }
    } catch (error) {
        // This catches network errors or the error thrown above.
        console.error("Error calling Gemini API:", error);
        return `https://placehold.co/600x400/ef4444/ffffff?font=playfair-display&text=Error`;
    }
};

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
        // Change z-[100] to z-[200] here:
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

const HumidorActionMenu = ({ onEdit, onTakeReading, onExport, onDelete, onImport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const MenuItem = ({ icon: Icon, text, onClick, className = '' }) => (
        <button
            onClick={() => {
                onClick();
                setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-700 ${className}`}
        >
            <Icon className="w-5 h-5" />
            <span>{text}</span>
        </button>
    );

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-black/50 rounded-full text-white">
                <MoreVertical className="w-6 h-6" />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-30 overflow-hidden">
                    <MenuItem icon={Edit} text="Edit this Humidor" onClick={onEdit} className="text-gray-200" />
                    <MenuItem icon={FileText} text="Take Manual Reading" onClick={onTakeReading} className="text-gray-200" />
                    <div className="border-t border-gray-700 my-1"></div>
                    <MenuItem icon={UploadCloud} text="Import Cigars from CSV" onClick={onImport} className="text-gray-200" />
                    <MenuItem icon={Download} text="Export Cigars to CSV" onClick={onExport} className="text-gray-200" />
                    <div className="border-t border-gray-700 my-1"></div>
                    <MenuItem icon={Trash2} text="Delete this Humidor" onClick={onDelete} className="text-red-400 hover:bg-red-900/50" />
                </div>
            )}
        </div>
    );
}

// ===================================================================================
//  REUSABLE & CHILD COMPONENTS
//  These are the building blocks for our main feature.
// ===================================================================================

/**
 * A reusable "controlled" component that displays a draggable image.
 * Its position is managed by a parent component, making it flexible.
 * @param {object} props - The component's props.
 * @param {string} props.src - The source URL for the image.
 * @param {object} props.position - The current position {x, y} of the image.
 * @param {function} props.onPositionChange - Callback function to update the position in the parent.
 */
const DraggableImage = ({ src, position, onPositionChange }) => {
    // State to track if the user is currently dragging the image.
    const [isDragging, setIsDragging] = useState(false);
    // A ref to the container div to get its dimensions for calculating position.
    const containerRef = useRef(null);

    // Handlers for starting and ending the drag action.
    const handleDragStart = (e) => {
        e.preventDefault(); // Prevents the browser's default image drag behavior.
        setIsDragging(true);
    };
    const handleDragEnd = () => setIsDragging(false);

    // This function calculates the new image position based on mouse or touch movement.
    const handleDrag = (clientX, clientY) => {
        // Only run this logic if dragging is active and the container ref is set.
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        // Calculate position as a percentage of the container's dimensions.
        // Math.max/min clamps the value between 0 and 100 to keep the image within the frame.
        const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

        // Call the parent's function to update the position state.
        onPositionChange({ x, y });
    };

    return (
        <div ref={containerRef} className="h-full w-full overflow-hidden">
            <img
                src={src}
                alt="Draggable Preview"
                className={`h-full w-full max-w-none object-cover ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                    objectPosition: `${position.x}% ${position.y}%`,
                    transform: 'scale(1.25)' // "Zooms in" to provide more draggable area.
                }}
                // Event handlers for both mouse and touch input.
                onMouseDown={handleDragStart}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd} // Stop dragging if the mouse leaves the component.
                onMouseMove={(e) => handleDrag(e.clientX, e.clientY)}
                onTouchStart={handleDragStart}
                onTouchEnd={handleDragEnd}
                onTouchMove={(e) => handleDrag(e.touches[0].clientX, e.touches[0].clientY)}
                draggable="false"
            />
        </div>
    );
};

/**
 * Displays the main image placeholder on the form. This version is for display only.
 * @param {object} props - The component's props.
 * @param {string} props.image - The source URL for the image.
 * @param {object} props.position - The saved position {x, y} of the image.
 * @param {function} props.onClick - The function to call when the component is clicked.
 */
const ImagePreview = ({ image, position, onClick }) => {
    return (
        <div className="group relative w-full h-64 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-slate-400 hover:bg-slate-100 overflow-hidden">
            {image ? (
                <>
                    {/* This image just displays the saved position; it is not draggable itself. */}
                    <img
                        src={image}
                        alt="Item Preview"
                        className="h-full w-full max-w-none object-cover"
                        style={{
                            objectPosition: `${position.x}% ${position.y}%`,
                            transform: 'scale(1.25)'
                        }}
                        draggable="false"
                    />
                    {/* The overlay is the dedicated click target to open the modal. */}
                    <div
                        onClick={onClick}
                        className="absolute inset-0 flex items-center justify-center rounded-md bg-black bg-opacity-60 text-xl text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                    >
                        Edit Image
                    </div>
                </>
            ) : (
                // Placeholder for when there's no image.
                <div onClick={onClick} className="flex h-full w-full flex-col items-center justify-center text-slate-500 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mb-4 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Tap to add an image</p>
                </div>
            )}
        </div>
    );
};

/**
 * A helper function to determine the color of a flavor tag based on the note.
 * This makes the UI more visually interesting and informative.
 */
const getFlavorTagColor = (note) => {
    const lowerNote = note.toLowerCase();
    switch (lowerNote) {
        // Earthy/Woody
        case 'earthy': case 'woody': case 'leather': case 'oak': case 'toasted':
            return 'bg-yellow-900/50 text-yellow-200 border border-yellow-800';

        // Sweet
        case 'almond': case 'caramel': case 'chocolate': case 'coconut':
        case 'honey': case 'maple': case 'molasses': case 'raisin':
        case 'sweet': case 'vanilla':
            return 'bg-amber-700/60 text-amber-100 border border-amber-600';

        // Spicy
        case 'anise': case 'cardamom': case 'cinnamon': case 'clove':
        case 'ginger': case 'pepper': case 'paprika': case 'saffron':
        case 'spicy':
            return 'bg-red-800/60 text-red-200 border border-red-700';

        // Fruity
        case 'black cherry': case 'candle wax': case 'citrus':
        case 'floral': case 'fruity': case 'mint': case 'toasted bread':
            return 'bg-purple-800/60 text-purple-200 border border-purple-700';

        // Creamy/Nutty
        case 'buttery': case 'creamy': case 'nutty': case 'smoky':
            return 'bg-orange-900/60 text-orange-200 border border-orange-800';

        // Other
        case 'charred': case 'coffee':
            return 'bg-yellow-950/60 text-yellow-100 border border-yellow-900';

        // Default case for unrecognized notes
        default:
            return 'bg-gray-700 text-gray-200 border border-gray-600';
    }
};

/**
 * A helper function to parse the numerical capacity from a humidor's size string.
 * e.g., "150-count" -> 150
 */
const parseHumidorSize = (sizeString) => {
    if (!sizeString || typeof sizeString !== 'string') return 0;
    const match = sizeString.match(/\d+/); // Find the first sequence of digits
    return match ? parseInt(match[0], 10) : 0;
};

/**
 * Formats an ISO date string into a more readable format (e.g., "July 5, 2025").
 */
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    // Add timeZone to prevent off-by-one day errors
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
};

/**
 * Gauge component for displaying humidity and temperature.
 */
const Gauge = ({ value, maxValue, label, unit, icon: Icon }) => {
    const percentage = Math.min(Math.max(value / maxValue, 0), 1);
    const isOptimalHum = value >= 68 && value <= 72 && unit === '%';
    const isOptimalTemp = value >= 65 && value <= 70 && unit === '°F';
    const ringColor = (isOptimalHum || isOptimalTemp) ? 'stroke-green-400' : 'stroke-yellow-400';

    return (
        <div className="relative flex flex-col items-center justify-center w-40 h-40 sm:w-48 sm:h-48">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="stroke-current text-gray-700" cx="60" cy="60" r="50" strokeWidth="10" fill="none" />
                <circle
                    className={`transform -rotate-90 origin-center transition-all duration-500 ${ringColor}`}
                    cx="60" cy="60" r="50" strokeWidth="10" fill="none"
                    strokeDasharray="314" strokeDashoffset={314 - (percentage * 314)} strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                {Icon && <Icon className="w-8 h-8 mb-1 text-gray-300" />}
                <span className="text-4xl font-bold text-white">{value.toFixed(0)}<span className="text-2xl">{unit}</span></span>
                <span className="text-sm text-gray-400">{label}</span>
            </div>
        </div>
    );
};

/**
 * StatCard component for displaying a single statistic on the dashboard.
 */
const StatCard = ({ title, value, icon: Icon, theme }) => (
    <div className={`${theme.card} p-3 rounded-xl flex items-center space-x-3 w-full min-w-0`}>
        {Icon && (
            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <Icon className={`w-6 h-6 ${theme.primary}`} />
            </div>
        )}
        <div className="flex flex-col min-w-0">
            <p className={`${theme.subtleText} text-xs truncate`}>{title}</p>
            <p className={`${theme.text} font-bold text-lg truncate`}>{value}</p>
        </div>
    </div>
);

/**
 * BottomNav component for the main app navigation.
 */
const BottomNav = ({ activeScreen, navigate, theme }) => {
    const navItems = [
        { name: 'Dashboard', icon: BarChart2 },
        { name: 'HumidorsScreen', icon: Box },
        { name: 'Alerts', icon: Bell },
        { name: 'Settings', icon: SettingsIcon }, // Use SettingsIcon here
    ];

    return (
        <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto ${theme.bg}/80 backdrop-blur-sm border-t ${theme.borderColor} flex justify-around h-20 items-center z-50`}>
            {navItems.map(item => (
                <button key={item.name} onClick={() => navigate(item.name)}
                    className={`flex flex-col items-center justify-center w-1/4 transition-colors duration-300 ${activeScreen === item.name ? theme.primary : theme.subtleText}`}>
                    <item.icon className="w-7 h-7 mb-1" />
                    <span className="text-xs font-medium">{item.name === 'HumidorsScreen' ? 'My Humidors' : item.name}</span>
                </button>
            ))}
        </div>
    );
};

/**
 * GeminiModal is a pop-up used to display content fetched from the Gemini API.
 */
const GeminiModal = ({ title, content, isLoading, onClose }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-amber-400 flex items-center"><Sparkles className="w-5 h-5 mr-2" /> {title}</h3>
                {isLoading ? (
                    <LoaderCircle className="w-6 h-6 text-amber-500 animate-spin" />
                ) : (
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                )}
            </div>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48">
                    <LoaderCircle className="w-12 h-12 text-amber-500 animate-spin" />
                    <p className="mt-4 text-gray-300">Consulting the experts...</p>
                </div>
            ) : (
                <div className="text-gray-300 whitespace-pre-wrap font-light text-sm leading-relaxed max-h-96 overflow-y-auto">{content}</div>
            )}
        </div>
    </div>
);

/**
 * FlavorNotesModal is a pop-up for editing the flavor notes of a cigar.
 */
const FlavorNotesModal = ({ cigar, db, appId, userId, onClose, setSelectedNotes: updateParentNotes }) => {
    const [selectedNotes, setSelectedNotes] = useState(cigar?.flavorNotes || []);

    const handleToggleNote = (note) => {
        setSelectedNotes(prev => {
            const newNotes = prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note];
            updateParentNotes(newNotes); // Update parent's state immediately
            return newNotes;
        });
    };

    const handleSave = async () => {
        // This function is only called when the modal's internal save button is clicked.
        // For AddEditCigarModal, we update parent's state directly on toggle.
        // For CigarDetail, we would save to Firestore here.
        if (cigar?.id) { // Only save to Firestore if it's an existing cigar from CigarDetail
            const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigar.id);
            await updateDoc(cigarRef, { flavorNotes: selectedNotes });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><Tag className="w-5 h-5 mr-2" /> Edit Flavor Notes</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <div className="flex-grow overflow-y-auto max-h-72 mb-4 pr-2">
                    <div className="flex flex-wrap gap-2">
                        {allFlavorNotes.map(note => {
                            const isSelected = selectedNotes.includes(note);
                            return (
                                <button
                                    key={note}
                                    type="button" // Important to prevent form submission
                                    onClick={() => handleToggleNote(note)}
                                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all duration-200 ${getFlavorTagColor(note)} ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
                                >
                                    {note}
                                </button>
                            );
                        })}
                    </div>
                </div>
                {cigar?.id && ( // Only show save button if editing an existing cigar (from CigarDetail)
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                        <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="button" onClick={handleSave} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors">Save</button>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * ThemeModal is a pop-up for selecting a new app theme.
 */
const ThemeModal = ({ currentTheme, setTheme, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><Palette className="w-5 h-5 mr-2" /> Select Theme</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {Object.values(themes).map(theme => (
                        <button
                            key={theme.name}
                            onClick={() => {
                                setTheme(theme);
                                onClose();
                            }}
                            className={`p-4 rounded-lg border-2 ${currentTheme.name === theme.name ? 'border-amber-400' : 'border-gray-600'} ${theme.bg}`}
                        >
                            <div className={`w-16 h-10 ${theme.card} rounded-md mb-2 border ${theme.borderColor}`}></div>
                            <p className={`${theme.text} font-semibold text-sm`}>{theme.name}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * MoveCigarsModal is a pop-up for moving selected cigars to another humidor.
 */
const MoveCigarsModal = ({ onClose, onMove, destinationHumidors, theme }) => {
    const [selectedHumidorId, setSelectedHumidorId] = useState(destinationHumidors[0]?.id || '');

    const handleMove = () => {
        if (selectedHumidorId) {
            onMove(selectedHumidorId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><Move className="w-5 h-5 mr-2" /> Move Cigars</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">Select the destination humidor for the selected cigars.</p>
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Move to</label>
                        <select
                            value={selectedHumidorId}
                            onChange={(e) => setSelectedHumidorId(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                        >
                            {destinationHumidors.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                        <button onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                        <button onClick={handleMove} disabled={!selectedHumidorId} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                            Move
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * A modal for confirming the deletion of a humidor.
 */
const DeleteHumidorModal = ({ isOpen, onClose, onConfirm, humidor, cigarsInHumidor, otherHumidors }) => {
    const [deleteAction, setDeleteAction] = useState('move');
    const [destinationHumidorId, setDestinationHumidorId] = useState(otherHumidors[0]?.id || '');

    useEffect(() => {
        if (isOpen) {
            setDeleteAction(otherHumidors.length > 0 ? 'move' : 'deleteAll');
            setDestinationHumidorId(otherHumidors[0]?.id || '');
        }
    }, [isOpen, otherHumidors]);

    if (!isOpen) return null;

    const hasCigars = cigarsInHumidor.length > 0;
    const hasOtherHumidors = otherHumidors.length > 0;

    const handleConfirm = () => {
        onConfirm({
            action: hasCigars ? deleteAction : 'deleteEmpty',
            destinationHumidorId: deleteAction === 'move' ? destinationHumidorId : null,
        });
    };

    const exportToCsv = () => {
        let headers = ['id,name,brand,line,shape,isBoxPress,length_inches,ring_gauge,Size,Country of Origin,wrapper,binder,filler,strength,flavorNotes,rating,userRating,price,quantity,image,shortDescription,description'];
        let usersCsv = cigarsInHumidor.reduce((acc, cigar) => {
            const { id, name, brand, line = '', shape, isBoxPress = false, length_inches = 0, ring_gauge = 0, size, country, wrapper, binder, filler, strength, flavorNotes, rating, userRating = 0, quantity, price, image = '', shortDescription = '', description = '' } = cigar;
            acc.push([
                id, name, brand, line, shape, isBoxPress ? 'TRUE' : 'FALSE', length_inches, ring_gauge, size, country, wrapper, binder, filler, strength, `"${(flavorNotes || []).join(';')}"`, rating, userRating, price, quantity, image, shortDescription, description
            ].join(','));
            return acc;
        }, []);
        downloadFile({
            data: [...headers, ...usersCsv].join('\n'),
            fileName: `${humidor.name}_export.csv`,
            fileType: 'text/csv',
        });
    };

    const exportToJson = () => {
        downloadFile({
            data: JSON.stringify(cigarsInHumidor, null, 2),
            fileName: `${humidor.name}_export.json`,
            fileType: 'application/json',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-red-400 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Delete Humidor</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <p className="text-gray-300 mb-4">Are you sure you want to delete <span className="font-bold text-white">"{humidor.name}"</span>?</p>

                {hasCigars && (
                    <div className="space-y-4">
                        <div className="bg-red-900/40 border border-red-700 p-3 rounded-lg">
                            <p className="text-sm text-red-200">This humidor contains <span className="font-bold">{cigarsInHumidor.length}</span> cigar(s). Please choose what to do with them.</p>
                        </div>

                        <div className="space-y-2">
                            {hasOtherHumidors && (
                                <label className={`flex items-center p-3 rounded-lg cursor-pointer ${deleteAction === 'move' ? 'bg-amber-600/30 border-amber-500' : 'bg-gray-700/50 border-gray-600'} border`}>
                                    <input type="radio" name="deleteAction" value="move" checked={deleteAction === 'move'} onChange={(e) => setDeleteAction(e.target.value)} className="hidden" />
                                    <Move className="w-5 h-5 mr-3 text-amber-400" />
                                    <div>
                                        <p className="font-bold text-white">Move Cigars</p>
                                        <p className="text-xs text-gray-300">Move cigars to another humidor.</p>
                                    </div>
                                </label>
                            )}
                            <label className={`flex items-center p-3 rounded-lg cursor-pointer ${deleteAction === 'export' ? 'bg-amber-600/30 border-amber-500' : 'bg-gray-700/50 border-gray-600'} border`}>
                                <input type="radio" name="deleteAction" value="export" checked={deleteAction === 'export'} onChange={(e) => setDeleteAction(e.target.value)} className="hidden" />
                                <Download className="w-5 h-5 mr-3 text-amber-400" />
                                <div>
                                    <p className="font-bold text-white">Export and Delete</p>
                                    <p className="text-xs text-gray-300">Save cigar data to a file, then delete.</p>
                                </div>
                            </label>
                            <label className={`flex items-center p-3 rounded-lg cursor-pointer ${deleteAction === 'deleteAll' ? 'bg-red-600/30 border-red-500' : 'bg-gray-700/50 border-gray-600'} border`}>
                                <input type="radio" name="deleteAction" value="deleteAll" checked={deleteAction === 'deleteAll'} onChange={(e) => setDeleteAction(e.target.value)} className="hidden" />
                                <Trash2 className="w-5 h-5 mr-3 text-red-400" />
                                <div>
                                    <p className="font-bold text-white">Delete Everything</p>
                                    <p className="text-xs text-gray-300">Permanently delete humidor and all cigars inside.</p>
                                </div>
                            </label>
                        </div>

                        {deleteAction === 'move' && hasOtherHumidors && (
                            <div className="pl-4 border-l-2 border-amber-500 ml-3">
                                <label className="text-sm font-medium text-gray-300 mb-1 block">Destination Humidor</label>
                                <select value={destinationHumidorId} onChange={(e) => setDestinationHumidorId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                                    {otherHumidors.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                            </div>
                        )}
                        {deleteAction === 'export' && (
                            <div className="pl-4 border-l-2 border-amber-500 ml-3 flex gap-2">
                                <button type="button" onClick={exportToCsv} className="flex-1 text-sm flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors">Export CSV</button>
                                <button type="button" onClick={exportToJson} className="flex-1 text-sm flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">Export JSON</button>
                            </div>
                        )}
                        {deleteAction === 'deleteAll' && (
                            <div className="pl-4 border-l-2 border-red-500 ml-3 text-sm text-red-300">
                                This action cannot be undone. All associated cigar data will be lost forever.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="button" onClick={handleConfirm} disabled={deleteAction === 'move' && !destinationHumidorId} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * A modal for confirming the deletion of multiple selected cigars.
 * FIX: This component now accepts a 'count' prop to display a dynamic message.
 */
const DeleteCigarsModal = ({ isOpen, onClose, onConfirm, count }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-red-400 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Delete {count > 1 ? 'Cigars' : 'Cigar'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <p className="text-gray-300 mb-4">Are you sure you want to delete the selected {count > 1 ? `${count} cigars` : 'cigar'}? This action cannot be undone.</p>

                <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="button" onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * A modal for manually inputting temperature and humidity readings for a humidor.
 */
const ManualReadingModal = ({ isOpen, onClose, onSave, initialTemp, initialHumidity }) => {
    const [temp, setTemp] = useState(initialTemp);
    const [humidity, setHumidity] = useState(initialHumidity);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(parseFloat(temp), parseFloat(humidity));
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><Thermometer className="w-5 h-5 mr-2" /> Take Manual Reading</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Temperature (°F)</label>
                        <input
                            type="number"
                            value={temp}
                            onChange={(e) => setTemp(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="e.g., 68"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Humidity (%)</label>
                        <input
                            type="number"
                            value={humidity}
                            onChange={(e) => setHumidity(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="e.g., 70"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-700">
                    <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors">Save Reading</button>
                </div>
            </div>
        </div>
    );
};

/**
 * The modal dialog for choosing and editing an image.
 * @param {object} props - The component's props.
 */
const ImageUploadModal = ({ isOpen, onClose, onImageAccept, itemName, initialImage, initialPosition, theme, itemCategory, itemType }) => {
    const [activeTab, setActiveTab] = useState('url');
    const [imageUrl, setImageUrl] = useState('');
    const [preview, setPreview] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef(null);

    // This state manages the position of the image *inside the modal*.
    const [modalPosition, setModalPosition] = useState(initialPosition);

    // When the modal opens, this effect syncs its state with the main form's state.
    useEffect(() => {
        if (isOpen) {
            setPreview(initialImage || '');
            setModalPosition(initialPosition || { x: 50, y: 50 });
            setImageUrl(initialImage || ''); // <-- Set the URL field to the current image
        }
    }, [isOpen, initialImage, initialPosition]);

    // When switching to the "Paste URL" tab, update the imageUrl field to match the current image.
    useEffect(() => {
        if (activeTab === 'url') {
            setImageUrl(preview || initialImage || '');
        }
    }, [activeTab, preview, initialImage]);

    if (!isOpen) return null; // Don't render the modal if it's not open.

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setModalPosition({ x: 50, y: 50 }); // Reset position for new uploads.
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAiGenerate = async () => {
        if (!itemName || isGenerating) return;
        setIsGenerating(true);
        setPreview('');

        const generatedImage = await generateAiImage(itemName, itemCategory, itemType); setPreview(generatedImage);
        setModalPosition({ x: 50, y: 50 }); // Reset position for new AI images.

        setIsGenerating(false);
    };

    // When saving, pass both the image URL and its final position back to the App.
    const handleSave = () => {
        if (preview) {
            onImageAccept(preview, modalPosition);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={onClose}>
            <div className={`w-full max-w-md rounded-lg ${theme.card} p-6 shadow-xl border-none`} onClick={(e) => e.stopPropagation()}>
                <div className={`mb-4 flex items-center justify-between border-b ${theme.borderColor} pb-4`}>
                    <h2 className={`text-2xl font-semibold ${theme.text}`}>Choose an Image</h2>
                    <button onClick={onClose} className={`text-3xl ${theme.subtleText} hover:${theme.text}`}>&times;</button>
                </div>

                <div>
                    <div className={`mb-6 flex h-64 items-center justify-center rounded-lg border ${theme.borderColor} ${theme.inputBg} p-2 overflow-hidden`}>
                        {isGenerating && <div className={`${theme.subtleText}`}>Generating your image...</div>}
                        {preview && !isGenerating && <DraggableImage src={preview} position={modalPosition} onPositionChange={setModalPosition} />}
                        {!preview && !isGenerating && <div className={`${theme.subtleText} text-center`}>Image preview will appear here</div>}
                    </div>

                    <div>
                        <div className={`mb-6 flex space-x-2 border-b ${theme.borderColor}`}>
                            <button onClick={() => setActiveTab('url')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'url' ? `border-b-2 ${theme.primary} ${theme.text}` : `${theme.subtleText}`}`}>Paste URL</button>
                            <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'upload' ? `border-b-2 ${theme.primary} ${theme.text}` : `${theme.subtleText}`}`}>Upload Image</button>
                            <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'ai' ? 'border-b-2 border-purple-500 text-purple-300' : `${theme.subtleText}`}`}>Generate with AI</button>
                        </div>

                        <div className="mb-4">
                            {activeTab === 'url' && (
                                <div>
                                    <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" className={`flex-grow rounded-md border ${theme.borderColor} p-2 ${theme.inputBg} ${theme.text} focus:border-amber-500 focus:ring-amber-500`} />
                                    <button onClick={() => { setPreview(imageUrl); setModalPosition({ x: 50, y: 50 }); }} className={`rounded-md ${theme.button} px-4 py-2 ${theme.text}`}>Preview</button>
                                    <p className={`mt-2 text-xs ${theme.subtleText}`}>Here is a subtle description</p>
                                </div>
                            )}
                            {activeTab === 'upload' && (
                                <div>
                                    <button onClick={() => fileInputRef.current.click()} className={`rounded-md ${theme.button} px-4 py-2 ${theme.text}`}>Choose File from Device</button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                    <p className={`mt-2 text-xs ${theme.subtleText}`}>For larger files, pasting a URL is recommended for better performance.</p>
                                </div>
                            )}
                            {activeTab === 'ai' && (
                                <div>
                                    <button onClick={handleAiGenerate} disabled={isGenerating} className="rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-wait disabled:bg-purple-400 flex items-center justify-center">
                                        {isGenerating ? (
                                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</>
                                        ) : `Generate Image for "${itemName || 'Item'}"`}
                                    </button>
                                    <p className={`mt-2 text-xs ${theme.subtleText}`}>Uses generative AI to create a unique image based on the item's name.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`mt-6 flex justify-end border-t ${theme.borderColor} pt-4`}>
                    <button onClick={handleSave} disabled={!preview || isGenerating} className="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-400">
                        Accept Image
                    </button>
                </div>
            </div>
        </div>
    );
};

// ===================================================================================
//  MAIN CONTROLLER COMPONENT
// ===================================================================================

/**
 * The main "Smart Image Modal" controller component. It orchestrates the child components.
 * @param {object} props - The component's props.
 */
const SmartImageModal = ({ itemName, currentImage, currentPosition, onImageAccept, theme, itemCategory, itemType }) => {
    // State to control whether the modal dialog is visible.
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* The visible part of the component on the form. */}
            <ImagePreview
                image={currentImage}
                position={currentPosition}
                onClick={() => setIsModalOpen(true)} // Clicking it opens the modal.
            />
            {/* The modal itself. It's only rendered when isModalOpen is true. */}
            <ImageUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)} // The modal can close itself.
                onImageAccept={onImageAccept} // Passes the save function down to the modal.
                itemName={itemName} // Passes the item name for context
                itemCategory={itemCategory} // Passes the item category for context
                itemType={itemType} // Passes the item type for context
                initialImage={currentImage}// Passes the current image to the modal
                initialPosition={currentPosition} // Passes the current image and position to the modal
                theme={theme} // Pass the current theme for consistent styling
            />
        </>
    );
};

/**
 * Asynchronous function to make a POST request to the Gemini API.
 * @param {string} prompt - The text prompt to send to the Gemini API.
 * @param {object|null} responseSchema - An optional schema to tell the API to return a structured JSON object.
 * @returns {Promise<string|object>} A promise that resolves to the text response from the API, or a parsed JSON object if a schema was provided.
 */
async function callGeminiAPI(prompt, responseSchema = null) {
    // Prepare the conversation history for the API. It starts with the user's prompt.
    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];

    // Retrieve the API key from environment variables for security. This prevents hardcoding sensitive keys in the source code.
    const apiKey = firebaseConfigExport.apiKey;

    // Construct the full URL for the specific Gemini API model endpoint.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Create the main payload (the data we send) for the API request.
    const payload = { contents: chatHistory };

    // If a `responseSchema` is provided, it means we want a structured JSON response.
    // This block adds the necessary configuration to the payload to enforce the JSON output format.
    if (responseSchema) {
        payload.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        };
    }

    // Use a try...catch block to handle potential network errors (e.g., user is offline) during the API call.
    try {
        // Make the actual network request to the Gemini API using the 'fetch' function.
        // It's a POST request, and we send the payload as a JSON string.
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Check if the API call was successful. `response.ok` is true for statuses like 200.
        if (!response.ok) {
            // If the response is not okay (e.g., 400 or 500 error), we parse the error details and log them.
            const errorBody = await response.json();
            console.error("Gemini API HTTP Error:", response.status, errorBody);
            // Return a user-friendly error message.
            return `API Error: Something went wrong (${response.status}).`;
        }

        // If the call was successful, parse the JSON data from the response body.
        const result = await response.json();

        // Navigate through the nested structure of the API response to find the generated text.
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            let textResult = result.candidates[0].content.parts[0].text;

            // If we were expecting a JSON object (because a schema was sent)...
            if (responseSchema) {
                try {
                    // First, try to parse the entire text as JSON. This is the ideal case.
                    return JSON.parse(textResult);
                } catch (jsonError) {
                    // If direct parsing fails, it might be because the API wrapped the JSON in a markdown code block (e.g., ```json{...}```).
                    // This regex looks for that pattern and extracts the JSON content from between the backticks.
                    const jsonMatch = textResult.match(/```(json)?\s*([\s\S]*?)\s*```/);
                    if (jsonMatch && jsonMatch[2]) {
                        try {
                            // If a match is found, try to parse the extracted content.
                            return JSON.parse(jsonMatch[2]);
                        } catch (nestedJsonError) {
                            // If even this fails, log the error and the text that failed to parse.
                            console.error("Failed to parse extracted JSON from Gemini API:", nestedJsonError, "Extracted text:", jsonMatch[2]);
                            return `Failed to parse structured response: ${nestedJsonError.message}. Raw: ${textResult.substring(0, 100)}...`;
                        }
                    }
                    // If no markdown block is found, log the original parsing error and the raw text.
                    console.error("Failed to parse JSON from Gemini API:", jsonError, "Raw text:", textResult);
                    return `Failed to parse structured response: ${jsonError.message}. Raw: ${textResult.substring(0, 100)}...`;
                }
            }
            // If no schema was provided, just return the plain text response.
            return textResult;
        } else {
            // Handle cases where the API call was successful but returned no content.
            console.error("Gemini API response was empty or unexpected:", result);
            return "The API returned an empty or unexpected response.";
        }
    } catch (error) {
        // This catches any network-level errors (e.g., failed to fetch).
        console.error("Error calling Gemini API:", error);
        return `An unexpected error occurred: ${error.message}.`;
    }
}

/**
 * Simulates fetching a list of Govee devices.
 */
async function fetchGoveeDevices(apiKey) {
    console.log(`Simulating Govee device fetch with API Key: ${apiKey}`);
    return new Promise(resolve => {
        setTimeout(() => {
            if (apiKey && apiKey.startsWith('TEST_KEY')) {
                resolve([
                    { device: 'AA:BB:CC:DD:EE:F1', model: 'H5075', deviceName: 'Office Humidor Sensor' },
                    { device: 'AA:BB:CC:DD:EE:F2', model: 'H5074', deviceName: 'Travel Case Sensor' },
                    { device: 'AA:BB:CC:DD:EE:F3', model: 'H5100', deviceName: 'Living Room Sensor' },
                ]);
            } else {
                resolve([]);
            }
        }, 1500);
    });
}

const BrowseByWrapperPanel = ({ cigars, navigate, theme, isCollapsed, onToggle }) => {
    // Calculate unique wrapper types and their counts
    const wrapperData = useMemo(() => {
        const counts = cigars.reduce((acc, cigar) => {
            const wrapper = cigar.wrapper || 'Unknown'; // Handle cigars without a wrapper defined
            acc[wrapper] = (acc[wrapper] || 0) + cigar.quantity;
            return acc;
        }, {});
        // Convert to an array of objects for easier mapping and sorting
        return Object.entries(counts)
            .map(([wrapper, quantity]) => ({ wrapper, quantity }))
            .sort((a, b) => a.wrapper.localeCompare(b.wrapper)); // Sort alphabetically by wrapper name
    }, [cigars]);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
                <h3 className="font-bold text-amber-300 text-lg flex items-center"><Leaf className="w-5 h-5 mr-2" /> Browse by Wrapper</h3>
                <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
            {!isCollapsed && (
                <div className="px-4 pb-4 space-y-2">
                    {wrapperData.length > 0 ? (
                        wrapperData.map(({ wrapper, quantity }) => (
                            <button
                                key={wrapper}
                                onClick={() => navigate('HumidorsScreen', { preFilterWrapper: wrapper })}
                                className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex justify-between items-center"
                            >
                                <span className="text-gray-300">{wrapper}</span>
                                <span className="text-gray-400">({quantity})</span>
                            </button>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No wrapper data available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const BrowseByStrengthPanel = ({ cigars, navigate, theme, isCollapsed, onToggle }) => {
    const strengthCategories = useMemo(() => [
        { label: 'Mellow Cigars', filterValue: 'Mild' },
        { label: 'Mellow to Medium Cigars', filterValue: 'Mild-Medium' },
        { label: 'Medium Cigars', filterValue: 'Medium' },
        { label: 'Medium to Full Cigars', filterValue: 'Medium-Full' },
        { label: 'Full Bodied Cigars', filterValue: 'Full' },
        { label: 'Flavored Cigars', filterValue: 'Flavored' } // Special filter for cigars with flavor notes
    ], []);

    const strengthData = useMemo(() => {
        const counts = strengthCategories.map(category => {
            let quantity = 0;
            if (category.filterValue === 'Flavored') {
                // Sum quantities of all cigars that have at least one flavor note
                quantity = cigars
                    .filter(cigar => cigar.flavorNotes && cigar.flavorNotes.length > 0)
                    .reduce((sum, cigar) => sum + cigar.quantity, 0);
            } else {
                // Sum quantities for a specific strength
                quantity = cigars
                    .filter(cigar => cigar.strength === category.filterValue)
                    .reduce((sum, cigar) => sum + cigar.quantity, 0);
            }
            return { label: category.label, quantity, filterValue: category.filterValue };
        });
        return counts.filter(item => item.quantity > 0); // Only show categories with cigars
    }, [cigars, strengthCategories]);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
                <h3 className="font-bold text-amber-300 text-lg flex items-center"><Cigarette className="w-5 h-5 mr-2" /> Browse by Profile</h3>
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

const BrowseByCountryPanel = ({ cigars, navigate, theme, isCollapsed, onToggle }) => {
    const countryCategories = useMemo(() => [
        { label: 'Dominican Cigars', filterValue: 'Dominican Republic' },
        { label: 'Nicaraguan Cigars', filterValue: 'Nicaragua' },
        { label: 'Honduran Cigars', filterValue: 'Honduras' },
        { label: 'American Cigars', filterValue: 'USA' },
        { label: 'Cuban Cigars', filterValue: 'Cuba' },
        { label: 'Other Countries', filterValue: 'Other' }, // Catch-all for unlisted countries
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
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
                <h3 className="font-bold text-amber-300 text-lg flex items-center"><MapPin className="w-5 h-5 mr-2" /> Browse by Country of Origin</h3>
                <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
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

const LiveEnvironmentPanel = ({ humidors, theme }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const firstHumidor = humidors[0];
    const displayTemp = firstHumidor ? firstHumidor.temp : 0;
    const displayHumidity = firstHumidor ? firstHumidor.humidity : 0;

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full p-4 flex justify-between items-center">
                <h3 className="font-bold text-amber-300 text-lg flex items-center"><Thermometer className="w-5 h-5 mr-2" /> Live Environment</h3>
                <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
            {!isCollapsed && (
                <div className="px-4 pb-4">
                    <div className="flex justify-around items-center h-full py-4">
                        <Gauge value={displayHumidity} maxValue={100} label="Humidity" unit="%" icon={Droplets} />
                        <Gauge value={displayTemp} maxValue={100} label="Temperature" unit="°F" icon={Thermometer} />
                    </div>
                </div>
            )}
        </div>
    );
};

const InventoryAnalysisPanel = ({ cigars, theme, isCollapsed, onToggle }) => {
    const [chartViews, setChartViews] = useState({ brands: 'bar', countries: 'bar', strength: 'bar' });

    const { topBrandsData, topCountriesData, strengthDistributionData } = useMemo(() => {
        const processChartData = (data, key) => {
            const groupedData = data.reduce((acc, cigar) => {
                const groupKey = cigar[key] || 'Unknown';
                acc[groupKey] = (acc[groupKey] || 0) + cigar.quantity;
                return acc;
            }, {});

            return Object.keys(groupedData)
                .map(name => ({ name, quantity: groupedData[name] }))
                .sort((a, b) => b.quantity - a.quantity);
        };

        const topBrands = processChartData(cigars, 'brand').slice(0, 5);
        const topCountries = processChartData(cigars, 'country').slice(0, 5);
        const strengthDistribution = processChartData(cigars, 'strength');

        return {
            topBrandsData: topBrands,
            topCountriesData: topCountries,
            strengthDistributionData: strengthDistribution,
        };
    }, [cigars]);

    const handleChartViewToggle = (chartName) => {
        setChartViews(prev => ({
            ...prev,
            [chartName]: prev[chartName] === 'bar' ? 'pie' : 'bar'
        }));
    };

    const PIE_COLORS = ['#f59e0b', '#3b82f6', '#84cc16', '#ef4444', '#a855f7'];

    // Custom label renderer for Pie Charts
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, ...props }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 15; // Position label outside the pie
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text {...props} x={x} y={y} fill="#d1d5db" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                {`${name} (${(percent * 100).toFixed(0)}%)`}
            </text>
        );
    };

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
                <h3 className="font-bold text-amber-300 text-lg flex items-center"><BarChart2 className="w-5 h-5 mr-2" /> Inventory Analysis</h3>
                <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
            {!isCollapsed && (
                <div className="p-4 space-y-6">
                    <ChartCard
                        title="Top 5 Brands"
                        action={<button onClick={() => handleChartViewToggle('brands')} className={`p-1 rounded-full ${theme.button}`}>{chartViews.brands === 'bar' ? <PieChartIcon className="w-5 h-5" /> : <BarChart2 className="w-5 h-5" />}</button>}>
                        {chartViews.brands === 'bar' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topBrandsData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#d1d5db' }} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                                    <Bar dataKey="quantity" fill="#f59e0b" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={topBrandsData} dataKey="quantity" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={true} label={renderCustomizedLabel}>
                                        {topBrandsData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Top 5 Countries"
                        action={<button onClick={() => handleChartViewToggle('countries')} className={`p-1 rounded-full ${theme.button}`}>{chartViews.countries === 'bar' ? <PieChartIcon className="w-5 h-5" /> : <BarChart2 className="w-5 h-5" />}</button>}>
                        {chartViews.countries === 'bar' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topCountriesData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#d1d5db' }} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                                    <Bar dataKey="quantity" fill="#3b82f6" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={topCountriesData} dataKey="quantity" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={true} label={renderCustomizedLabel}>
                                        {topCountriesData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    <ChartCard
                        title="Strength Distribution"
                        action={<button onClick={() => handleChartViewToggle('strength')} className={`p-1 rounded-full ${theme.button}`}>{chartViews.strength === 'bar' ? <PieChartIcon className="w-5 h-5" /> : <BarChart2 className="w-5 h-5" />}</button>}>
                        {chartViews.strength === 'bar' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={strengthDistributionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <XAxis dataKey="name" tick={{ fill: '#d1d5db' }} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                                    <YAxis tick={{ fill: '#d1d5db' }} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                                    <Bar dataKey="quantity" fill="#84cc16" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={strengthDistributionData} dataKey="quantity" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={true} label={renderCustomizedLabel}>
                                        {strengthDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>
                </div>
            )}
        </div>
    );
};

const MyCollectionStatsCards = ({ totalCigars, totalValue, humidors, theme }) => {
    return (
        <div id="my-collection-stats" className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <StatCard title="Total Cigars" value={totalCigars} theme={theme} />
            <StatCard title="Est. Value" value={`$${totalValue.toFixed(2)}`} theme={theme} />
            <StatCard title="Humidors" value={humidors.length} theme={theme} />
        </div>
    );
};

const Dashboard = ({ navigate, cigars, humidors, theme, showWrapperPanel, showStrengthPanel, showCountryPanel, showLiveEnvironment, showInventoryAnalysis, panelStates, setPanelStates }) => {
    const [roxyTip, setRoxyTip] = useState('');
    const [modalState, setModalState] = useState({ isOpen: false, content: '', isLoading: false });

    useEffect(() => {
        // Pick a random tip from Roxy's corner on component mount.
        setRoxyTip(roxysTips[Math.floor(Math.random() * roxysTips.length)]);
    }, []);

    // Memoized calculation for chart data and statistics.
    const { totalValue, totalCigars } = useMemo(() => {
        const value = cigars.reduce((acc, cigar) => acc + (cigar.price * cigar.quantity), 0);
        const count = cigars.reduce((sum, c) => sum + c.quantity, 0);

        return {
            totalValue: value,
            totalCigars: count
        };
    }, [cigars]);

    // Function to call Gemini API for a collection summary.
    const handleSummarizeCollection = async () => {
        setModalState({ isOpen: true, content: '', isLoading: true });
        const inventorySummary = cigars.map(c => `${c.quantity}x ${c.brand} ${c.name} (${c.strength}, from ${c.country})`).join('\n');
        const prompt = `You are an expert tobacconist. I am providing you with my current cigar inventory. Please provide a brief, narrative summary of my collection's character. What are the dominant trends in terms of strength, brand, and country of origin? What does my collection say about my tasting preferences? My inventory is:\n\n${inventorySummary}`;

        const result = await callGeminiAPI(prompt);
        setModalState({ isOpen: true, content: result, isLoading: false });
    };

    // Generic toggle handler for all panels
    const handlePanelToggle = (panelName) => {
        setPanelStates(prev => ({ ...prev, [panelName]: !prev[panelName] }));
    };

    // Determine if humidors are present
    const hasHumidors = humidors && humidors.length > 0;
    // Determine if cigars are present
    const hasCigars = cigars && cigars.length > 0;

    return (
        <div className="p-4 pb-24">
            {modalState.isOpen && <GeminiModal title="Collection Summary" content={modalState.content} isLoading={modalState.isLoading} onClose={() => setModalState({ isOpen: false, content: '', isLoading: false })} />}
            <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>Dashboard</h1>
            <p className={`${theme.subtleText} mb-6`}>Your collection's live overview.</p>

            {hasHumidors && (
                <MyCollectionStatsCards
                    totalCigars={totalCigars}
                    totalValue={totalValue}
                    humidors={humidors}
                    theme={theme}
                />
            )}

            {/* New: Roxy's Tips panel when no humidors are present */}
            {!hasHumidors && (
                <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-4 mb-6 text-center">
                    <h3 className="font-bold text-amber-300 text-lg flex items-center justify-center mb-3">
                        <Wind className="w-5 h-5 mr-2" /> Roxy's Tips!
                    </h3>
                    <p className="text-amber-200 text-sm mb-4">
                        Looks like your humidor collection is empty! Add your first humidor and some cigars to get insightful analytics on your dashboard.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => navigate('AddHumidor')}
                            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-2 rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Humidor
                        </button>
                        {/* Disable Add Cigar if no humidors exist to put them in */}
                        <button
                            disabled={true}
                            title="Add a humidor first to add cigars"
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-gray-500 font-bold py-2 rounded-lg cursor-not-allowed"
                        >
                            <Cigarette className="w-4 h-4" /> Add Cigar
                        </button>
                    </div>
                </div>
            )}


            <div className="space-y-6">
                {/* Existing Roxy's Corner panel */}
                {/* TODO Refactor into a component named "RoxysCorner" */}
                <div className="bg-amber-900/20 border border-amber-800 rounded-xl overflow-hidden">
                    <button onClick={() => handlePanelToggle('roxy')} className="w-full p-4 flex justify-between items-center">
                        <h3 className="font-bold text-amber-300 text-lg flex items-center"><Wind className="w-5 h-5 mr-2" /> Roxy's Corner</h3>
                        <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${!panelStates.roxy ? 'rotate-180' : ''}`} />
                    </button>
                    {!panelStates.roxy && (
                        <div className="px-4 pb-4">
                            {/* New: Friendly message when humidors exist but no cigars */}
                            {hasHumidors && !hasCigars ? (
                                <div className="text-amber-200 text-sm mb-4">
                                    <p className="mb-3">Woof! Your humidors are looking a bit empty. Add some cigars or move them here to get personalized insights and organize your collection!</p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            // Pass the ID of the first humidor if available, otherwise null.
                                            // The AddCigar screen should handle the case of no humidor selected.
                                            onClick={() => navigate('AddCigar', { humidorId: humidors.length > 0 ? humidors[0].id : null })}
                                            className="flex-1 flex items-center justify-center gap-2 bg-amber-500/20 border border-amber-500 text-amber-300 font-bold py-2 rounded-lg hover:bg-amber-500/30 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Add Cigar
                                        </button>
                                        <button
                                            onClick={() => navigate('HumidorsScreen')}
                                            className="flex-1 flex items-center justify-center gap-2 bg-sky-500/20 border border-sky-500 text-sky-300 font-bold py-2 rounded-lg hover:bg-sky-500/30 transition-colors"
                                        >
                                            <Move className="w-4 h-4" /> Manage & Move
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-amber-200 text-sm">{roxyTip}</p>
                                    {/* Conditionally render "Ask Roxy for a Summary" if there are cigars */}
                                    {hasCigars && (
                                        <button onClick={handleSummarizeCollection} className="mt-4 w-full flex items-center justify-center bg-purple-600/20 border border-purple-500 text-purple-300 font-bold py-2 rounded-lg hover:bg-purple-600/30 transition-colors">
                                            <Sparkles className="w-5 h-5 mr-2" /> Ask Roxy for a Summary
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Conditionally render LiveEnvironmentPanel if there are humidors and it's enabled in settings */}
                {hasHumidors && showLiveEnvironment && <LiveEnvironmentPanel humidors={humidors} theme={theme} isCollapsed={panelStates.liveEnvironment} onToggle={() => handlePanelToggle('liveEnvironment')} />}
                {/* Conditionally render InventoryAnalysisPanel if there are cigars and it's enabled in settings */}
                {hasCigars && showInventoryAnalysis && <InventoryAnalysisPanel cigars={cigars} theme={theme} isCollapsed={panelStates.inventoryAnalysis} onToggle={() => handlePanelToggle('inventoryAnalysis')} />}
                {/* Conditionally render BrowseByWrapperPanel if there are cigars and it's enabled in settings */}
                {hasCigars && showWrapperPanel && <BrowseByWrapperPanel cigars={cigars} navigate={navigate} theme={theme} isCollapsed={panelStates.wrapper} onToggle={() => handlePanelToggle('wrapper')} />}
                {/* Conditionally render BrowseByStrengthPanel if there are cigars and it's enabled in settings */}
                {hasCigars && showStrengthPanel && <BrowseByStrengthPanel cigars={cigars} navigate={navigate} theme={theme} isCollapsed={panelStates.strength} onToggle={() => handlePanelToggle('strength')} />}
                {/* Conditionally render BrowseByCountryPanel if there are cigars and it's enabled in settings */}
                {hasCigars && showCountryPanel && <BrowseByCountryPanel cigars={cigars} navigate={navigate} theme={theme} isCollapsed={panelStates.country} onToggle={() => handlePanelToggle('country')} />}
            </div>
        </div>
    );
};

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

    // NEW: Effect to update activeCountryFilter when preFilterCountry prop changes - July 5, 2025 - 2:00:00 AM CDT
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
            const allSuggestions = cigars.map(c => c.brand).concat(cigars.map(c => c.name)).filter(name => name.toLowerCase().includes(query.toLowerCase()));
            const uniqueSuggestions = [...new Set(allSuggestions)];
            setSuggestions(uniqueSuggestions.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setSuggestions([]);
    };

    // Memoized filtered cigars, now including wrapper, strength, and country filters - July 5, 2025 - 2:00:00 AM CDT
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
                    className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
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
                <div className="flex justify-between items-center mb-4">
                    <span>Filtering by: <span className="font-bold">{activeWrapperFilter} Wrapper</span></span>
                    <button onClick={handleClearFilter} className="p-1 rounded-full hover:bg-amber-800 transition-colors"><X className="w-4 h-4" /></button>
                </div>
            )}

            {activeStrengthFilter && (
                <div className="flex justify-between items-center mb-4">
                    <span>Filtering by: <span className="font-bold">{activeStrengthFilter === 'Flavored' ? 'Flavored Cigars' : `${activeStrengthFilter} Strength`}</span></span>
                    <button onClick={handleClearFilter} className="p-1 rounded-full hover:bg-amber-800 transition-colors"><X className="w-4 h-4" /></button>
                </div>
            )}

            {activeCountryFilter && (
                <div className="flex justify-between items-center mb-4">
                    <span>Filtering by: <span className="font-bold">{activeCountryFilter === 'Other' ? 'Other Countries' : `${activeCountryFilter}`}</span></span>
                    <button onClick={handleClearFilter} className="p-1 rounded-full hover:bg-amber-800 transition-colors"><X className="w-4 h-4" /></button>
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
                    <p className="text-sm text-gray-400 px-2">Found {filteredCigars.length} matching cigars.</p>
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
                        onImport={() => setIsExportModalOpen(false) || navigate('DataSync', { openImportModal: true, importHumidorId: humidor.id })}
                        onExport={() => setIsExportModalOpen(true)}
                        onDelete={() => setIsDeleteHumidorModalOpen(true)}
                    />
                </div>
                <div className="absolute bottom-0 p-4">
                    <h1 className="text-3xl font-bold text-white">{humidor.name}</h1>
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

                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Search this humidor..." value={searchQuery} onChange={handleSearchChange} className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-b-xl mt-1 z-20 overflow-hidden">
                            {suggestions.map(suggestion => (<div key={suggestion} onMouseDown={() => handleSuggestionClick(suggestion)} className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors cursor-pointer">{suggestion}</div>))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mb-6 px-2">
                    <div>
                        <p className="text-sm text-gray-300"><span className="font-bold text-white">{filteredAndSortedCigars.length}</span> Unique</p>
                        <p className="text-xs text-gray-400"><span className="font-bold text-gray-200">{totalQuantity}</span> Total Cigars</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsFilterSortModalOpen(true)} className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"><Filter className="w-5 h-5" /></button>
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
                        onClick={() => navigate('AddCigar', { humidorId: humidor.id })}
                        className="fixed bottom-24 right-4 bg-amber-500 text-white p-4 rounded-full shadow-lg hover:bg-amber-600 transition-colors z-20"
                        aria-label="Add Cigar"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                )}

                {isSelectMode && (
                    <div className="fixed bottom-20 left-0 right-0 bg-gray-900/80 backdrop-blur-sm p-4 z-20 border-t border-gray-700">
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

const CigarDetail = ({ cigar, navigate, db, appId, userId }) => {
    const [modalState, setModalState] = useState({ isOpen: false, type: null, content: '', isLoading: false });
    const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isRoxyOpen, setIsRoxyOpen] = useState(false);
    const [showSmokeConfirmation, setShowSmokeConfirmation] = useState(false);

    const handleSmokeCigar = async () => {
        if (cigar.quantity > 0) {
            const newQuantity = cigar.quantity - 1;
            const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigar.id);
            await updateDoc(cigarRef, { quantity: newQuantity });
            setShowSmokeConfirmation(true); // Show confirmation message
            setTimeout(() => setShowSmokeConfirmation(false), 3000); // Hide after 3 seconds
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


                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <button onClick={() => navigate('MyHumidor', { humidorId: cigar.humidorId })} className="p-2 bg-black/50 rounded-full text-white"><ChevronLeft className="w-7 h-7" /></button>
                </div>

                {/* Rating Badge and Title moved to bottom */}
                <div className="absolute bottom-0 p-4 w-full flex justify-between items-end">
                    <div>
                        <p className="text-gray-300 text-sm font-semibold uppercase">{cigar.brand}</p>
                        <h1 className="text-3xl font-bold text-white">{cigar.name}</h1>
                    </div>
                    <RatingBadge rating={cigar.rating} />
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Simplified Action Bar */}
                <button onClick={handleSmokeCigar} disabled={cigar.quantity === 0} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <Cigarette className="w-5 h-5" /> Smoke This ({cigar.quantity} in stock)
                </button>
                {showSmokeConfirmation && (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                        <Check className="w-5 h-5" />
                        <span>Enjoy your smoke!</span>
                    </div>
                )}

                {/* Updated Cigar Profile Panel */}
                <div className="bg-gray-800/50 p-4 rounded-xl space-y-4">

                    <div className="flex justify-between items-center">
                        {/* Panel Title */}
                        <h3 className="font-bold text-amber-300 text-lg">Cigar Profile</h3>

                        {/* Action Buttons */}
                        <div id="action-buttons" className="flex items-center gap-2">
                            <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-white hover:text-red-500 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => setIsExportModalOpen(true)} className="p-2 text-white hover:text-green-400 transition-colors">
                                <UploadCloud className="w-5 h-5" />
                            </button>
                            <button onClick={() => navigate('EditCigar', { cigarId: cigar.id })} className="p-2 text-white hover:text-amber-400 transition-colors">
                                <Edit className="w-5 h-5" />
                            </button>
                        </div>
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
                    label="Live Environment"
                    isChecked={dashboardPanelVisibility.showLiveEnvironment}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showLiveEnvironment: !prev.showLiveEnvironment }))}
                />
                <ToggleSwitch
                    label="Inventory Analysis"
                    isChecked={dashboardPanelVisibility.showInventoryAnalysis}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showInventoryAnalysis: !prev.showInventoryAnalysis }))}
                />                <ToggleSwitch
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
            </div>
        </div>
    );
};

const FontsScreen = ({ navigate, selectedFont, setSelectedFont, theme }) => {
    // Font Picker UI
    const FontPicker = () => (
        <div id="font-picker" className="mb-4">
            <label className={`block text-sm font-bold mb-2 ${theme.text}`}>Font Style</label>
            <select
                value={selectedFont.label}
                onChange={e => {
                    const font = fontOptions.find(f => f.label === e.target.value);
                    setSelectedFont(font);
                }}
                className={`w-full p-2 rounded border ${theme.inputBg} ${theme.text} ${theme.borderColor}`}
            >
                {fontOptions.map(font => (
                    <option key={font.label} value={font.label}>
                        {font.label}
                    </option>
                ))}
            </select>
            <div className="mt-2">
                <span
                    style={{
                        fontFamily: selectedFont.heading,
                        fontWeight: 700,
                        fontSize: 18,
                        color: theme.text === 'text-white' ? '#fff' : undefined
                    }}
                >
                    Heading Example
                </span>
                <br />
                <span className={`text-xs ${theme.subtleText}`} style={{ fontFamily: selectedFont.body, color: theme.text === 'text-white' ? '#fff' : undefined }}>
                    Body text example for preview.
                </span>
            </div>
        </div>
    );

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className={`w-7 h-7 ${theme.text}`} />
                </button>
                <h1 className="text-3xl font-bold text-white">Fonts</h1>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
                <FontPicker />
            </div>
            <p className="mt-6 text-gray-400 text-sm">
                Choose your preferred font combination for the app. This will change the look and feel of all text throughout Humidor Hub.
            </p>
        </div>
    );
};

const SettingsScreen = ({ navigate, theme, setTheme, dashboardPanelVisibility, setDashboardPanelVisibility, selectedFont, setSelectedFont }) => {
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

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
            <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
            <div className="space-y-4">
                <SettingItem icon={User} title="Profile" subtitle="Manage your account details" onClick={() => navigate('Profile')} />
                <SettingItem icon={LayoutGrid} title="Dashboard Components" subtitle="Customize what appears on your dashboard" onClick={() => navigate('DashboardSettings')} />
                <SettingItem icon={Bell} title="Notifications" subtitle="Set up alerts for humidity and temp" onClick={() => navigate('Notifications')} />
                <SettingItem icon={Zap} title="Integrations" subtitle="Connect to Govee and other services" onClick={() => navigate('Integrations')} />
                <SettingItem icon={Database} title="Data & Sync" subtitle="Export or import your collection" onClick={() => navigate('DataSync')} />
                <SettingItem icon={BarChart2} title="Deeper Statistics & Insights" subtitle="Explore advanced stats about your collection" onClick={() => navigate('DeeperStatistics')} />
                <SettingItem icon={Palette} title="Theme" subtitle={`Current: ${theme.name}`} onClick={() => setIsThemeModalOpen(true)} />
                <SettingItem icon={Info} title="Fonts" subtitle="Choose your preferred font combination" onClick={() => navigate('Fonts')} disabled={true} />
                <SettingItem icon={Info} title="About Humidor Hub" subtitle="Version 1.1.0" onClick={() => navigate('About')} />
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

const AboutScreen = ({ navigate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', text: '' });
    const privacyPolicyText = "Your data is stored securely in your private Firestore database and is not shared. We respect your privacy.\n\nEffective Date: July 4, 2025";
    const termsOfServiceText = "By using Humidor Hub, you agree to track your cigars responsibly. This app is for informational purposes only. Enjoy your collection!\n\nLast Updated: July 4, 2025";

    const showModal = (type) => {
        setModalContent({ title: type === 'privacy' ? 'Privacy Policy' : 'Terms of Service', text: type === 'privacy' ? privacyPolicyText : termsOfServiceText });
        setIsModalOpen(true);
    };

    return (
        <div className="p-4 pb-24">
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-amber-400">{modalContent.title}</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X /></button></div>
                        <p className="text-gray-300 whitespace-pre-wrap">{modalContent.text}</p>
                    </div>
                </div>
            )}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className="w-7 h-7 text-white" /></button>
                <h1 className="text-3xl font-bold text-white">About Humidor Hub</h1>
            </div>
            <div className="space-y-6 bg-gray-800/50 p-6 rounded-xl">
                <div className="flex flex-col items-center">
                    <Box className="w-16 h-16 text-amber-400 mb-4" />
                    <h2 className="text-2xl font-bold text-white">Humidor Hub</h2>
                    <p className="text-gray-400">Version 1.1.0</p>
                </div>
                <p className="text-gray-300 text-center">Your personal assistant for managing and enjoying your cigar collection.</p>
                <div className="border-t border-gray-700 pt-4 space-y-2 text-center">
                    <p className="text-sm text-gray-400">Developed with passion for aficionados.</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => showModal('privacy')} className="text-amber-400 hover:underline text-sm">Privacy Policy</button>
                        <button onClick={() => showModal('terms')} className="text-amber-400 hover:underline text-sm">Terms of Service</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * ImportCsvModal component handles both cigar and humidor imports.
 */
const ImportCsvModal = ({ dataType, data, db, appId, userId, onClose, humidors, navigate, onSwitchType }) => {
    const [step, setStep] = useState('selectFile');
    const [selectedHumidor, setSelectedHumidor] = useState(humidors[0]?.id || '');
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [csvRows, setCsvRows] = useState([]);
    const [fileName, setFileName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [fieldMapping, setFieldMapping] = useState({});
    const [importedCount, setImportedCount] = useState(0);

    const fileInputRef = React.useRef(null);

    // Determine which set of fields to use based on dataType
    const currentAppFields = dataType === 'cigar' ? APP_FIELDS : APP_HUMIDOR_FIELDS;
    const collectionName = dataType === 'cigar' ? 'cigars' : 'humidors';

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setFileName(file.name);
        setIsProcessing(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (!results.data.length || !results.meta.fields) {
                    alert("CSV file appears to be empty or invalid.");
                    setIsProcessing(false);
                    return;
                }

                const headers = results.meta.fields;
                const rows = results.data.map(row => headers.map(header => row[header]));

                setCsvHeaders(headers);
                setCsvRows(rows);

                const initialMapping = {};
                currentAppFields.forEach(appField => {
                    const matchedHeader = headers.find(header => header.toLowerCase().replace(/[\s_]/g, '') === appField.label.toLowerCase().replace(/[\s_]/g, ''));
                    if (matchedHeader) {
                        initialMapping[appField.key] = matchedHeader;
                    } else {
                        initialMapping[appField.key] = 'none';
                    }
                });
                setFieldMapping(initialMapping);

                setStep('mapFields');
                setIsProcessing(false);
            },
            error: (error) => {
                alert(`Error parsing CSV file: ${error.message}`);
                setIsProcessing(false);
            }
        });
    };

    const handleMappingChange = (appFieldKey, csvHeader) => {
        setFieldMapping(prev => ({ ...prev, [appFieldKey]: csvHeader }));
    };

    const handleImport = async () => {
        setStep('importing');
        const batch = writeBatch(db);
        const targetCollectionRef = collection(db, 'artifacts', appId, 'users', userId, collectionName);
        let count = 0;

        csvRows.forEach(row => {
            const newItem = {
                // Add humidorId for cigars, but not for humidors themselves
                ...(dataType === 'cigar' && { humidorId: selectedHumidor }),
                // Initialize arrays for certain fields
                ...(dataType === 'cigar' && { flavorNotes: [] }),
                // Default quantity for cigars
                ...(dataType === 'cigar' && { quantity: 1 }),
                // Default dateAdded to now if not provided
                ...(dataType === 'cigar' && { dateAdded: new Date().toISOString() }),
                // Default temp/humidity for humidors if not provided
                ...(dataType === 'humidor' && { temp: 70, humidity: 70 }),
            };

            currentAppFields.forEach(appField => {
                const mappedHeader = fieldMapping[appField.key];
                if (mappedHeader && mappedHeader !== 'none') {
                    const headerIndex = csvHeaders.indexOf(mappedHeader);
                    if (headerIndex === -1) return;

                    let value = row[headerIndex]?.trim();

                    if (appField.type === 'number') {
                        newItem[appField.key] = parseFloat(value) || 0;
                    } else if (appField.type === 'boolean') {
                        newItem[appField.key] = value?.toLowerCase() === 'true' || value === '1';
                    } else if (appField.type === 'array') {
                        newItem[appField.key] = value ? value.split(';').map(s => s.trim()).filter(Boolean) : [];
                    } else if (appField.type === 'date') {
                        const date = new Date(value);
                        if (value && !isNaN(date)) {
                            newItem[appField.key] = date.toISOString();
                        }
                        // If value is invalid or missing, the default from above is used.
                    } else {
                        newItem[appField.key] = value;
                    }
                }
            });

            // Ensure required fields are present before adding
            const isValidItem = currentAppFields.every(field => {
                if (field.required) {
                    return newItem[field.key] !== undefined && newItem[field.key] !== null && newItem[field.key] !== '';
                }
                return true;
            });

            if (isValidItem) {
                const itemRef = doc(targetCollectionRef); // Firestore will generate a new ID
                batch.set(itemRef, newItem);
                count++;
            } else {
                console.warn(`Skipping row due to missing required fields for ${dataType}:`, row);
            }
        });

        try {
            await batch.commit();
            setImportedCount(count);
            setStep('complete');
        } catch (error) {
            console.error("Error during batch import:", error);
            // Use a custom message box instead of alert()
            alert(`Import failed: ${error.message}. Check console for details.`);
            setStep('selectFile'); // Go back to file selection on error
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setStep('selectFile');
        setCsvHeaders([]);
        setCsvRows([]);
        setFileName('');
        setFieldMapping({});
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSwitchType = (newType) => {
        onSwitchType(newType); // Notify parent to change the data type
        handleReset(); // Reset the modal state for the new import
    };

    const isMappingValid = useMemo(() => {
        const requiredFields = currentAppFields.filter(f => f.required);
        return requiredFields.every(f => fieldMapping[f.key] && fieldMapping[f.key] !== 'none');
    }, [fieldMapping, currentAppFields]);

    const renderContent = () => {
        switch (step) {
            case 'selectFile':
                return (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-amber-400 flex items-center"><UploadCloud className="w-5 h-5 mr-2" /> Import {dataType === 'cigar' ? 'Cigars' : 'Humidors'} from CSV</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                        </div>
                        <div className="space-y-4">
                            {dataType === 'cigar' && (
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-1 block">1. Select Destination Humidor</label>
                                    <select value={selectedHumidor} onChange={(e) => setSelectedHumidor(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                                        {humidors.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-1 block">{dataType === 'cigar' ? '2' : '1'}. Choose CSV File</label>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".csv" />
                                <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                    {isProcessing ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                    {fileName || 'Choose CSV File'}
                                </button>
                            </div>
                        </div>
                    </>
                );
            case 'mapFields':
                return (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-amber-400">Map CSV Fields</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">Match your CSV columns to the app's fields. Required fields are marked with *.</p>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {currentAppFields.map(appField => (
                                <div key={appField.key} className="grid grid-cols-2 gap-4 items-center">
                                    <label className="text-sm font-medium text-gray-200 text-right">{appField.label}{appField.required && '*'}</label>
                                    <select value={fieldMapping[appField.key] || 'none'} onChange={(e) => handleMappingChange(appField.key, e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                                        <option value="none">-- Do not import --</option>
                                        {csvHeaders.map(header => <option key={header} value={header}>{header}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between gap-3 pt-4 mt-4 border-t border-gray-700">
                            <button onClick={handleReset} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Back</button>
                            <button onClick={handleImport} disabled={!isMappingValid} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                                Import
                            </button>
                        </div>
                    </>
                );
            case 'importing':
                return (
                    <div className="flex flex-col items-center justify-center h-48">
                        <LoaderCircle className="w-12 h-12 text-amber-500 animate-spin" />
                        <p className="mt-4 text-gray-300">Importing your {dataType === 'cigar' ? 'cigars' : 'humidors'}...</p>
                    </div>
                );
            case 'complete':
                return (
                    <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-6 text-center">
                        <h3 className="font-bold text-amber-300 text-xl flex items-center justify-center mb-3">
                            <Wind className="w-5 h-5 mr-2" /> Import Complete!
                        </h3>
                        <p className="text-amber-200 text-sm mb-6">
                            Woof! Successfully imported {importedCount} {dataType === 'cigar' ? 'cigars' : 'humidors'}.
                            <br />
                            What would you like to do next?
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleSwitchType('cigar')}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <UploadCloud className="w-5 h-5" /> Import More Cigars
                            </button>
                            <button
                                onClick={() => handleSwitchType('humidor')}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <UploadCloud className="w-5 h-5" /> Import More Humidors
                            </button>
                            <button
                                onClick={() => {
                                    if (dataType === 'cigar' && selectedHumidor) {
                                        navigate('MyHumidor', { humidorId: selectedHumidor });
                                    } else if (dataType === 'humidor') {
                                        navigate('HumidorsScreen');
                                    }
                                    onClose();
                                }}
                                className="w-full bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors"
                            >
                                Finish & Close
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={step !== 'importing' ? onClose : undefined}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                {renderContent()}
            </div>
        </div>
    );
};

/**
 * ExportModal component handles both cigar and humidor exports.
 */
const ExportModal = ({ data, dataType, onClose }) => {
    const getHeaders = () => {
        if (dataType === 'cigar') {
            return ['id,name,brand,line,shape,isBoxPress,length_inches,ring_gauge,Size,Country of Origin,wrapper,binder,filler,strength,flavorNotes,rating,userRating,price,quantity,image,shortDescription,description,dateAdded'];
        } else if (dataType === 'humidor') {
            return ['id,name,shortDescription,longDescription,size,location,image,type,temp,humidity,goveeDeviceId,goveeDeviceModel'];
        }
        return [];
    };

    const formatDataForCsv = () => {
        const headers = getHeaders();
        const csvRows = data.reduce((acc, item) => {
            if (dataType === 'cigar') {
                const {
                    id, name, brand, line = '', shape, isBoxPress = false, length_inches = 0, ring_gauge = 0,
                    size, country, wrapper, binder, filler, strength, flavorNotes, rating, userRating = 0,
                    quantity, price, image = '', shortDescription = '', description = '', dateAdded
                } = item;
                acc.push([
                    id, name, brand, line, shape, isBoxPress ? 'TRUE' : 'FALSE', length_inches, ring_gauge,
                    size, country, wrapper, binder, filler, strength, `"${(flavorNotes || []).join(';')}"`,
                    rating, userRating, price, quantity, image, `"${shortDescription}"`, `"${description}"`, dateAdded
                ].map(field => `"${String(field ?? '').replace(/"/g, '""')}"`).join(',')); // Escape double quotes
            } else if (dataType === 'humidor') {
                const {
                    id, name, shortDescription = '', longDescription = '', size = '', location = '',
                    image = '', type = '', temp = 0, humidity = 0, goveeDeviceId = '', goveeDeviceModel = ''
                } = item;
                acc.push([
                    id, name, shortDescription, longDescription, size, location, image, type, temp, humidity,
                    goveeDeviceId, goveeDeviceModel
                ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')); // Escape double quotes
            }
            return acc;
        }, []);
        return [...headers, ...csvRows].join('\n');
    };

    const exportToCsv = () => {
        downloadFile({
            data: formatDataForCsv(),
            fileName: `humidor_hub_${dataType}s_export.csv`,
            fileType: 'text/csv',
        });
        onClose();
    };

    const exportToJson = () => {
        downloadFile({
            data: JSON.stringify(data, null, 2),
            fileName: `humidor_hub_${dataType}s_export.json`,
            fileType: 'application/json',
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><Download className="w-5 h-5 mr-2" /> Export {dataType === 'cigar' ? 'Cigars' : 'Humidors'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">Choose a format to download your {dataType} collection.</p>
                    <button onClick={exportToCsv} className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">Export as CSV</button>
                    <button onClick={exportToJson} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">Export as JSON</button>
                </div>
            </div>
        </div>
    );
};

const APP_HUMIDOR_FIELDS = [
    { key: 'name', label: 'Humidor Name', required: true },
    { key: 'shortDescription', label: 'Short Description', required: false },
    { key: 'longDescription', label: 'Long Description', required: false },
    { key: 'size', label: 'Size', required: false },
    { key: 'location', label: 'Location', required: false },
    { key: 'image', label: 'Image URL', required: false },
    { key: 'type', label: 'Type', required: false },
    { key: 'temp', label: 'Temperature', required: false, type: 'number' },
    { key: 'humidity', label: 'Humidity', required: false, type: 'number' },
    { key: 'goveeDeviceId', label: 'Govee Device ID', required: false },
    { key: 'goveeDeviceModel', label: 'Govee Device Model', required: false },
];

const APP_FIELDS = [
    { key: 'name', label: 'Cigar Name', required: true },
    { key: 'brand', label: 'Brand', required: true },
    { key: 'line', label: 'Product Line', required: false },
    { key: 'shape', label: 'Shape', required: false },
    { key: 'isBoxPress', label: 'Is Box Pressed', required: false, type: 'boolean' },
    { key: 'length_inches', label: 'Length (in)', required: false, type: 'number' },
    { key: 'ring_gauge', label: 'Ring Gauge', required: false, type: 'number' },
    { key: 'size', label: 'Size (e.g., 5.5x50)', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'wrapper', label: 'Wrapper', required: false },
    { key: 'binder', label: 'Binder', required: false },
    { key: 'filler', label: 'Filler', required: false },
    { key: 'strength', label: 'Strength', required: false },
    { key: 'flavorNotes', label: 'Flavor Notes (semicolon-separated)', required: false, type: 'array' },
    { key: 'rating', label: 'Rating (Official)', required: false, type: 'number' },
    { key: 'userRating', label: 'My Rating', required: false, type: 'number' },
    { key: 'price', label: 'Price', required: false, type: 'number' },
    { key: 'quantity', label: 'Quantity', required: true, type: 'number' },
    { key: 'image', label: 'Image URL', required: false },
    { key: 'shortDescription', label: 'Short Description', required: false },
    { key: 'description', label: 'Long Description', required: false },
    { key: 'dateAdded', label: 'Date Added', required: false, type: 'date' }
];

export default function App() {
    const [navigation, setNavigation] = useState({ screen: 'Dashboard', params: {} });
    const [cigars, setCigars] = useState([]);
    const [humidors, setHumidors] = useState([]);
    const [theme, setTheme] = useState(themes["Humidor Hub"]);
    const [goveeApiKey, setGoveeApiKey] = useState('');
    const [goveeDevices, setGoveeDevices] = useState([]);

    const [selectedFont, setSelectedFont] = useState(fontOptions[0]);

    // State for controlling dashboard panel visibility
    // This state will determine which panels are shown in the Dashboard.
    // It is initialized to show all panels by default, will be conditionally overridden in Dashboard component
    const [dashboardPanelVisibility, setDashboardPanelVisibility] = useState({
        showWrapperPanel: true,
        showStrengthPanel: true,
        showCountryPanel: true,
        showLiveEnvironment: true,
        showInventoryAnalysis: true,
    });

    // New state to manage the open/closed status of dashboard panels
    const [dashboardPanelStates, setDashboardPanelStates] = useState({
        roxy: true,
        liveEnvironment: true,
        inventoryAnalysis: true,
        wrapper: true,
        strength: true,
        country: true,
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

            // This is a cleanup function. When the component unmounts (or `db`/`userId` changes),
            // it will detach the listeners to prevent memory leaks.
            return () => {
                unsubscribeHumidors();
                unsubscribeCigars();
            };
        }
    }, [db, userId]); // Dependencies for this effect.

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
                return <Dashboard navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} showWrapperPanel={dashboardPanelVisibility.showWrapperPanel} showStrengthPanel={dashboardPanelVisibility.showStrengthPanel} showCountryPanel={dashboardPanelVisibility.showCountryPanel} showLiveEnvironment={dashboardPanelVisibility.showLiveEnvironment} showInventoryAnalysis={dashboardPanelVisibility.showInventoryAnalysis} panelStates={dashboardPanelStates} setPanelStates={setDashboardPanelStates} />;
            case 'HumidorsScreen':
                return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} db={db} appId={appId} userId={userId} theme={theme} {...params} />;
            case 'MyHumidor':
                const humidor = humidors.find(h => h.id === params.humidorId);
                return humidor ? <MyHumidor humidor={humidor} navigate={navigate} cigars={cigars} humidors={humidors} db={db} appId={appId} userId={userId} theme={theme} /> : <div>Humidor not found</div>;
            case 'CigarDetail':
                const cigar = cigars.find(c => c.id === params.cigarId);
                return cigar ? <CigarDetail cigar={cigar} navigate={navigate} db={db} appId={appId} userId={userId} /> : <div>Cigar not found</div>;
            case 'AddCigar':
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
                return <Dashboard navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} showWrapperPanel={dashboardPanelVisibility.showWrapperPanel} showStrengthPanel={dashboardPanelVisibility.showStrengthPanel} showCountryPanel={dashboardPanelVisibility.showCountryPanel} showLiveEnvironment={dashboardPanelVisibility.showLiveEnvironment} showInventoryAnalysis={dashboardPanelVisibility.showInventoryAnalysis} panelStates={dashboardPanelStates} setPanelStates={setDashboardPanelStates} />;
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