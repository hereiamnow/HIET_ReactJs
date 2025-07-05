// File: App.js
// Author: ADHD developer
// Date: July 4, 2025
// Time: 11:35 PM CDT

// Description of Changes:
// - Added a 'shortDescription' field to the Add New Cigar form, placed above the existing 'description' field.
// - Integrated 'shortDescription' into the Auto-fill Details functionality, allowing the Gemini API to populate it.
// - Updated the Gemini API prompt and response schema in the `handleAutofill` function to include 'shortDescription'.
// - Added comprehensive file header with author, date, description, and next suggestions.
// - Added inline comments with timestamps to all modified code sections.

// Next Suggestions:
// - Implement full Firebase authentication flow (sign-up, login, password reset).
// - Enhance error handling with user-friendly messages for all API calls and database operations.
// - Add more robust input validation for all forms.
// - Implement a loading indicator for all asynchronous operations (e.g., saving data, fetching Govee devices).
// - Improve responsiveness for larger screens (tablets and desktops).
// - Add unit tests for components and utility functions.
// - Consider adding a feature to track cigar aging over time.
// - Implement push notifications for humidor alerts.

// Import necessary libraries and components.
// React is the main library for building the user interface.
// useState, useEffect, and useMemo are "hooks" that let us use state and other React features in functional components.
import React, { useState, useEffect, useMemo } from 'react';
// lucide-react provides a set of clean, modern icons used throughout the app.
import { Thermometer, Droplets, Bell, Plus, Search, X, ChevronLeft, Image as ImageIcon, Star, Wind, Coffee, GlassWater, LoaderCircle, Sparkles, Box, Briefcase, LayoutGrid, List, BookOpen, Leaf, Flame, MapPin, Tag, Minus, Edit, Trash2, Upload, Link2, Settings as SettingsIcon, User, Database, Info, Download, UploadCloud, ChevronDown, Shield, FileText, LogOut, Palette, BarChart2, TrendingUp, PieChart as PieChartIcon, Move, Check, Zap, AlertTriangle, Filter, ArrowDownWideNarrow, ArrowUpWideNarrow, Cigarette } from 'lucide-react';
// recharts is a library for creating the charts (bar, line, pie) on the dashboard.
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Import Firebase libraries for database and authentication
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, writeBatch, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, connectAuthEmulator } from "firebase/auth";


// --- FIREBASE CONFIGURATION ---
// These variables are placeholders that will be replaced by the environment.
// It's a secure way to handle configuration without hardcoding it.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;


// --- THEME DATA ---
// This object holds different color schemes for the app. This allows the user to change the look and feel.
const themes = {
    "Humidor Hub": {
        name: "Humidor Hub",
        bg: "bg-gray-900",
        card: "bg-gray-800/50",
        text: "text-white",
        subtleText: "text-gray-400",
        primary: "text-amber-400",
        primaryBg: "bg-amber-500",
        hoverPrimaryBg: "hover:bg-amber-600",
        borderColor: "border-gray-700",
        inputBg: "bg-gray-800",
        ring: "focus:ring-amber-500",
        button: "bg-gray-700 hover:bg-gray-600",
    },
    "Midnight Blue": {
        name: "Midnight Blue",
        bg: "bg-slate-900",
        card: "bg-slate-800/50",
        text: "text-white",
        subtleText: "text-slate-400",
        primary: "text-sky-400",
        primaryBg: "bg-sky-500",
        hoverPrimaryBg: "hover:bg-sky-600",
        borderColor: "border-slate-700",
        inputBg: "bg-slate-800",
        ring: "focus:ring-sky-500",
        button: "bg-slate-700 hover:bg-slate-600",
    },
    "Vintage Leather": {
        name: "Vintage Leather",
        bg: "bg-stone-900",
        card: "bg-stone-800/50",
        text: "text-white",
        subtleText: "text-stone-400",
        primary: "text-orange-400",
        primaryBg: "bg-orange-500",
        hoverPrimaryBg: "hover:bg-orange-600",
        borderColor: "border-stone-700",
        inputBg: "bg-stone-800",
        ring: "focus:ring-orange-500",
        button: "bg-stone-700 hover:bg-stone-600",
    },
    "Classic Light": {
        name: "Classic Light",
        bg: "bg-gray-100",
        card: "bg-white/60",
        text: "text-gray-800",
        subtleText: "text-gray-500",
        primary: "text-amber-700",
        primaryBg: "bg-amber-600",
        hoverPrimaryBg: "hover:bg-amber-700",
        borderColor: "border-gray-300",
        inputBg: "bg-white",
        ring: "focus:ring-amber-500",
        button: "bg-gray-200 hover:bg-gray-300",
    }
};

// A comprehensive list of possible flavor notes a user can select.
const allFlavorNotes = [
    'Earthy', 'Woody', 'Spicy', 'Nutty', 'Sweet', 'Fruity', 'Floral', 'Herbal',
    'Leather', 'Coffee', 'Cocoa', 'Chocolate', 'Creamy', 'Pepper', 'Cedar', 'Oak',
    'Cinnamon', 'Vanilla', 'Honey', 'Caramel', 'Citrus', 'Dried Fruit', 'Hay', 'Toasted',
    'Dark Cherry', 'Roasted Nuts', 'Toasted Bread'
].sort(); // .sort() keeps the list alphabetical.

// A predefined list of cigar strength options.
const strengthOptions = ['Mild', 'Mild-Medium', 'Medium', 'Medium-Full', 'Full'];

// A list of fun tips for Roxy's Corner on the dashboard.
const roxysTips = [
    "Did you know? A steady 70% humidity is perfect for aging most cigars. Don't let it fluctuate!",
    "Remember to rotate your cigars every few months to ensure they age evenly. It's like a little cigar ballet!",
    "The wrapper provides a large part of a cigar's flavor. A darker wrapper often means a sweeter, richer taste.",
    "Pairing a cigar with the right drink can elevate the experience. Try a medium-bodied cigar with a good rum!",
    "Patience is a virtue for a cigar lover. Letting a cigar rest in your humidor for a few weeks after purchase can improve its flavor.",
    "The 'vitola' of a cigar refers to its size and shape. Different vitolas can offer surprisingly different smoking experiences, even with the same tobacco tobacco blend.",
    "Don't inhale cigar smoke! The rich flavors are meant to be savored in your mouth, much like a fine wine.",
    "A good cut is crucial. A dull cutter can tear the wrapper and ruin the draw. Keep your tools sharp!"
];

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
 * A helper function to determine the color of a flavor tag based on the note.
 * This makes the UI more visually interesting and informative.
 */
const getFlavorTagColor = (note) => {
    const lowerNote = note.toLowerCase();
    switch (lowerNote) {
        case 'earthy': case 'woody': case 'leather': case 'oak': case 'toasted': return 'bg-yellow-900/50 text-yellow-200 border border-yellow-800';
        case 'coffee': case 'chocolate': case 'cocoa': return 'bg-yellow-950/60 text-yellow-100 border border-yellow-900';
        case 'nutty': case 'roasted nuts': return 'bg-orange-900/60 text-orange-200 border border-orange-800';
        case 'spicy': case 'cinnamon': return 'bg-red-800/60 text-red-200 border border-red-700';
        case 'pepper': return 'bg-gray-600/60 text-gray-100 border border-gray-500';
        case 'dark cherry': return 'bg-red-900/60 text-red-200 border border-red-800';
        case 'herbal': case 'hay': return 'bg-green-800/60 text-green-200 border border-green-700';
        case 'sweet': case 'honey': case 'caramel': case 'molasses': return 'bg-amber-700/60 text-amber-100 border border-amber-600';
        case 'creamy': case 'vanilla': case 'toasted bread': case 'toast': return 'bg-yellow-700/50 text-yellow-100 border border-yellow-600';
        case 'fruity': case 'dried fruit': return 'bg-purple-800/60 text-purple-200 border border-purple-700';
        case 'citrus': return 'bg-orange-700/60 text-orange-100 border border-orange-600';
        case 'floral': return 'bg-pink-800/60 text-pink-200 border border-pink-700';
        case 'cedar': case 'wood': return 'bg-orange-800/50 text-orange-200 border border-orange-700';
        default: return 'bg-gray-700 text-gray-200 border border-gray-600';
    }
};

/**
 * A helper function to determine the color of the rating badge based on the score.
 */
const getRatingColor = (rating) => {
    if (rating >= 95) return 'bg-blue-500/80 border-blue-400';
    if (rating >= 90) return 'bg-green-500/80 border-green-400';
    if (rating >= 85) return 'bg-yellow-500/80 border-yellow-400';
    if (rating >= 80) return 'bg-orange-500/80 border-orange-400';
    return 'bg-gray-600/80 border-gray-500';
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
    <div className={`${theme.card} p-4 rounded-xl flex items-center space-x-4`}>
        <div className="p-3 rounded-lg" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
             <Icon className={`w-6 h-6 ${theme.primary}`} />
        </div>
        <div>
            <p className={`${theme.subtleText} text-sm`}>{title}</p>
            <p className={`${theme.text} font-bold text-lg`}>{value}</p>
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
                <h3 className="text-xl font-bold text-amber-400 flex items-center"><Sparkles className="w-5 h-5 mr-2"/> {title}</h3>
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
    const [selectedNotes, setSelectedNotes] = useState(cigar.flavorNotes || []);

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
        if (cigar.id) { // Only save to Firestore if it's an existing cigar
            const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigar.id);
            await updateDoc(cigarRef, { flavorNotes: selectedNotes });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><Tag className="w-5 h-5 mr-2"/> Edit Flavor Notes</h3>
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
                {cigar.id && ( // Only show save button if editing an existing cigar
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
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><Palette className="w-5 h-5 mr-2"/> Select Theme</h3>
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
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><Move className="w-5 h-5 mr-2"/> Move Cigars</h3>
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
        let headers = ['id,name,brand,shape,size,country,wrapper,binder,filler,strength,flavorNotes,rating,quantity,price'];
        let usersCsv = cigarsInHumidor.reduce((acc, cigar) => {
            const { id, name, brand, shape, size, country, wrapper, binder, filler, strength, flavorNotes, rating, quantity, price } = cigar;
            acc.push([id, name, brand, shape, size, country, wrapper, binder, filler, strength, `"${flavorNotes.join(';')}"`, rating, quantity, price].join(','));
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
                    <h3 className="text-xl font-bold text-red-400 flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> Delete Humidor</h3>
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
                                <Move className="w-5 h-5 mr-3 text-amber-400"/>
                                <div>
                                    <p className="font-bold text-white">Move Cigars</p>
                                    <p className="text-xs text-gray-300">Move cigars to another humidor.</p>
                                </div>
                            </label>
                           )}
                            <label className={`flex items-center p-3 rounded-lg cursor-pointer ${deleteAction === 'export' ? 'bg-amber-600/30 border-amber-500' : 'bg-gray-700/50 border-gray-600'} border`}>
                                <input type="radio" name="deleteAction" value="export" checked={deleteAction === 'export'} onChange={(e) => setDeleteAction(e.target.value)} className="hidden" />
                                <Download className="w-5 h-5 mr-3 text-amber-400"/>
                                <div>
                                    <p className="font-bold text-white">Export and Delete</p>
                                    <p className="text-xs text-gray-300">Save cigar data to a file, then delete.</p>
                                </div>
                            </label>
                            <label className={`flex items-center p-3 rounded-lg cursor-pointer ${deleteAction === 'deleteAll' ? 'bg-red-600/30 border-red-500' : 'bg-gray-700/50 border-gray-600'} border`}>
                                <input type="radio" name="deleteAction" value="deleteAll" checked={deleteAction === 'deleteAll'} onChange={(e) => setDeleteAction(e.target.value)} className="hidden" />
                                <Trash2 className="w-5 h-5 mr-3 text-red-400"/>
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
 */
const DeleteCigarsModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-red-400 flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> Delete Cigars</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <p className="text-gray-300 mb-4">Are you sure you want to delete the selected cigars? This action cannot be undone.</p>
                
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
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><Thermometer className="w-5 h-5 mr-2"/> Take Manual Reading</h3>
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


// --- API CALL ---
/**
 * Asynchronous function to make a POST request to the Gemini API.
 */
async function callGeminiAPI(prompt, responseSchema = null) {
    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const apiKey = ""; // API key will be injected by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = { contents: chatHistory };
    if (responseSchema) {
        payload.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        };
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Gemini API HTTP Error:", response.status, errorBody);
            return `API Error: Something went wrong (${response.status}).`;
        }

        const result = await response.json();
        
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            const textResult = result.candidates[0].content.parts[0].text;
            if (responseSchema) {
                try {
                    return JSON.parse(textResult);
                } catch (jsonError) {
                    console.error("Failed to parse JSON from Gemini API:", jsonError, "Raw text:", textResult);
                    return `Failed to parse structured response: ${jsonError.message}. Raw: ${textResult.substring(0, 100)}...`;
                }
            }
            return textResult;
        } else {
            console.error("Gemini API response was empty or unexpected:", result);
            return "The API returned an empty or unexpected response.";
        }
    } catch (error) {
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


// --- CIGAR CARD COMPONENTS ---
const GridCigarCard = ({ cigar, navigate, isSelectMode, isSelected, onSelect }) => {
    const ratingColor = getRatingColor(cigar.rating);
    const clickHandler = isSelectMode ? () => onSelect(cigar.id) : () => navigate('CigarDetail', { cigarId: cigar.id });
    
    return (
        <div className="relative" onClick={clickHandler}>
             <div className={`bg-gray-800/50 rounded-xl overflow-hidden group cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-amber-400' : ''}`}>
                <div className="relative">
                    <img src={cigar.image || `https://placehold.co/400x600/5a3825/ffffff?text=${cigar.brand.replace(/\s/g, '+')}`} alt={`${cigar.brand} ${cigar.name}`} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-3">
                    <p className="text-gray-400 text-xs font-semibold uppercase">{cigar.brand}</p>
                    <h3 className="text-white font-bold text-sm truncate">{cigar.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                        {cigar.rating > 0 && <div className={`text-xs font-bold text-white px-2 py-0.5 rounded-full border ${ratingColor}`}>{cigar.rating}</div>}
                        <span className="text-xs bg-gray-700 text-white font-bold px-2 py-1 rounded-full">{cigar.quantity}</span>
                    </div>
                </div>
            </div>
            {isSelectMode && (
                <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-amber-500 border-white' : 'bg-gray-900/50 border-gray-400'}`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
            )}
        </div>
    );
};

const ListCigarCard = ({ cigar, navigate, isSelectMode, isSelected, onSelect }) => {
    const ratingColor = getRatingColor(cigar.rating);
    const clickHandler = isSelectMode ? () => onSelect(cigar.id) : () => navigate('CigarDetail', { cigarId: cigar.id });

    return (
        <div className="relative" onClick={clickHandler}>
            <div className={`bg-gray-800/50 rounded-xl overflow-hidden group cursor-pointer flex transition-all duration-200 ${isSelected ? 'ring-2 ring-amber-400' : ''}`}>
                <div className="relative flex-shrink-0">
                    <img src={cigar.image || `https://placehold.co/400x600/5a3825/ffffff?text=${cigar.brand.replace(/\s/g, '+')}`} alt={`${cigar.brand} ${cigar.name}`} className="w-28 h-full object-cover" />
                </div>
                <div className="p-3 flex-grow flex flex-col justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase">{cigar.brand}</p>
                        <h3 className="text-white font-bold text-base truncate">{cigar.name}</h3>
                    </div>
                    <div className="text-xs mt-2 space-y-1">
                        <p className="text-gray-400">Origin: <span className="font-semibold text-gray-200">{cigar.country}</span></p>
                        <p className="text-gray-400 truncate">Flavors: <span className="font-semibold text-gray-200">{cigar.flavorNotes.join(', ')}</span></p>
                        {cigar.rating > 0 && <div className="flex items-center gap-2">
                            <p className="text-gray-400">Rating:</p>
                            <div className={`text-xs font-bold text-white px-2 py-0.5 rounded-full border ${ratingColor}`}>{cigar.rating}</div>
                        </div>}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                         <p className="text-gray-400 text-xs">Strength: <span className="font-semibold text-gray-200">{cigar.strength}</span></p>
                        <span className="text-lg font-bold bg-gray-700 text-white px-3 py-1 rounded-full">{cigar.quantity}</span>
                    </div>
                </div>
            </div>
            {isSelectMode && (
                 <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-amber-500 border-white' : 'bg-gray-900/50 border-gray-400'}`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
            )}
        </div>
    );
};

const InputField = ({ name, label, placeholder, type = 'text', value, onChange, theme }) => (
    <div>
        <label className={`text-sm font-medium ${theme.subtleText} mb-1 block`}>{label}</label>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            className={`w-full ${theme.inputBg} border ${theme.borderColor} rounded-lg py-2 px-3 ${theme.text} placeholder-gray-500 focus:outline-none focus:ring-2 ${theme.ring}`}
        />
    </div>
);

// NEW: Reusable component for text areas - July 4, 2025 - 11:15 PM CDT
const TextAreaField = ({ name, label, placeholder, value, onChange, theme }) => (
    <div>
        <label className={`text-sm font-medium ${theme.subtleText} mb-1 block`}>{label}</label>
        <textarea
            name={name}
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            rows="3"
            className={`w-full ${theme.inputBg} border ${theme.borderColor} rounded-lg py-2 px-3 ${theme.text} placeholder-gray-500 focus:outline-none focus:ring-2 ${theme.ring}`}
        />
    </div>
);


// --- SCREEN COMPONENTS ---
const ChartCard = ({ title, children, action }) => (
    <div className="bg-gray-800/50 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-amber-300 text-lg">{title}</h3>
            {action}
        </div>
        <div className="h-64">
            {children}
        </div>
    </div>
);

const Dashboard = ({ navigate, cigars, humidors, theme }) => {
    const [roxyTip, setRoxyTip] = useState('');
    const [isRoxyOpen, setIsRoxyOpen] = useState(true);
    const [modalState, setModalState] = useState({ isOpen: false, content: '', isLoading: false });
    const [chartViews, setChartViews] = useState({ brands: 'bar', countries: 'bar', strength: 'bar' });
    
    // Panels start collapsed, except for Roxy's Corner.
    const [isEnvOpen, setIsEnvOpen] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);

    useEffect(() => {
        // Pick a random tip from Roxy's corner on component mount.
        setRoxyTip(roxysTips[Math.floor(Math.random() * roxysTips.length)]);
    }, []);

    // Calculate display values for gauges based on the first humidor.
    // Defaults to 0 if no humidors exist.
    const firstHumidor = humidors[0];
    const displayTemp = firstHumidor ? firstHumidor.temp : 0;
    const displayHumidity = firstHumidor ? firstHumidor.humidity : 0;

    // Memoized calculation for chart data and statistics.
    const { topBrandsData, topCountriesData, strengthDistributionData, totalValue, totalCigars } = useMemo(() => {
        const processChartData = (data, key) => {
            const groupedData = data.reduce((acc, cigar) => {
                const groupKey = cigar[key] || 'N/A';
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
        const value = cigars.reduce((acc, cigar) => acc + (cigar.price * cigar.quantity), 0);
        const count = cigars.reduce((sum, c) => sum + c.quantity, 0);

        return { 
            topBrandsData: topBrands, 
            topCountriesData: topCountries, 
            strengthDistributionData: strengthDistribution,
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

    // Toggles between bar and pie charts.
    const handleChartViewToggle = (chartName) => {
        setChartViews(prev => ({
            ...prev,
            [chartName]: prev[chartName] === 'bar' ? 'pie' : 'bar'
        }));
    };
    
    const PIE_COLORS = ['#f59e0b', '#3b82f6', '#84cc16', '#ef4444', '#a855f7'];

    return (
        <div className="p-4 pb-24">
            {modalState.isOpen && <GeminiModal title="Collection Summary" content={modalState.content} isLoading={modalState.isLoading} onClose={() => setModalState({ isOpen: false, content: '', isLoading: false })} />}
            <h1 className={`text-3xl font-bold ${theme.text} mb-2`}>Dashboard</h1>
            <p className={`${theme.subtleText} mb-6`}>Your collection's live overview.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Cigars" value={totalCigars} icon={Box} theme={theme} />
                <StatCard title="Est. Value" value={`$${totalValue.toFixed(2)}`} icon={(props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} theme={theme} />
                <StatCard title="Humidors" value={humidors.length} icon={Briefcase} theme={theme} />
            </div>
            
            <div className="space-y-6">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                    <button onClick={() => setIsEnvOpen(!isEnvOpen)} className="w-full p-4 flex justify-between items-center">
                         <h3 className="font-bold text-amber-300 text-lg flex items-center"><Thermometer className="w-5 h-5 mr-2"/> Live Environment</h3>
                         <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isEnvOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isEnvOpen && (
                        <div className="px-4 pb-4">
                            <div className="flex justify-around items-center h-full py-4">
                                <Gauge value={displayHumidity} maxValue={100} label="Humidity" unit="%" icon={Droplets} />
                                <Gauge value={displayTemp} maxValue={100} label="Temperature" unit="°F" icon={Thermometer} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-amber-900/20 border border-amber-800 rounded-xl overflow-hidden">
                    <button onClick={() => setIsRoxyOpen(!isRoxyOpen)} className="w-full p-4 flex justify-between items-center">
                         <h3 className="font-bold text-amber-300 text-lg flex items-center"><Wind className="w-5 h-5 mr-2"/> Roxy's Corner</h3>
                         <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isRoxyOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isRoxyOpen && (
                        <div className="px-4 pb-4">
                            <p className="text-amber-200 text-sm">{roxyTip}</p>
                        </div>
                    )}
                </div>
                
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                     <button onClick={() => setIsInventoryOpen(!isInventoryOpen)} className="w-full p-4 flex justify-between items-center">
                         <h3 className="font-bold text-amber-300 text-lg flex items-center"><BarChart2 className="w-5 h-5 mr-2"/> Inventory Analysis</h3>
                         <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isInventoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isInventoryOpen && (
                        <div className="p-4 space-y-6">
                             <ChartCard 
                                title="Top 5 Brands" 
                                action={ <button onClick={() => handleChartViewToggle('brands')} className={`p-1 rounded-full ${theme.button}`}>{chartViews.brands === 'bar' ? <PieChartIcon className="w-5 h-5" /> : <BarChart2 className="w-5 h-5" />}</button>}>
                                {chartViews.brands === 'bar' ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topBrandsData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#d1d5db' }} tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}/>
                                            <Bar dataKey="quantity" fill="#f59e0b" barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={topBrandsData} dataKey="quantity" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {topBrandsData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}/>
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
                                            <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}/>
                                            <Bar dataKey="quantity" fill="#3b82f6" barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                               ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={topCountriesData} dataKey="quantity" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                 {topCountriesData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}/>
                                        </PieChart>
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
                                            <YAxis tick={{ fill: '#d1d5db' }} tickLine={false} axisLine={false}/>
                                            <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.1)'}} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}/>
                                            <Bar dataKey="quantity" fill="#84cc16" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                     <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={strengthDistributionData} dataKey="quantity" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                {strengthDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </ChartCard>
                        </div>
                    )}
                </div>
                 <button onClick={handleSummarizeCollection} className="w-full flex items-center justify-center bg-purple-600/20 border border-purple-500 text-purple-300 font-bold py-3 rounded-lg hover:bg-purple-600/30 transition-colors mt-6">
                    <Sparkles className="w-5 h-5 mr-2" /> Summarize My Collection
                </button>
            </div>
        </div>
    );
};

const HumidorsScreen = ({ navigate, cigars, humidors, db, appId, userId, theme }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    
    const DollarSignIcon = (props) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    );
    
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

    const filteredCigars = searchQuery ? cigars.filter(cigar => cigar.name.toLowerCase().includes(searchQuery.toLowerCase()) || cigar.brand.toLowerCase().includes(searchQuery.toLowerCase())) : [];
        
    const totalUniqueCigars = cigars.length;
    const totalQuantity = cigars.reduce((sum, c) => sum + c.quantity, 0);

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

            {searchQuery === '' ? (
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
                    <div className="space-y-4">
                        {humidors.map(humidor => {
                            const cigarsInHumidor = cigars.filter(c => c.humidorId === humidor.id);
                            const cigarCount = cigarsInHumidor.reduce((sum, c) => sum + c.quantity, 0);
                            const humidorValue = cigarsInHumidor.reduce((sum, c) => sum + (c.quantity * (c.price || 0)), 0);

                            return (
                                <div key={humidor.id} className="bg-gray-800/50 rounded-xl overflow-hidden group cursor-pointer" onClick={() => navigate('MyHumidor', { humidorId: humidor.id })}>
                                    <div className="relative">
                                        <img src={humidor.image} alt={humidor.name} className="w-full h-32 object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 p-4">
                                            <h2 className="text-2xl font-bold text-white">{humidor.name}</h2>
                                            <p className="text-sm text-gray-300">{humidor.location}</p>
                                        </div>
                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">{cigarCount} Cigars</div>
                                    </div>
                                    <div className="p-4 bg-gray-800 grid grid-cols-3 gap-2 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <DollarSignIcon className="w-5 h-5 text-green-400 mb-1"/>
                                            <p className="font-bold text-white text-sm">${humidorValue.toFixed(2)}</p>
                                            <p className="text-xs text-gray-400">Value</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                            <Droplets className="w-5 h-5 text-blue-400 mb-1"/>
                                            <p className="font-bold text-white text-sm">{humidor.humidity}%</p>
                                            <p className="text-xs text-gray-400">Humidity</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                            <Thermometer className="w-5 h-5 text-red-400 mb-1"/>
                                            <p className="font-bold text-white text-sm">{humidor.temp}°F</p>
                                            <p className="text-xs text-gray-400">Temp</p>
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

const MyHumidor = ({ humidor, navigate, cigars, humidors, db, appId, userId, theme }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedCigarIds, setSelectedCigarIds] = useState([]);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isDeleteHumidorModalOpen, setIsDeleteHumidorModalOpen] = useState(false);
    const [isDeleteCigarsModalOpen, setIsDeleteCigarsModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isManualReadingModalOpen, setIsManualReadingModalOpen] = useState(false);
    const [showFilterSort, setShowFilterSort] = useState(false);
    const [filters, setFilters] = useState({ brand: '', country: '', strength: '', flavorNotes: [] });
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const uniqueBrands = useMemo(() => [...new Set(cigars.filter(c => c.humidorId === humidor.id).map(c => c.brand))].sort(), [cigars, humidor.id]);
    const uniqueCountries = useMemo(() => [...new Set(cigars.filter(c => c.humidorId === humidor.id).map(c => c.country))].sort(), [cigars, humidor.id]);
    const availableFlavorNotes = useMemo(() => [...new Set(cigars.filter(c => c.humidorId === humidor.id).flatMap(c => c.flavorNotes))].sort(), [cigars, humidor.id]);

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
                case 'rating': valA = a.rating; valB = b.rating; break;
                case 'quantity': valA = a.quantity; valB = b.quantity; break;
                case 'price': valA = a.price; valB = b.price; break;
                default: return 0;
            }
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return currentCigars;
    }, [cigars, humidor.id, searchQuery, filters, sortBy, sortOrder]);

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

    const handleMoveCigars = async (destinationHumidorId) => {
        const batch = writeBatch(db);
        selectedCigarIds.forEach(cigarId => {
            const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigarId);
            batch.update(cigarRef, { humidorId: destinationHumidorId });
        });
        await batch.commit();
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

    const handleConfirmDeleteCigars = async () => {
        const batch = writeBatch(db);
        selectedCigarIds.forEach(cigarId => {
            const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigarId);
            batch.delete(cigarRef);
        });
        await batch.commit();
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

    return (
        <div className="pb-24">
             {isMoveModalOpen && <MoveCigarsModal onClose={() => setIsMoveModalOpen(false)} onMove={handleMoveCigars} destinationHumidors={humidors.filter(h => h.id !== humidor.id)} theme={theme}/>}
            <DeleteHumidorModal isOpen={isDeleteHumidorModalOpen} onClose={() => setIsDeleteHumidorModalOpen(false)} onConfirm={handleConfirmDeleteHumidor} humidor={humidor} cigarsInHumidor={filteredAndSortedCigars} otherHumidors={humidors.filter(h => h.id !== humidor.id)}/>
            <DeleteCigarsModal isOpen={isDeleteCigarsModalOpen} onClose={() => setIsDeleteCigarsModalOpen(false)} onConfirm={handleConfirmDeleteCigars} count={selectedCigarIds.length}/>
            {isExportModalOpen && <ExportModal cigars={filteredAndSortedCigars} onClose={() => setIsExportModalOpen(false)} />}
            {isManualReadingModalOpen && <ManualReadingModal isOpen={isManualReadingModalOpen} onClose={() => setIsManualReadingModalOpen(false)} onSave={handleSaveManualReading} initialTemp={humidor.temp} initialHumidity={humidor.humidity}/>}

            <div className="relative">
                <img src={humidor.image || `https://placehold.co/600x400/3a2d27/ffffff?text=${humidor.name.replace(/\s/g, '+')}`} alt={humidor.name} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="absolute top-4 left-4">
                    <button onClick={() => navigate('HumidorsScreen')} className="p-2 bg-black/50 rounded-full">
                        <ChevronLeft className="w-7 h-7 text-white" />
                    </button>
                </div>
                <div className="absolute bottom-0 p-4">
                    <h1 className="text-3xl font-bold text-white">{humidor.name}</h1>
                    <p className="text-sm text-gray-300">{humidor.shortDescription || humidor.description}</p>
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-end items-center bg-gray-800/50 p-3 rounded-xl mb-6 gap-4">
                    <button onClick={() => navigate('EditHumidor', { humidorId: humidor.id })} className="flex flex-col items-center gap-1 text-gray-300 hover:text-amber-400 transition-colors"><Edit className="w-5 h-5" /><span className="text-xs font-medium">Edit</span></button>
                    <button onClick={() => navigate('AddCigar', { humidorId: humidor.id })} className="flex flex-col items-center gap-1 text-gray-300 hover:text-amber-400 transition-colors"><Plus className="w-5 h-5" /><span className="text-xs font-medium">Add Cigar</span></button>
                    <button onClick={() => setIsManualReadingModalOpen(true)} className="flex flex-col items-center gap-1 text-gray-300 hover:text-blue-400 transition-colors"><FileText className="w-5 h-5" /><span className="text-xs font-medium">Take Reading</span></button>
                    <button onClick={() => setIsExportModalOpen(true)} className="flex flex-col items-center gap-1 text-gray-300 hover:text-green-400 transition-colors"><Download className="w-5 h-5" /><span className="text-xs font-medium">Export</span></button>
                    <button onClick={() => setIsDeleteHumidorModalOpen(true)} className="flex flex-col items-center gap-1 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /><span className="text-xs font-medium">Delete</span></button>
                </div>
                
                <div className="flex justify-around items-center bg-gray-800/50 p-3 rounded-xl mb-6 text-center">
                    <div className="flex flex-col items-center"><Droplets className="w-5 h-5 text-blue-400 mb-1" /><p className="text-sm text-gray-400">Humidity</p><p className="font-bold text-white text-base">{humidor.humidity}%</p></div>
                    <div className="h-10 w-px bg-gray-700"></div>
                    <div className="flex flex-col items-center"><Thermometer className="w-5 h-5 text-red-400 mb-1" /><p className="text-sm text-gray-400">Temperature</p><p className="font-bold text-white text-base">{humidor.temp}°F</p></div>
                    <div className="h-10 w-px bg-gray-700"></div>
                    <div className="flex flex-col items-center"><svg className="w-5 h-5 text-green-400 mb-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg><p className="text-sm text-gray-400">Est. Value</p><p className="font-bold text-white text-base">${humidorValue.toFixed(2)}</p></div>
                </div>

                <div className="flex items-center mb-4 gap-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Search this humidor..." value={searchQuery} onChange={handleSearchChange} className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-b-xl mt-1 z-20 overflow-hidden">
                                {suggestions.map(suggestion => (<div key={suggestion} onMouseDown={() => handleSuggestionClick(suggestion)} className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors cursor-pointer">{suggestion}</div>))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => setShowFilterSort(prev => !prev)} className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex-shrink-0"><Filter className="w-5 h-5" /></button>
                    <button onClick={handleToggleSelectMode} className="flex items-center gap-2 bg-gray-700 text-white font-bold text-sm px-4 py-2 rounded-full hover:bg-gray-600 transition-colors flex-shrink-0">{isSelectMode ? <X className="w-4 h-4"/> : <Check className="w-4 h-4" />}{isSelectMode ? 'Cancel' : 'Select'}</button>
                </div>

                <div className="flex justify-between items-center mb-6 px-2">
                    <div>
                        <p className="text-sm text-gray-300"><span className="font-bold text-white">{filteredAndSortedCigars.length}</span> Unique</p>
                        <p className="text-xs text-gray-400"><span className="font-bold text-gray-200">{totalQuantity}</span> Total Cigars</p>
                    </div>
                    <div className="flex bg-gray-800 border border-gray-700 rounded-full p-1">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-colors duration-200 ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-gray-400'}`}><LayoutGrid className="w-5 h-5" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-full transition-colors duration-200 ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-gray-400'}`}><List className="w-5 h-5" /></button>
                    </div>
                </div>

                {showFilterSort && (
                    <div className={`${theme.card} p-4 rounded-xl mb-6 space-y-4`}>
                        <h3 className="font-bold text-amber-300 text-lg">Filter & Sort</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={`${theme.subtleText} text-sm mb-1 block`}>Brand</label><select value={filters.brand} onChange={(e) => handleFilterChange('brand', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"><option value="">All Brands</option>{uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}</select></div>
                            <div><label className={`${theme.subtleText} text-sm mb-1 block`}>Country</label><select value={filters.country} onChange={(e) => handleFilterChange('country', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"><option value="">All Countries</option>{uniqueCountries.map(country => <option key={country} value={country}>{country}</option>)}</select></div>
                            <div><label className={`${theme.subtleText} text-sm mb-1 block`}>Strength</label><select value={filters.strength} onChange={(e) => handleFilterChange('strength', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"><option value="">All Strengths</option>{strengthOptions.map(strength => <option key={strength} value={strength}>{strength}</option>)}</select></div>
                            <div className="col-span-2"><label className={`${theme.subtleText} text-sm mb-1 block`}>Flavor Notes</label><div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">{availableFlavorNotes.map(note => (<button key={note} onClick={() => handleFlavorNoteToggle(note)} className={`text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all duration-200 ${filters.flavorNotes.includes(note) ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-300 border border-gray-600'}`}>{note}</button>))}</div></div>
                        </div>
                        <div className="border-t border-gray-700 pt-4 mt-4">
                            <h4 className="font-bold text-white text-base mb-2">Sort By</h4>
                            <div className="flex justify-between items-center"><select value={sortBy} onChange={(e) => handleSortChange(e.target.value)} className="flex-grow bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"><option value="name">Name</option><option value="brand">Brand</option><option value="rating">Rating</option><option value="quantity">Quantity</option><option value="price">Price</option></select><button onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))} className="ml-3 p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors">{sortOrder === 'asc' ? <ArrowUpWideNarrow className="w-5 h-5" /> : <ArrowDownWideNarrow className="w-5 h-5" />}</button></div>
                        </div>
                         <button onClick={() => setFilters({ brand: '', country: '', strength: '', flavorNotes: [] })} className="w-full bg-gray-600 text-white font-bold py-2 rounded-lg hover:bg-gray-500 transition-colors mt-4">Clear Filters</button>
                    </div>
                )}

                <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}>
                    {filteredAndSortedCigars.map(cigar => (viewMode === 'grid' ? <GridCigarCard key={cigar.id} cigar={cigar} navigate={navigate} isSelectMode={isSelectMode} isSelected={selectedCigarIds.includes(cigar.id)} onSelect={handleSelectCigar} /> : <ListCigarCard key={cigar.id} cigar={cigar} navigate={navigate} isSelectMode={isSelectMode} isSelected={selectedCigarIds.includes(cigar.id)} onSelect={handleSelectCigar} />))}
                     {filteredAndSortedCigars.length === 0 && (
                        <div className="col-span-full text-center py-10">
                            <p className="text-gray-400">No cigars found matching your criteria.</p>
                             <button onClick={() => navigate('AddCigar', { humidorId: humidor.id })} className="mt-4 flex items-center mx-auto gap-2 bg-amber-500 text-white font-bold text-sm px-4 py-2 rounded-full hover:bg-amber-600 transition-colors"><Plus className="w-4 h-4" />Add First Cigar</button>
                        </div>
                    )}
                </div>
                {isSelectMode && selectedCigarIds.length > 0 && (
                    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 flex gap-2">
                        <button onClick={() => setIsMoveModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 rounded-full hover:bg-amber-600 transition-colors shadow-lg"><Move className="w-5 h-5"/>Move ({selectedCigarIds.length})</button>
                        <button onClick={() => setIsDeleteCigarsModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-full hover:bg-red-700 transition-colors shadow-lg"><Trash2 className="w-5 h-5"/>Delete ({selectedCigarIds.length})</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CigarDetail = ({ cigar, navigate, db, appId, userId }) => {
    const [modalState, setModalState] = useState({ isOpen: false, type: null, content: '', isLoading: false });
    const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const handleQuantityChange = async (newQuantity) => {
        if (newQuantity < 0) return;
        const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigar.id);
        await updateDoc(cigarRef, { quantity: newQuantity });
    };
    
    const handleSmokeCigar = async () => {
        if (cigar.quantity > 0) {
            const newQuantity = cigar.quantity - 1;
            const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigar.id);
            await updateDoc(cigarRef, { quantity: newQuantity });
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

    const closeModal = () => setModalState({ isOpen: false, type: null, content: '', isLoading: false });

    const RatingBadge = ({ rating }) => {
        if (!rating || rating === 0) return null;
        return (
            <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 ${getRatingColor(rating)}`}>
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
            {modalState.isOpen && <GeminiModal title={modalState.type === 'pairings' ? "Pairing Suggestions" : modalState.type === 'notes' ? "Tasting Note Idea" : "Similar Smokes"} content={modalState.content} isLoading={modalState.isLoading} onClose={closeModal} />}
            {isFlavorModalOpen && <FlavorNotesModal cigar={cigar} db={db} appId={appId} userId={userId} onClose={() => setIsFlavorModalOpen(false)} />}
            {isDeleteModalOpen && <DeleteCigarsModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteCigar} count={1} />}
            {isExportModalOpen && <ExportModal cigars={[cigar]} onClose={() => setIsExportModalOpen(false)} />}

            <div className="relative">
                <img src={cigar.image || `https://placehold.co/400x600/5a3825/ffffff?text=${cigar.brand.replace(/\s/g, '+')}`} alt={cigar.name} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="absolute top-4 left-4">
                    <button onClick={() => navigate('MyHumidor', { humidorId: cigar.humidorId })} className="p-2 bg-black/50 rounded-full"><ChevronLeft className="w-7 h-7 text-white" /></button>
                </div>
                <div className="absolute bottom-0 p-4">
                    <p className="text-gray-300 text-sm font-semibold uppercase">{cigar.brand}</p>
                    <h1 className="text-3xl font-bold text-white">{cigar.name}</h1>
                </div>
            </div>
            
            <div className="p-4 space-y-6">
                <div className="flex justify-end items-center bg-gray-800/50 p-3 rounded-xl gap-4">
                    <button onClick={() => setIsExportModalOpen(true)} className="flex flex-col items-center gap-1 text-gray-300 hover:text-green-400 transition-colors">
                        <Download className="w-5 h-5" />
                        <span className="text-xs font-medium">Export</span>
                    </button>
                    <button onClick={() => navigate('EditCigar', { cigarId: cigar.id })} className="flex flex-col items-center gap-1 text-gray-300 hover:text-amber-400 transition-colors">
                        <Edit className="w-5 h-5" />
                        <span className="text-xs font-medium">Edit</span>
                    </button>
                    <button onClick={() => setIsDeleteModalOpen(true)} className="flex flex-col items-center gap-1 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                        <span className="text-xs font-medium">Delete</span>
                    </button>
                </div>

                <div className="flex justify-between items-center">
                    <RatingBadge rating={cigar.rating} />
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-gray-700 rounded-full p-1">
                            <button onClick={() => handleQuantityChange(cigar.quantity - 1)} className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-2xl active:bg-gray-500"><Minus className="w-5 h-5"/></button>
                            <span className="text-lg text-white font-bold w-10 text-center">{cigar.quantity}</span>
                            <button onClick={() => handleQuantityChange(cigar.quantity + 1)} className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-2xl active:bg-gray-500"><Plus className="w-5 h-5"/></button>
                        </div>
                        <span className="text-gray-400 text-sm">in stock</span>
                    </div>
                </div>
                
                <button onClick={handleSmokeCigar} disabled={cigar.quantity === 0} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <Cigarette className="w-5 h-5"/> Smoke This
                </button>
                
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="font-bold text-amber-300 text-lg mb-3">Cigar Profile</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <DetailItem label="Shape" value={cigar.shape} />
                        <DetailItem label="Size" value={cigar.size} />
                        <DetailItem label="Origin" value={cigar.country} />
                        <DetailItem label="Strength" value={cigar.strength} />
                        <DetailItem label="Wrapper" value={cigar.wrapper} />
                        <DetailItem label="Binder" value={cigar.binder} />
                        <DetailItem label="Filler" value={cigar.filler} />
                    </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-amber-300 text-lg flex items-center"><Tag className="w-5 h-5 mr-3 text-amber-400"/> Flavor Notes</h3>
                        <button onClick={() => setIsFlavorModalOpen(true)} className="text-gray-400 hover:text-amber-400 p-1"><Edit className="w-4 h-4"/></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {cigar.flavorNotes.map(note => (<span key={note} className={`text-xs font-semibold px-3 py-1 rounded-full ${getFlavorTagColor(note)}`}>{note}</span>))}
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <button onClick={handleSuggestPairings} className="w-full flex items-center justify-center bg-amber-500/20 border border-amber-500 text-amber-300 font-bold py-3 rounded-lg hover:bg-amber-500/30 transition-colors"><Sparkles className="w-5 h-5 mr-2" /> Suggest Pairings</button>
                    <button onClick={handleGenerateNote} className="w-full flex items-center justify-center bg-sky-500/20 border border-sky-500 text-sky-300 font-bold py-3 rounded-lg hover:bg-sky-500/30 transition-colors"><Sparkles className="w-5 h-5 mr-2" /> Generate Note Idea</button>
                    <button onClick={handleFindSimilar} className="w-full flex items-center justify-center bg-green-500/20 border border-green-500 text-green-300 font-bold py-3 rounded-lg hover:bg-green-500/30 transition-colors"><Sparkles className="w-5 h-5 mr-2" /> Find Similar Smokes</button>
                </div>
            </div>
        </div>
    );
};

const AddCigar = ({ navigate, db, appId, userId, humidorId, theme }) => {
    // Initializing formData with shortDescription, description, image, and rating fields - July 4, 2025 - 11:35 PM CDT
    const [formData, setFormData] = useState({ brand: '', name: '', shape: '', size: '', wrapper: '', binder: '', filler: '', country: '', strength: '', price: '', rating: '', quantity: 1, image: '', shortDescription: '', description: '' });
    const [strengthSuggestions, setStrengthSuggestions] = useState([]);
    const [isAutofilling, setIsAutofilling] = useState(false);
    const [modalState, setModalState] = useState({ isOpen: false, content: '', isLoading: false });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'strength') {
            setStrengthSuggestions(value ? strengthOptions.filter(opt => opt.toLowerCase().includes(value.toLowerCase())) : []);
        }
    };

    const handleSuggestionClick = (value) => {
        setFormData({ ...formData, strength: value });
        setStrengthSuggestions([]);
    };

    const handleSave = async () => {
        const newCigar = {
            humidorId: humidorId,
            ...formData,
            flavorNotes: Array.isArray(formData.flavorNotes) ? formData.flavorNotes : [],
            rating: Number(formData.rating) || 0,
            price: Number(formData.price) || 0,
            quantity: Number(formData.quantity) || 1,
        };
        const cigarsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'cigars');
        await addDoc(cigarsCollectionRef, newCigar);
        navigate('MyHumidor', { humidorId: humidorId });
    };
    
    // Updated handleAutofill to include shortDescription, description, image, and rating - July 4, 2025 - 11:35 PM CDT
    const handleAutofill = async () => {
        if (!formData.name) {
            setModalState({ isOpen: true, content: "Please enter a cigar name to auto-fill.", isLoading: false });
            return;
        }
        setIsAutofilling(true);
        // Updated prompt to request shortDescription, description, image, and rating - July 4, 2025 - 11:35 PM CDT
        const prompt = `You are a cigar database. Based on the cigar name "${formData.name}", provide its details as a JSON object. The schema MUST be: { "brand": "string", "shape": "string", "size": "string", "country": "string", "wrapper": "string", "binder": "string", "filler": "string", "strength": "Mild" | "Mild-Medium" | "Medium" | "Medium-Full" | "Full", "flavorNotes": ["string", "string", "string", "string"], "shortDescription": "string", "description": "string", "image": "string", "rating": "number" }. If you cannot determine a value, use an empty string "" or an empty array [] or 0 for rating. Do not include any text or markdown formatting outside of the JSON object.`;
        
        // Updated responseSchema to include shortDescription, description, image, and rating - July 4, 2025 - 11:35 PM CDT
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
                shortDescription: { type: "STRING" }, // Added shortDescription to schema - July 4, 2025 - 11:35 PM CDT
                description: { type: "STRING" },
                image: { type: "STRING" },
                rating: { type: "NUMBER" }
            },
            required: ["brand", "shape", "size", "country", "wrapper", "binder", "filler", "strength", "flavorNotes", "shortDescription", "description", "image", "rating"] // Added shortDescription to required - July 4, 2025 - 11:35 PM CDT
        };

        const result = await callGeminiAPI(prompt, responseSchema);
        
        if (typeof result === 'object' && result !== null) {
            setFormData(prevData => ({
                ...prevData,
                ...result,
                rating: Number(result.rating) || 0, // Ensure rating is a number - July 4, 2025 - 11:15 PM CDT
                image: result.image || '', // Ensure image is a string - July 4, 2025 - 11:15 PM CDT
                shortDescription: result.shortDescription || '', // Ensure shortDescription is a string - July 4, 2025 - 11:35 PM CDT
                description: result.description || '' // Ensure description is a string - July 4, 2025 - 11:15 PM CDT
            }));
        } else {
            console.error("Gemini API response was not a valid object:", result);
            setModalState({ isOpen: true, content: `Failed to parse auto-fill data. Please try a different name or fill manually. Error: ${result}`, isLoading: false });
        }
        
        setIsAutofilling(false);
    };

    const closeModal = () => setModalState({ isOpen: false, content: '', isLoading: false });

    return (
        <div className="p-4 pb-24">
            {modalState.isOpen && <GeminiModal title="Auto-fill Status" content={modalState.content} isLoading={modalState.isLoading} onClose={closeModal} />}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('MyHumidor', { humidorId })} className="p-2 -ml-2 mr-2"><ChevronLeft className={`w-7 h-7 ${theme.text}`} /></button>
                <h1 className={`text-3xl font-bold ${theme.text}`}>Add New Cigar</h1>
            </div>

            <div className="space-y-4">
                <InputField name="image" label="Image URL" placeholder="https://example.com/cigar.png" value={formData.image} onChange={handleInputChange} theme={theme} />
                
                <InputField name="name" label="Name / Line" placeholder="e.g., 1964 Anniversary" value={formData.name} onChange={handleInputChange} theme={theme} />
                
                <button onClick={handleAutofill} disabled={isAutofilling} className="w-full flex items-center justify-center gap-2 bg-purple-600/20 border border-purple-500 text-purple-300 font-bold py-2 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50">
                    {isAutofilling ? <LoaderCircle className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5" />}
                    {isAutofilling ? 'Thinking...' : '✨ Auto-fill Details'}
                </button>

                {/* Added InputField for shortDescription - July 4, 2025 - 11:35 PM CDT */}
                <InputField name="shortDescription" label="Short Description" placeholder="Brief overview of the cigar..." value={formData.shortDescription} onChange={handleInputChange} theme={theme} />
                
                {/* Added TextAreaField for description - July 4, 2025 - 11:15 PM CDT */}
                <TextAreaField name="description" label="Description" placeholder="Notes on this cigar..." value={formData.description} onChange={handleInputChange} theme={theme} />

                <InputField name="brand" label="Brand" placeholder="e.g., Padrón" value={formData.brand} onChange={handleInputChange} theme={theme} />
                <div className="grid grid-cols-2 gap-4">
                    <InputField name="shape" label="Shape" placeholder="e.g., Toro" value={formData.shape} onChange={handleInputChange} theme={theme} />
                    <InputField name="size" label="Size" placeholder="e.g., 5.5x50" value={formData.size} onChange={handleInputChange} theme={theme} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <InputField name="wrapper" label="Wrapper" placeholder="e.g., Maduro" value={formData.wrapper} onChange={handleInputChange} theme={theme} />
                    <InputField name="binder" label="Binder" placeholder="e.g., Nicaraguan" value={formData.binder} onChange={handleInputChange} theme={theme} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <InputField name="filler" label="Filler" placeholder="e.g., Nicaraguan" value={formData.filler} onChange={handleInputChange} theme={theme} />
                    <InputField name="country" label="Country" placeholder="e.g., Nicaragua" value={formData.country} onChange={handleInputChange} theme={theme} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <InputField name="strength" label="Strength" placeholder="e.g., Full" value={formData.strength} onChange={handleInputChange} theme={theme} />
                        {strengthSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-b-xl mt-1 z-20 overflow-hidden">
                                {strengthSuggestions.map(suggestion => (<div key={suggestion} onMouseDown={() => handleSuggestionClick(suggestion)} className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors cursor-pointer">{suggestion}</div>))}
                            </div>
                        )}
                    </div>
                    <InputField name="price" label="Price Paid" placeholder="e.g., 15.50" type="number" value={formData.price} onChange={handleInputChange} theme={theme} />
                </div>
                {/* Added InputField for rating - July 4, 2025 - 11:15 PM CDT */}
                <InputField name="rating" label="Rating" placeholder="e.g., 94" type="number" value={formData.rating} onChange={handleInputChange} theme={theme} />
                <InputField name="quantity" label="Quantity" placeholder="e.g., 5" type="number" value={formData.quantity} onChange={handleInputChange} theme={theme} />
            </div>

            <div className="pt-4 flex space-x-4">
                <button onClick={handleSave} className={`w-full ${theme.primaryBg} ${theme.text === 'text-white' ? 'text-white' : 'text-black'} font-bold py-3 rounded-lg ${theme.hoverPrimaryBg} transition-colors`}>Save Cigar</button>
                <button onClick={() => navigate('MyHumidor', { humidorId })} className={`w-full ${theme.button} ${theme.text} font-bold py-3 rounded-lg transition-colors`}>Cancel</button>
            </div>
        </div>
    );
};

const EditCigar = ({ navigate, db, appId, userId, cigar, theme }) => {
    const [formData, setFormData] = useState({ ...cigar, description: cigar.description || '' });
    const [strengthSuggestions, setStrengthSuggestions] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'strength') {
            setStrengthSuggestions(value ? strengthOptions.filter(opt => opt.toLowerCase().includes(value.toLowerCase())) : []);
        }
    };

    const handleSuggestionClick = (value) => {
        setFormData({ ...formData, strength: value });
        setStrengthSuggestions([]);
    };

    const handleSave = async () => {
        const cigarRef = doc(db, 'artifacts', appId, 'users', userId, 'cigars', cigar.id);
        const { id, ...dataToSave } = formData;
        await updateDoc(cigarRef, dataToSave);
        navigate('CigarDetail', { cigarId: cigar.id });
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('CigarDetail', { cigarId: cigar.id })} className="p-2 -ml-2 mr-2"><ChevronLeft className="w-7 h-7 text-white" /></button>
                <h1 className="text-3xl font-bold text-white">Edit Cigar</h1>
            </div>

            <div className="space-y-4">
                <InputField name="image" label="Image URL" placeholder="https://example.com/cigar.png" value={formData.image} onChange={handleInputChange} theme={theme} />
                <InputField name="brand" label="Brand" placeholder="e.g., Padrón" value={formData.brand} onChange={handleInputChange} theme={theme} />
                <InputField name="name" label="Name / Line" placeholder="e.g., 1964 Anniversary" value={formData.name} onChange={handleInputChange} theme={theme} />
                <TextAreaField name="description" label="Description" placeholder="Notes on this cigar..." value={formData.description} onChange={handleInputChange} theme={theme} />
                <div className="grid grid-cols-2 gap-4">
                    <InputField name="shape" label="Shape" placeholder="e.g., Toro" value={formData.shape} onChange={handleInputChange} theme={theme} />
                    <InputField name="size" label="Size" placeholder="e.g., 5.5x50" value={formData.size} onChange={handleInputChange} theme={theme} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <InputField name="wrapper" label="Wrapper" placeholder="e.g., Maduro" value={formData.wrapper} onChange={handleInputChange} theme={theme} />
                    <InputField name="binder" label="Binder" placeholder="e.g., Nicaraguan" value={formData.binder} onChange={handleInputChange} theme={theme} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <InputField name="filler" label="Filler" placeholder="e.g., Nicaraguan" value={formData.filler} onChange={handleInputChange} theme={theme} />
                    <InputField name="country" label="Country" placeholder="e.g., Nicaragua" value={formData.country} onChange={handleInputChange} theme={theme} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <InputField name="strength" label="Strength" placeholder="e.g., Full" value={formData.strength} onChange={handleInputChange} theme={theme} />
                        {strengthSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-b-xl mt-1 z-20 overflow-hidden">
                                {strengthSuggestions.map(suggestion => (<div key={suggestion} onMouseDown={() => handleSuggestionClick(suggestion)} className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors cursor-pointer">{suggestion}</div>))}
                            </div>
                        )}
                    </div>
                    <InputField name="price" label="Price Paid" placeholder="e.g., 15.50" type="number" value={formData.price} onChange={handleInputChange} theme={theme} />
                </div>
                <InputField name="rating" label="Rating" placeholder="e.g., 94" type="number" value={formData.rating} onChange={handleInputChange} theme={theme} />

                <div className="pt-4 flex space-x-4">
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
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
            </div>
            <div className="space-y-6">
                {alertSettings.map(setting => (
                    <div key={setting.humidorId} className="bg-gray-800/50 p-4 rounded-xl">
                        <h3 className="font-bold text-xl text-amber-300 mb-4">{setting.name}</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Humidity Alert</span>
                                <button onClick={() => handleToggle(setting.humidorId, 'humidityAlert')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${setting.humidityAlert ? 'bg-amber-500' : 'bg-gray-600'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${setting.humidityAlert ? 'translate-x-6' : 'translate-x-1'}`}/></button>
                            </div>
                            {setting.humidityAlert && (
                                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-700 ml-2">
                                    <div className="flex items-center space-x-2"><label className="text-sm text-gray-400">Min:</label><input type="number" value={setting.minHumidity} onChange={(e) => handleValueChange(setting.humidorId, 'minHumidity', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" /><span className="text-gray-400">%</span></div>
                                     <div className="flex items-center space-x-2"><label className="text-sm text-gray-400">Max:</label><input type="number" value={setting.maxHumidity} onChange={(e) => handleValueChange(setting.humidorId, 'maxHumidity', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" /><span className="text-gray-400">°F</span></div>
                                </div>
                            )}
                            <div className="border-t border-gray-700"></div>
                             <div className="flex justify-between items-center">
                                <span className="text-gray-300">Temperature Alert</span>
                                <button onClick={() => handleToggle(setting.humidorId, 'tempAlert')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${setting.tempAlert ? 'bg-amber-500' : 'bg-gray-600'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${setting.tempAlert ? 'translate-x-6' : 'translate-x-1'}`}/></button>
                            </div>
                            {setting.tempAlert && (
                                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-700 ml-2">
                                    <div className="flex items-center space-x-2"><label className="text-sm text-gray-400">Min:</label><input type="number" value={setting.minTemp} onChange={(e) => handleValueChange(setting.humidorId, 'minTemp', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" /><span className="text-gray-400">°F</span></div>
                                     <div className="flex items-center space-x-2"><label className="text-sm text-gray-400">Max:</label><input type="number" value={setting.maxTemp} onChange={(e) => handleValueChange(setting.humidorId, 'maxTemp', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" /><span className="text-gray-400">°F</span></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
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
        const newHumidorData = {
            ...formData,
            image: formData.image || `https://placehold.co/600x400/3a2d27/ffffff?text=${formData.name.replace(/\s/g, '+') || 'New+Humidor'}`,
            goveeDeviceId: null,
            goveeDeviceModel: null,
            humidity: trackEnvironment ? Number(formData.humidity) : 70,
            temp: trackEnvironment ? Number(formData.temp) : 68,
        };
        const humidorsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'humidors');
        await addDoc(humidorsCollectionRef, newHumidorData);
        navigate('HumidorsScreen');
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('HumidorsScreen')} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className={`w-7 h-7 ${theme.text}`} />
                </button>
                <h1 className={`text-3xl font-bold ${theme.text}`}>Add New Humidor</h1>
            </div>

            <div className="space-y-6">
                <InputField name="image" label="Image URL" placeholder="https://example.com/humidor.png" value={formData.image} onChange={handleInputChange} theme={theme} />
                
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
                        <h3 className="font-bold text-lg text-amber-300 flex items-center"><Thermometer className="w-5 h-5 mr-2"/> Environment Tracking</h3>
                        <button onClick={() => setTrackEnvironment(!trackEnvironment)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${trackEnvironment ? 'bg-amber-500' : 'bg-gray-600'}`}>
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${trackEnvironment ? 'translate-x-6' : 'translate-x-1'}`}/>
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
            image: formData.image || `https://placehold.co/600x400/3a2d27/ffffff?text=${formData.name.replace(/\s/g, '+') || 'Humidor'}`,
        };
        await updateDoc(humidorRef, updatedHumidor);
        navigate('MyHumidor', { humidorId: humidor.id });
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('MyHumidor', { humidorId: humidor.id })} className="p-2 -ml-2 mr-2"><ChevronLeft className={`w-7 h-7 ${theme.text}`} /></button>
                <h1 className={`text-3xl font-bold ${theme.text}`}>Edit Humidor</h1>
            </div>

            <div className="space-y-4">
                <InputField name="image" label="Image URL" placeholder="https://example.com/humidor.png" value={formData.image} onChange={handleInputChange} theme={theme} />
                <InputField name="name" label="Humidor Name" placeholder="e.g., The Big One" value={formData.name} onChange={handleInputChange} theme={theme} />
                <InputField name="shortDescription" label="Short Description" placeholder="e.g., Main aging unit" value={formData.shortDescription} onChange={handleInputChange} theme={theme} />
                <TextAreaField name="longDescription" label="Long Description" placeholder="e.g., A 150-count mahogany humidor..." value={formData.longDescription} onChange={handleInputChange} theme={theme} />

                <div className="grid grid-cols-2 gap-4">
                    <InputField name="size" label="Size" placeholder="e.g., 150-count" value={formData.size} onChange={handleInputChange} theme={theme} />
                    <InputField name="location" label="Location" placeholder="e.g., Office" value={formData.location} onChange={handleInputChange} theme={theme} />
                </div>
                
                <div className={`${theme.card} p-4 rounded-xl`}>
                    <h3 className="font-bold text-xl text-amber-300 mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2"/> Environment Tracking</h3>
                    <div className="space-y-4">
                        <div>
                            <label className={`text-sm font-medium ${theme.subtleText} mb-2 block`}>Tracking Method</label>
                            <div className="flex space-x-4">
                                <label className="inline-flex items-center"><input type="radio" name="trackingMethod" value="manual" checked={formData.trackingMethod === 'manual'} onChange={handleInputChange} className="form-radio text-amber-500 h-4 w-4"/><span className={`ml-2 ${theme.text}`}>Manual Input</span></label>
                                <label className="inline-flex items-center"><input type="radio" name="trackingMethod" value="govee" checked={formData.trackingMethod === 'govee'} onChange={handleInputChange} className="form-radio text-amber-500 h-4 w-4"/><span className={`ml-2 ${theme.text}`}>Govee Sensor</span></label>
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
                                    <InputField name="temp" label="Current Temp (°F)" value={humidor.temp} type="number" onChange={() => {}} theme={theme} disabled={true}/>
                                    <InputField name="humidity" label="Current Humidity (%)" value={humidor.humidity} type="number" onChange={() => {}} theme={theme} disabled={true}/>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 flex space-x-4">
                    <button onClick={handleSave} className={`w-full ${theme.primaryBg} ${theme.text === 'text-white' ? 'text-white' : 'text-black'} font-bold py-3 rounded-lg ${theme.hoverPrimaryBg} transition-colors`}>Save Changes</button>
                    <button onClick={() => navigate('MyHumidor', { humidorId: humidor.id })} className={`w-full ${theme.button} ${theme.text} font-bold py-3 rounded-lg transition-colors`}>Cancel</button>
                </div>
            </div>
        </div>
    );
};


const SettingsScreen = ({navigate, theme, setTheme}) => {
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    
    const SettingItem = ({icon: Icon, title, subtitle, onClick}) => (
        <button onClick={onClick} className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-left">
            <div className="p-2 bg-gray-700 rounded-full"><Icon className={`w-6 h-6 ${theme.primary}`} /></div>
            <div><p className={`font-bold ${theme.text}`}>{title}</p><p className={`text-xs ${theme.subtleText}`}>{subtitle}</p></div>
        </button>
    );
    
    return (
        <div className="p-4 pb-24">
            {isThemeModalOpen && <ThemeModal currentTheme={theme} setTheme={setTheme} onClose={() => setIsThemeModalOpen(false)} />}
            <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
            <div className="space-y-4">
                <SettingItem icon={User} title="Profile" subtitle="Manage your account details" onClick={() => navigate('Profile')} />
                <SettingItem icon={Bell} title="Notifications" subtitle="Set up alerts for humidity and temp" onClick={() => navigate('Alerts')} />
                <SettingItem icon={Zap} title="Integrations" subtitle="Connect to Govee and other services" onClick={() => navigate('Integrations')} />
                <SettingItem icon={Database} title="Data & Sync" subtitle="Export or import your collection" onClick={() => navigate('DataSync')} />
                <SettingItem icon={Palette} title="Theme" subtitle={`Current: ${theme.name}`} onClick={() => setIsThemeModalOpen(true)} />
                <SettingItem icon={Info} title="About Humidor Hub" subtitle="Version 1.0.0" onClick={() => navigate('About')} />
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
                        <input type="text" placeholder="Enter your Govee API Key (e.g., TEST_KEY_123)" value={key} onChange={(e) => { setKey(e.target.value); setStatus('Not Connected'); setMessage(''); }} className={`w-full ${theme.inputBg} border ${theme.borderColor} rounded-lg py-2 px-3 ${theme.text} placeholder-gray-500 focus:outline-none focus:ring-2 ${theme.ring}`}/>
                        <p className={`${theme.subtleText} text-xs`}>Get this from the Govee Home app under "About Us {'>'} Apply for API Key".</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <span className={`text-sm font-bold ${status === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>Status: {isLoading ? 'Connecting...' : status}</span>
                        <button onClick={handleConnectGovee} disabled={isLoading} className={`flex items-center gap-2 ${theme.primaryBg} text-white font-bold text-sm px-4 py-2 rounded-full ${theme.hoverPrimaryBg} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>
                            {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4" />}
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


const DataSyncScreen = ({ navigate, db, appId, userId, cigars, humidors }) => {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const exportEnvironmentData = () => {
        let headers = ['humidorId,name,humidity,temp'];
        let envCsv = humidors.reduce((acc, humidor) => {
            const { id, name, humidity, temp } = humidor;
            acc.push([id, name, humidity, temp].join(','));
            return acc;
        }, []);
        downloadFile({ data: [...headers, ...envCsv].join('\n'), fileName: 'humidor_environment_export.csv', fileType: 'text/csv' });
    };

    return (
        <div className="p-4 pb-24">
            {isImportModalOpen && <ImportCsvModal humidors={humidors} db={db} appId={appId} userId={userId} navigate={navigate} onClose={() => setIsImportModalOpen(false)} />}
            {isExportModalOpen && <ExportModal cigars={cigars} onClose={() => setIsExportModalOpen(false)} />}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className="w-7 h-7 text-white" /></button>
                <h1 className="text-3xl font-bold text-white">Import & Export</h1>
            </div>
            <div className="space-y-6">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="font-bold text-amber-300 text-lg mb-2">Export Collection</h3>
                    <p className="text-sm text-gray-400 mb-4">Download your entire cigar inventory as a CSV or JSON file for backups.</p>
                    <button onClick={() => setIsExportModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"><Download className="w-5 h-5" />Export Collection</button>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="font-bold text-amber-300 text-lg mb-2">Export Environment Data</h3>
                    <p className="text-sm text-gray-400 mb-4">Download temperature and humidity readings for all your humidors in CSV format.</p>
                    <button onClick={exportEnvironmentData} className="w-full flex items-center justify-center gap-2 bg-purple-600/80 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors"><Download className="w-5 h-5" />Export Environment CSV</button>
                </div>
                 <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="font-bold text-amber-300 text-lg mb-2">Import Collection</h3>
                    <p className="text-sm text-gray-400 mb-4">Import cigars from a CSV file. Ensure the file matches the exported format.</p>
                    <button onClick={() => setIsImportModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"><UploadCloud className="w-5 h-5" />Import from CSV</button>
                </div>
            </div>
        </div>
    );
};

const ImportCsvModal = ({ humidors, db, appId, userId, onClose, navigate }) => {
    const [selectedHumidor, setSelectedHumidor] = useState(humidors[0]?.id || '');
    const fileInputRef = React.useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const lines = text.split('\n').slice(1);
            const batch = writeBatch(db);
            const cigarsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'cigars');
            lines.forEach(line => {
                const columns = line.split(',');
                if (columns.length < 14) return;
                const newCigar = {
                    humidorId: selectedHumidor,
                    name: columns[1], brand: columns[2], shape: columns[3], size: columns[4],
                    country: columns[5], wrapper: columns[6], binder: columns[7], filler: columns[8],
                    strength: columns[9], flavorNotes: columns[10].replace(/"/g, '').split(';').map(s => s.trim()),
                    rating: parseInt(columns[11]) || 0, quantity: parseInt(columns[12]) || 0,
                    price: parseFloat(columns[13]) || 0, image: ''
                };
                const cigarRef = doc(cigarsCollectionRef);
                batch.set(cigarRef, newCigar);
            });
            await batch.commit();
            onClose();
            navigate('MyHumidor', { humidorId: selectedHumidor });
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><UploadCloud className="w-5 h-5 mr-2"/> Import from CSV</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Select Humidor</label>
                        <select value={selectedHumidor} onChange={(e) => setSelectedHumidor(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                            {humidors.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".csv" />
                    <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"><Upload className="w-5 h-5"/> Choose CSV File</button>
                </div>
            </div>
        </div>
    );
};

const ExportModal = ({ cigars, onClose }) => {
    const exportToCsv = () => {
        let headers = ['id,name,brand,shape,size,country,wrapper,binder,filler,strength,flavorNotes,rating,quantity,price'];
        let usersCsv = cigars.reduce((acc, cigar) => {
            const { id, name, brand, shape, size, country, wrapper, binder, filler, strength, flavorNotes, rating, quantity, price } = cigar;
            acc.push([id, name, brand, shape, size, country, wrapper, binder, filler, strength, `"${flavorNotes.join(';')}"`, rating, quantity, price].join(','));
            return acc;
        }, []);
        downloadFile({ data: [...headers, ...usersCsv].join('\n'), fileName: 'humidor_hub_export.csv', fileType: 'text/csv' });
        onClose();
    };

    const exportToJson = () => {
        downloadFile({ data: JSON.stringify(cigars, null, 2), fileName: 'humidor_hub_export.json', fileType: 'application/json' });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><Download className="w-5 h-5 mr-2"/> Export Collection</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">Choose a format to download your cigar collection.</p>
                    <button onClick={exportToCsv} className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">Export as CSV</button>
                    <button onClick={exportToJson} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">Export as JSON</button>
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

const ProfileScreen = ({ navigate, cigars, theme }) => {
    const totalCigars = cigars.reduce((sum, c) => sum + c.quantity, 0);
    const topFlavors = useMemo(() => {
        const flavorCounts = cigars.flatMap(c => c.flavorNotes).reduce((acc, flavor) => {
            acc[flavor] = (acc[flavor] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(flavorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(entry => entry[0]);
    }, [cigars]);

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className="w-7 h-7 text-white" /></button>
                <h1 className="text-3xl font-bold text-white">Profile</h1>
            </div>
            <div className="space-y-6">
                <div className="flex flex-col items-center p-6 bg-gray-800/50 rounded-xl">
                    <img src="https://placehold.co/100x100/3a2d27/ffffff?text=User" alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-amber-400"/>
                    <h2 className="text-2xl font-bold text-white mt-4">Cigar Aficionado</h2>
                    <p className="text-gray-400">Hudson Bend, TX</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <StatCard title="Total Cigars" value={totalCigars} icon={Box} theme={theme} />
                    <StatCard title="Member Since" value="2024" icon={Star} theme={theme} />
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="font-bold text-amber-300 text-lg mb-3">Tasting Preferences</h3>
                    <div>
                        <h4 className="font-semibold text-white mb-2">Preferred Strength</h4>
                        <div className="w-full bg-gray-700 rounded-full h-2.5"><div className="bg-amber-500 h-2.5 rounded-full" style={{width: '70%'}}></div></div>
                         <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Mild</span><span>Medium</span><span>Full</span></div>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-semibold text-white mb-2">Top Flavors</h4>
                        <div className="flex flex-wrap gap-2">{topFlavors.map(note => (<span key={note} className={`text-xs font-semibold px-3 py-1 rounded-full ${getFlavorTagColor(note)}`}>{note}</span>))}</div>
                    </div>
                </div>
                 <button className="w-full flex items-center justify-center gap-2 bg-red-800/80 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors"><LogOut className="w-5 h-5"/>Log Out</button>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---
export default function App() {
    const [navigation, setNavigation] = useState({ screen: 'Dashboard', params: {} });
    const [cigars, setCigars] = useState([]);
    const [humidors, setHumidors] = useState([]);
    const [theme, setTheme] = useState(themes["Humidor Hub"]);
    const [goveeApiKey, setGoveeApiKey] = useState('');
    const [goveeDevices, setGoveeDevices] = useState([]);
    
    // Firebase state
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch

    // One-time Firebase initialization and authentication
    useEffect(() => {
        try {
            // Check if the Firebase config object is available.
            if (Object.keys(firebaseConfig).length === 0) {
                console.error("Firebase config is empty. App cannot initialize.");
                setIsLoading(false);
                return;
            }
            
            // Initialize the Firebase app with the provided configuration.
            const app = initializeApp(firebaseConfig);
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

            // This listener checks for changes in the user's authentication state.
            onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    // If a user is signed in (either through a real account or anonymously),
                    // set their unique ID to state. This ID is used to fetch their data.
                    setUserId(user.uid);
                } else {
                    // If no user is signed in, we need to sign them in.
                    // This logic handles both local development and the live environment.
                    if (isLocalDev || !initialAuthToken) {
                        // If we are on localhost OR there is no secure token provided,
                        // sign the user in anonymously. This allows the app to work locally
                        // without needing a real user account.
                        await signInAnonymously(firebaseAuth);
                    } else {
                        // If we are in the live environment AND a secure token is available,
                        // use it to sign the user in.
                        try {
                            await signInWithCustomToken(firebaseAuth, initialAuthToken);
                        } catch (error) {
                            // If the custom token fails for any reason, fall back to anonymous sign-in
                            // to ensure the app doesn't crash.
                            console.error("Error signing in with custom token, falling back to anonymous:", error);
                            await signInAnonymously(firebaseAuth);
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Firebase initialization error:", error);
            setIsLoading(false); // Stop loading if there's a critical error.
        }
    }, []);

    // Effect to fetch data from Firestore once user is authenticated
    useEffect(() => {
        // Don't run this effect if we don't have a database connection or a user ID.
        if (!db || !userId) return;

        // Set loading to true while we fetch data.
        setIsLoading(true);
        
        // Define the paths to the user's data collections in Firestore.
        const humidorsPath = `artifacts/${appId}/users/${userId}/humidors`;
        const cigarsPath = `artifacts/${appId}/users/${userId}/cigars`;
        
        const humidorsColRef = collection(db, humidorsPath);
        const cigarsColRef = collection(db, cigarsPath);

        // onSnapshot creates a real-time listener for the humidors collection.
        // It will automatically update the UI whenever the data changes in the database.
        const unsubscribeHumidors = onSnapshot(humidorsColRef, (snapshot) => {
            const humidorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHumidors(humidorsData);
        }, (error) => console.error("Error fetching humidors:", error));

        // Create a real-time listener for the cigars collection.
        const unsubscribeCigars = onSnapshot(cigarsColRef, (snapshot) => {
            const cigarsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCigars(cigarsData);
            setIsLoading(false); // Set loading to false once we have the cigar data.
        }, (error) => {
            console.error("Error fetching cigars:", error);
            setIsLoading(false);
        });

        // This is a cleanup function. When the component unmounts (e.g., user closes the app),
        // it unsubscribes from the listeners to prevent memory leaks.
        return () => {
            unsubscribeHumidors();
            unsubscribeCigars();
        };
    }, [db, userId]); // This effect re-runs if the db or userId changes.

    const navigate = (screen, params = {}) => {
        window.scrollTo(0, 0);
        setNavigation({ screen, params });
    };

    const renderScreen = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-screen">
                    <LoaderCircle className="w-16 h-16 text-amber-500 animate-spin" />
                    <p className="mt-4 text-lg">Loading Your Collection...</p>
                </div>
            );
        }

        const { screen, params } = navigation;
        const dbProps = { db, appId, userId };

        switch (screen) {
            case 'Dashboard':
                return <Dashboard navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} />;
            case 'HumidorsScreen':
                return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} {...dbProps} theme={theme} />;
            case 'MyHumidor':
                const humidor = humidors.find(h => h.id === params.humidorId);
                if (!humidor) return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} {...dbProps} theme={theme} />; 
                return <MyHumidor humidor={humidor} navigate={navigate} cigars={cigars} humidors={humidors} {...dbProps} theme={theme} />;
            case 'CigarDetail':
                const cigar = cigars.find(c => c.id === params.cigarId);
                if (!cigar) return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} {...dbProps} theme={theme} />;
                return <CigarDetail cigar={cigar} navigate={navigate} {...dbProps} theme={theme} />;
            case 'Alerts':
                return <AlertsScreen navigate={navigate} humidors={humidors} theme={theme} />;
            case 'Settings':
                return <SettingsScreen navigate={navigate} setTheme={setTheme} theme={theme} />;
            case 'Integrations':
                return <IntegrationsScreen navigate={navigate} goveeApiKey={goveeApiKey} setGoveeApiKey={setGoveeApiKey} goveeDevices={goveeDevices} setGoveeDevices={setGoveeDevices} theme={theme} />;
            case 'DataSync':
                return <DataSyncScreen navigate={navigate} cigars={cigars} humidors={humidors} {...dbProps} theme={theme} />;
            case 'About':
                return <AboutScreen navigate={navigate} theme={theme} />;
            case 'Profile':
                return <ProfileScreen navigate={navigate} cigars={cigars} theme={theme} />;
            case 'AddCigar':
                return <AddCigar navigate={navigate} humidorId={params.humidorId} {...dbProps} theme={theme} />;
            case 'EditCigar':
                 const cigarToEdit = cigars.find(c => c.id === params.cigarId);
                 if (!cigarToEdit) return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} {...dbProps} theme={theme} />;
                return <EditCigar cigar={cigarToEdit} navigate={navigate} {...dbProps} theme={theme} />;
            case 'AddHumidor':
                 return <AddHumidor navigate={navigate} {...dbProps} theme={theme} />;
            case 'EditHumidor':
                 const humidorToEdit = humidors.find(h => h.id === params.humidorId);
                 if (!humidorToEdit) return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} {...dbProps} theme={theme} />;
                return <EditHumidor humidor={humidorToEdit} navigate={navigate} goveeApiKey={goveeApiKey} goveeDevices={goveeDevices} {...dbProps} theme={theme} />;
            default:
                return <Dashboard navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} />;
        }
    };

    return (
        <div className={`font-sans antialiased ${theme.bg} ${theme.text} min-h-screen`} style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23a0522d\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
            <div className={`max-w-md mx-auto ${theme.bg}/95 min-h-screen shadow-2xl shadow-black relative`}>
                <div className="fixed top-0 left-0 right-0 max-w-md mx-auto h-8 z-50" style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)'}}></div>
                {renderScreen()}
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-24 z-40" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'}}></div>
                <BottomNav activeScreen={navigation.screen} navigate={navigate} theme={theme} />
            </div>
        </div>
    );
}
