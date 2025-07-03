// Import necessary libraries and components.
// React is the main library for building the user interface.
// useState, useEffect, and useMemo are "hooks" that let us use state and other React features in functional components.
import React, { useState, useEffect, useMemo } from 'react';
// lucide-react provides a set of clean, modern icons used throughout the app.
import { Thermometer, Droplets, Bell, Plus, Search, X, ChevronLeft, Image as ImageIcon, Star, Wind, Coffee, GlassWater, LoaderCircle, Sparkles, Box, Briefcase, LayoutGrid, List, BookOpen, Leaf, Flame, MapPin, Tag, Minus, Edit, Trash2, Upload, Link2, Settings, User, Database, Info, Download, UploadCloud, ChevronDown, Shield, FileText, LogOut, Palette, BarChart2, TrendingUp, PieChart as PieChartIcon, Move, Check, Zap, AlertTriangle } from 'lucide-react';
// recharts is a library for creating the charts (bar, line, pie) on the dashboard.
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- THEME DATA ---
// This object holds different color schemes for the app. This allows the user to change the look and feel.
// Each theme has properties for background color (bg), card color, text color, etc.
// These are defined using Tailwind CSS utility classes.
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

// --- MOCK DATA ---
// This is placeholder data used to populate the app initially.
// In a real application, this data would come from a database or API.
const initialMockHumidors = [
    { id: 1, name: 'Ironsides', description: 'My primary aging and storage unit.', size: '150-count', location: 'Office', image: 'https://placehold.co/600x400/3a2d27/ffffff?text=Ironsides', humidity: 70, temp: 68, goveeDeviceId: null, goveeDeviceModel: null },
    { id: 2, name: 'Travel Case', description: 'For taking cigars on the go.', size: '5-count', location: 'Portable', image: 'https://placehold.co/600x400/5c4a42/ffffff?text=Travel+Case', humidity: 69, temp: 71, goveeDeviceId: null, goveeDeviceModel: null },
];

const initialMockCigars = [
  {
    "id": 1,
    "humidorId": 1,
    "name": "Alec Bradley Tempus Quadrum",
    "brand": "Alec Bradley",
    "shape": "Robusto",
    "size": "5.5\"x55",
    "country": "Nicaragua",
    "wrapper": "Honduran",
    "binder": "Honduran",
    "filler": "Nicaraguan",
    "strength": "Medium-Full",
    "flavorNotes": ["Chocolate", "Leather", "Earth", "Spice"],
    "rating": 94,
    "quantity": 1,
    "price": 9.5,
    "image": ""
  },
  {
    "id": 2,
    "humidorId": 1,
    "name": "Cohiba Connecticut Robusto",
    "brand": "Cohiba",
    "shape": "Robusto",
    "size": "5.5\"x50",
    "country": "Dominican Republic",
    "wrapper": "Ecuadorian Connecticut",
    "binder": "Dominican",
    "filler": "Dominican",
    "strength": "Mild-Medium",
    "flavorNotes": ["Cream", "Nuts", "Toast", "Spice"],
    "rating": 90,
    "quantity": 1,
    "price": 20,
    "image": ""
  },
  {
    "id": 3,
    "humidorId": 1,
    "name": "Espinosa Habano No. 4",
    "brand": "Espinosa",
    "shape": "Robusto",
    "size": "5.5\"x50",
    "country": "Nicaragua",
    "wrapper": "Habano",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium",
    "flavorNotes": ["Cedar", "Coffee", "Earth", "Pepper"],
    "rating": 93,
    "quantity": 1,
    "price": 6.5,
    "image": ""
  },
  {
    "id": 4,
    "humidorId": 1,
    "name": "Gilberto Oliva Reserva Toro",
    "brand": "Oliva Cigars",
    "shape": "Toro",
    "size": "6\"x50",
    "country": "Nicaragua",
    "wrapper": "Sumatra",
    "binder": "Indonesian",
    "filler": "Nicaraguan",
    "strength": "Medium",
    "flavorNotes": ["Earth", "Pepper", "Cream", "Coffee"],
    "rating": 90,
    "quantity": 4,
    "price": 5.5,
    "image": ""
  },
  {
    "id": 5,
    "humidorId": 1,
    "name": "La Aroma de Cuba Robusto",
    "brand": "La Aroma de Cuba",
    "shape": "Robusto",
    "size": "5.2\"x54",
    "country": "Nicaragua",
    "wrapper": "Connecticut Broadleaf",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium-Full",
    "flavorNotes": ["Cocoa", "Cedar", "Molasses", "Coffee"],
    "rating": 94,
    "quantity": 1,
    "price": 7,
    "image": ""
  },
  {
    "id": 6,
    "humidorId": 1,
    "name": "La Perla Habana Black Pearl Morado Robusto",
    "brand": "La Perla",
    "shape": "Robusto",
    "size": "5\"x52",
    "country": "Nicaragua",
    "wrapper": "Brazilian Morado",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium-Full",
    "flavorNotes": ["Chocolate", "Coffee", "Spice", "Earth"],
    "rating": 93,
    "quantity": 1,
    "price": 4,
    "image": ""
  },
  {
    "id": 7,
    "humidorId": 1,
    "name": "Latitude Zero El Valle Robusto",
    "brand": "Latitude Zero",
    "shape": "Robusto",
    "size": "5\"x54",
    "country": "Ecuador",
    "wrapper": "Ecuadorian Habano",
    "binder": "Ecuadorian",
    "filler": "Ecuadorian",
    "strength": "Medium",
    "flavorNotes": ["Cedar", "Nuts", "Pepper", "Earth"],
    "rating": 88,
    "quantity": 1,
    "price": 7.5,
    "image": ""
  },
  {
    "id": 8,
    "humidorId": 1,
    "name": "Made Man Model 870",
    "brand": "Man Made",
    "shape": "Toro",
    "size": "6\"x50",
    "country": "Nicaragua",
    "wrapper": "Habano",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium",
    "flavorNotes": ["Earth", "Spice", "Coffee", "Wood"],
    "rating": 89,
    "quantity": 1,
    "price": 3,
    "image": ""
  },
  {
    "id": 9,
    "humidorId": 1,
    "name": "Mark Twain The Press No. 3",
    "brand": "Mark Twain",
    "shape": "Churchill",
    "size": "7\"x56",
    "country": "Dominican Republic",
    "wrapper": "Connecticut Broadleaf",
    "binder": "Dominican",
    "filler": "Dominican",
    "strength": "Medium",
    "flavorNotes": ["Cocoa", "Earth", "Pepper", "Cream"],
    "rating": 90,
    "quantity": 1,
    "price": 4.5,
    "image": ""
  },
  {
    "id": 10,
    "humidorId": 1,
    "name": "Oliva Connecticut Reserve Robusto",
    "brand": "Oliva Cigars",
    "shape": "Robusto",
    "size": "5\"x50",
    "country": "Nicaragua",
    "wrapper": "Ecuadorian Connecticut",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Mild-Medium",
    "flavorNotes": ["Cream", "Cedar", "Nuts", "Toast"],
    "rating": 91,
    "quantity": 5,
    "price": 8,
    "image": ""
  },
  {
    "id": 11,
    "humidorId": 1,
    "name": "Oliva Connecticut Reserve Toro",
    "brand": "Oliva Cigars",
    "shape": "Toro",
    "size": "6\"x50",
    "country": "Nicaragua",
    "wrapper": "Ecuadorian Connecticut",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Mild-Medium",
    "flavorNotes": ["Cream", "Cedar", "Nuts", "Toast"],
    "rating": 91,
    "quantity": 4,
    "price": 8.5,
    "image": ""
  },
  {
    "id": 12,
    "humidorId": 1,
    "name": "Oliva Connecticut Reserve Toro",
    "brand": "Oliva Cigars",
    "shape": "Toro",
    "size": "6\"x50",
    "country": "Nicaragua",
    "wrapper": "Ecuadorian Connecticut",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Mild-Medium",
    "flavorNotes": ["Cream", "Cedar", "Nuts", "Toast"],
    "rating": 91,
    "quantity": 5,
    "price": 8.5,
    "image": ""
  },
  {
    "id": 13,
    "humidorId": 1,
    "name": "Oliva Master Blends III Robusto",
    "brand": "Oliva Cigars",
    "shape": "Robusto",
    "size": "5\"x50",
    "country": "Nicaragua",
    "wrapper": "Connecticut Broadleaf",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Full",
    "flavorNotes": ["Earth", "Cocoa", "Spice", "Leather"],
    "rating": 92,
    "quantity": 5,
    "price": 13,
    "image": ""
  },
  {
    "id": 14,
    "humidorId": 1,
    "name": "Oliva Melanio Maduro Robusto",
    "brand": "Oliva Cigars",
    "shape": "Robusto",
    "size": "5\"x50",
    "country": "Nicaragua",
    "wrapper": "San Andres Maduro",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Full",
    "flavorNotes": ["Chocolate", "Espresso", "Earth", "Spice"],
    "rating": 95,
    "quantity": 5,
    "price": 14,
    "image": ""
  },
  {
    "id": 15,
    "humidorId": 1,
    "name": "Oliva Saison Maduro Robusto",
    "brand": "Oliva Cigars",
    "shape": "Robusto",
    "size": "5.0\"x50",
    "country": "Nicaragua",
    "wrapper": "San Andres Maduro",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium-Full",
    "flavorNotes": ["Earth", "Cocoa", "Pepper", "Coffee"],
    "rating": 90,
    "quantity": 5,
    "price": 8,
    "image": ""
  },
  {
    "id": 16,
    "humidorId": 1,
    "name": "Oliva Saison Robusto",
    "brand": "Oliva Cigars",
    "shape": "Robusto",
    "size": "5.0\"x50",
    "country": "Nicaragua",
    "wrapper": "Ecuadorian Habano",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium",
    "flavorNotes": ["Cedar", "Spice", "Earth", "Coffee"],
    "rating": 90,
    "quantity": 5,
    "price": 7.5,
    "image": ""
  },
  {
    "id": 17,
    "humidorId": 1,
    "name": "Oliva Serie 'G' Robusto (Box-Pressed)",
    "brand": "Oliva Cigars",
    "shape": "Robusto",
    "size": "4.5\"x50",
    "country": "Nicaragua",
    "wrapper": "Cameroon",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium",
    "flavorNotes": ["Cedar", "Coffee", "Nuts", "Spice"],
    "rating": 91,
    "quantity": 5,
    "price": 6.5,
    "image": ""
  },
  {
    "id": 18,
    "humidorId": 1,
    "name": "Oliva Serie 'G' Toro",
    "brand": "Oliva Cigars",
    "shape": "Toro",
    "size": "6\"x50",
    "country": "Nicaragua",
    "wrapper": "Cameroon",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium",
    "flavorNotes": ["Cedar", "Coffee", "Nuts", "Spice"],
    "rating": 91,
    "quantity": 4,
    "price": 7,
    "image": ""
  },
  {
    "id": 19,
    "humidorId": 1,
    "name": "Oliva Serie 'G' Toro",
    "brand": "Oliva Cigars",
    "shape": "Toro",
    "size": "6\"x50",
    "country": "Nicaragua",
    "wrapper": "Cameroon",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium",
    "flavorNotes": ["Cedar", "Coffee", "Nuts", "Spice"],
    "rating": 91,
    "quantity": 5,
    "price": 7,
    "image": ""
  },
  {
    "id": 20,
    "humidorId": 1,
    "name": "Oliva Serie 'O' Robusto",
    "brand": "Oliva Cigars",
    "shape": "Robusto",
    "size": "5\"x50",
    "country": "Nicaragua",
    "wrapper": "Habano",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium-Full",
    "flavorNotes": ["Earth", "Pepper", "Coffee", "Leather"],
    "rating": 94,
    "quantity": 5,
    "price": 7.5,
    "image": ""
  },
  {
    "id": 21,
    "humidorId": 1,
    "name": "Oliva Serie 'O' Robusto",
    "brand": "Oliva Cigars",
    "shape": "Robusto",
    "size": "5\"x50",
    "country": "Nicaragua",
    "wrapper": "Habano",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium-Full",
    "flavorNotes": ["Earth", "Pepper", "Coffee", "Leather"],
    "rating": 94,
    "quantity": 5,
    "price": 7.5,
    "image": ""
  },
  {
    "id": 22,
    "humidorId": 1,
    "name": "Oliva Serie 'O' Toro",
    "brand": "Oliva Cigars",
    "shape": "Toro",
    "size": "6\"x50",
    "country": "Nicaragua",
    "wrapper": "Habano",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium-Full",
    "flavorNotes": ["Earth", "Pepper", "Coffee", "Leather"],
    "rating": 94,
    "quantity": 4,
    "price": 8,
    "image": ""
  },
  {
    "id": 23,
    "humidorId": 1,
    "name": "Oliva Serie 'V' Double Robusto",
    "brand": "Oliva Cigars",
    "shape": "Double Robusto",
    "size": "5\"x54",
    "country": "Nicaragua",
    "wrapper": "Ecuadorian Habano",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Full",
    "flavorNotes": ["Cocoa", "Spice", "Coffee", "Earth"],
    "rating": 95,
    "quantity": 1,
    "price": 11,
    "image": ""
  },
  {
    "id": 24,
    "humidorId": 1,
    "name": "Oliva Serie 'V' Double Robusto",
    "brand": "Oliva Cigars",
    "shape": "Double Robusto",
    "size": "5\"x54",
    "country": "Nicaragua",
    "wrapper": "Ecuadorian Habano",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Full",
    "flavorNotes": ["Cocoa", "Spice", "Coffee", "Earth"],
    "rating": 95,
    "quantity": 4,
    "price": 11,
    "image": ""
  },
  {
    "id": 25,
    "humidorId": 2,
    "name": "Romeo y Julieta Viejo R",
    "brand": "Romeo y Julieta",
    "shape": "Robusto",
    "size": "5\"x54",
    "country": "Dominican Republic",
    "wrapper": "Habano",
    "binder": "Dominican",
    "filler": "Dominican",
    "strength": "Medium",
    "flavorNotes": ["Cedar", "Nuts", "Spice", "Coffee"],
    "rating": 90,
    "quantity": 1,
    "price": 6.5,
    "image": ""
  },
  {
    "id": 26,
    "humidorId": 2,
    "name": "Saison by Oliva Robusto",
    "brand": "Oliva Cigars",
    "shape": "Robusto",
    "size": "5\"x50",
    "country": "Nicaragua",
    "wrapper": "Ecuadorian Habano",
    "binder": "Nicaraguan",
    "filler": "Nicaraguan",
    "strength": "Medium",
    "flavorNotes": ["Cedar", "Spice", "Earth", "Coffee"],
    "rating": 90,
    "quantity": 5,
    "price": 7.5,
    "image": ""
  }
];

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
 * @param {object} options - The options for the download.
 * @param {string} options.data - The data to be downloaded.
 * @param {string} options.fileName - The name of the file.
 * @param {string} options.fileType - The MIME type of the file.
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
 * @param {string} note - The flavor note (e.g., 'Earthy', 'Spicy').
 * @returns {string} A string of Tailwind CSS classes for styling.
 */
const getFlavorTagColor = (note) => {
    const lowerNote = note.toLowerCase();
    switch (lowerNote) {
        // Browns / Earthy
        case 'earthy':
        case 'woody':
        case 'leather':
        case 'oak':
        case 'toasted':
            return 'bg-yellow-900/50 text-yellow-200 border border-yellow-800';
        case 'coffee':
        case 'chocolate':
        case 'cocoa':
            return 'bg-yellow-950/60 text-yellow-100 border border-yellow-900';
        case 'nutty':
        case 'roasted nuts':
            return 'bg-orange-900/60 text-orange-200 border border-orange-800';

        // Reds / Spices
        case 'spicy':
        case 'cinnamon':
            return 'bg-red-800/60 text-red-200 border border-red-700';
        case 'pepper':
            return 'bg-gray-600/60 text-gray-100 border border-gray-500';
        case 'dark cherry':
            return 'bg-red-900/60 text-red-200 border border-red-800';

        // Greens / Herbal
        case 'herbal':
        case 'hay':
            return 'bg-green-800/60 text-green-200 border border-green-700';
        
        // Sweets / Creams
        case 'sweet':
        case 'honey':
        case 'caramel':
        case 'molasses':
            return 'bg-amber-700/60 text-amber-100 border border-amber-600';
        case 'creamy':
        case 'vanilla':
        case 'toasted bread':
        case 'toast':
            return 'bg-yellow-700/50 text-yellow-100 border border-yellow-600';

        // Fruits / Florals
        case 'fruity':
        case 'dried fruit':
            return 'bg-purple-800/60 text-purple-200 border border-purple-700';
        case 'citrus':
            return 'bg-orange-700/60 text-orange-100 border border-orange-600';
        case 'floral':
            return 'bg-pink-800/60 text-pink-200 border border-pink-700';
        
        // Woods
        case 'cedar':
        case 'wood':
            return 'bg-orange-800/50 text-orange-200 border border-orange-700';

        default:
            return 'bg-gray-700 text-gray-200 border border-gray-600';
    }
};

/**
 * A helper function to determine the color of the rating badge based on the score.
 * @param {number} rating - The cigar's rating (0-100).
 * @returns {string} A string of Tailwind CSS classes.
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
 * It uses SVG to draw a circular gauge.
 */
const Gauge = ({ value, maxValue, label, unit, icon: Icon }) => {
    const percentage = Math.min(Math.max(value / maxValue, 0), 1);
    const isOptimalHum = value >= 68 && value <= 72 && unit === '%';
    const isOptimalTemp = value >= 65 && value <= 70 && unit === '°F';
    const ringColor = (isOptimalHum || isOptimalTemp) ? 'stroke-green-400' : 'stroke-yellow-400';

    return (
        <div className="relative flex flex-col items-center justify-center w-40 h-40 sm:w-48 sm:h-48">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                {/* Background ring */}
                <circle className="stroke-current text-gray-700" cx="60" cy="60" r="50" strokeWidth="10" fill="none" />
                {/* Foreground (value) ring */}
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
 * It's fixed to the bottom of the screen.
 */
const BottomNav = ({ activeScreen, navigate, theme }) => {
    const navItems = [
        { name: 'Dashboard', icon: BarChart2 },
        { name: 'HumidorsScreen', icon: Box },
        { name: 'Alerts', icon: Bell },
        { name: 'Settings', icon: Settings },
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
 * It shows a loading spinner while waiting for the API response.
 */
const GeminiModal = ({ title, content, isLoading, onClose }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-amber-400 flex items-center"><Sparkles className="w-5 h-5 mr-2"/> {title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
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
const FlavorNotesModal = ({ cigar, setCigars, onClose }) => {
    const [selectedNotes, setSelectedNotes] = useState(cigar.flavorNotes || []);

    const handleToggleNote = (note) => {
        setSelectedNotes(prev =>
            prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
        );
    };

    const handleSave = () => {
        setCigars(prevCigars =>
            prevCigars.map(c =>
                c.id === cigar.id ? { ...c, flavorNotes: selectedNotes } : c
            )
        );
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
                            const colorClasses = getFlavorTagColor(note);
                            const selectionClasses = isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : '';
                            return (
                                <button
                                    key={note}
                                    onClick={() => handleToggleNote(note)}
                                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all duration-200 ${colorClasses} ${selectionClasses}`}
                                >
                                    {note}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                    <button onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors">Save</button>
                </div>
            </div>
        </div>
    );
};

/**
 * ImageEditModal is a pop-up for changing a cigar's image.
 */
const ImageEditModal = ({ cigar, setCigars, onClose }) => {
    const [imageUrl, setImageUrl] = useState(cigar.image || '');

    const handleSaveUrl = () => {
        setCigars(prevCigars =>
            prevCigars.map(c =>
                c.id === cigar.id ? { ...c, image: imageUrl } : c
            )
        );
        onClose();
    };
    
    const handleRemoveImage = () => {
        const placeholder = `https://placehold.co/400x600/5a3825/ffffff?text=${cigar.brand.replace(/\s/g, '+')}`;
        setCigars(prevCigars =>
            prevCigars.map(c =>
                c.id === cigar.id ? { ...c, image: placeholder } : c
            )
        );
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center"><ImageIcon className="w-5 h-5 mr-2"/> Edit Image</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <div className="space-y-4">
                    <div className="relative">
                        <input 
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Paste image URL here"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 pl-10 text-white"
                        />
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                     <button onClick={handleSaveUrl} className="w-full bg-amber-500 text-white font-bold py-2 rounded-lg hover:bg-amber-600 transition-colors">Save URL</button>
                     <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-600"></div>
                        <span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
                        <div className="flex-grow border-t border-gray-600"></div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-2 rounded-lg hover:bg-gray-500 transition-colors">
                        <Upload className="w-4 h-4"/> Upload Image
                    </button>
                    <button 
                        onClick={handleRemoveImage}
                        disabled={!cigar.image || cigar.image.startsWith('https://placehold.co')}
                        className="w-full flex items-center justify-center gap-2 bg-red-800/80 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-4 h-4"/> Remove Image
                    </button>
                </div>
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
            onMove(parseInt(selectedHumidorId));
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

// --- NEW COMPONENT: DeleteHumidorModal ---
/**
 * A modal for confirming the deletion of a humidor. It provides options for handling
 * any cigars within the humidor, such as moving them or exporting them.
 */
const DeleteHumidorModal = ({ isOpen, onClose, onConfirm, humidor, cigarsInHumidor, otherHumidors, theme }) => {
    const [deleteAction, setDeleteAction] = useState('move'); // 'move', 'export', 'deleteAll'
    const [destinationHumidorId, setDestinationHumidorId] = useState(otherHumidors[0]?.id || '');

    // Reset state when the modal is closed or the humidor changes
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
            destinationHumidorId: deleteAction === 'move' ? parseInt(destinationHumidorId) : null,
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
                
                {hasCigars ? (
                    <div className="space-y-4">
                        <div className="bg-red-900/40 border border-red-700 p-3 rounded-lg">
                            <p className="text-sm text-red-200">This humidor contains <span className="font-bold">{cigarsInHumidor.length}</span> cigar(s). Please choose what to do with them.</p>
                        </div>

                        {/* Action selection */}
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

                        {/* Action-specific options */}
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
                               <button onClick={exportToCsv} className="flex-1 text-sm flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors">Export CSV</button>
                               <button onClick={exportToJson} className="flex-1 text-sm flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">Export JSON</button>
                            </div>
                        )}
                         {deleteAction === 'deleteAll' && (
                             <div className="pl-4 border-l-2 border-red-500 ml-3 text-sm text-red-300">
                                This action cannot be undone. All associated cigar data will be lost forever.
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">This action cannot be undone.</p>
                )}

                <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-700">
                    <button onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={handleConfirm} disabled={deleteAction === 'move' && !destinationHumidorId} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-800 disabled:cursor-not-allowed">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * NEW COMPONENT: DeleteCigarsModal
 * A modal for confirming the deletion of multiple selected cigars.
 */
const DeleteCigarsModal = ({ isOpen, onClose, onConfirm, count, theme }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-red-400 flex items-center"><AlertTriangle className="w-5 h-5 mr-2"/> Delete Cigars</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                <p className="text-gray-300 mb-4">Are you sure you want to delete <span className="font-bold text-white">{count}</span> selected cigar(s)? This action cannot be undone.</p>
                
                <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-700">
                    <button onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- API CALL ---
/**
 * Asynchronous function to make a POST request to the Gemini API.
 * @param {string} prompt - The text prompt to send to the API.
 * @returns {Promise<string>} A promise that resolves to the text response from the API.
 */
async function callGeminiAPI(prompt) {
    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = ""; // API key will be injected by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Check for HTTP errors
        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Gemini API HTTP Error:", response.status, errorBody);
            // Provide more specific feedback based on status code or API error message
            if (response.status === 400) {
                return `API Error: Invalid request. Please check the input. (Details: ${errorBody.error?.message || 'N/A'})`;
            } else if (response.status === 429) {
                return "API Error: Too many requests. Please try again shortly (rate limit exceeded).";
            } else if (response.status >= 500) {
                return "API Error: Server issue. Please try again later.";
            } else {
                return `API Error: Something went wrong (${response.status}). (Details: ${errorBody.error?.message || 'N/A'})`;
            }
        }

        const result = await response.json();
        
        // Check for content blocking or empty responses
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else if (result.promptFeedback?.blockReason) {
            console.warn("Gemini API response was blocked:", result.promptFeedback.blockReason);
            return `Content blocked by safety filters. Reason: ${result.promptFeedback.blockReason}. Please try a different query.`;
        } else {
            console.error("Gemini API response was empty or unexpected:", result);
            return "The API returned an empty or unexpected response. Please try again.";
        }
    } catch (error) {
        // Handle network errors (e.g., no internet connection, CORS issues)
        console.error("Error calling Gemini API:", error);
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            return "Network Error: Could not connect to the API. Please check your internet connection or try again later.";
        }
        return `An unexpected error occurred: ${error.message}. Please check the console for more details.`;
    }
}

// NEW FUNCTION: Simulate fetching Govee devices
/**
 * Simulates fetching a list of Govee devices. In a real application, this would
 * make an actual API call to Govee using the provided API key.
 * @param {string} apiKey - The Govee API key.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of mock Govee devices.
 */
async function fetchGoveeDevices(apiKey) {
    // In a real scenario, you'd use the apiKey to make a fetch call to Govee's API.
    // Example: const response = await fetch('https://api.govee.com/v1/devices', { headers: { 'Govee-API-Key': apiKey } });
    // For now, we return mock data.
    console.log(`Simulating Govee device fetch with API Key: ${apiKey}`);
    return new Promise(resolve => {
        setTimeout(() => {
            if (apiKey && apiKey.startsWith('TEST_KEY')) { // Simulate a valid key
                resolve([
                    { device: 'AA:BB:CC:DD:EE:F1', model: 'H5075', deviceName: 'Office Humidor Sensor' },
                    { device: 'AA:BB:CC:DD:EE:F2', model: 'H5074', deviceName: 'Travel Case Sensor' },
                    { device: 'AA:BB:CC:DD:EE:F3', model: 'H5100', deviceName: 'Living Room Sensor' },
                ]);
            } else { // Simulate an invalid key or no devices found
                resolve([]);
            }
        }, 1500); // Simulate network delay
    });
}


// --- CIGAR CARD COMPONENTS ---
// These components define how a single cigar is displayed, either in a grid or a list.

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

// FIXED: Moved InputField outside of the components that use it to prevent re-rendering and focus loss.
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


// --- SCREEN COMPONENTS ---
// These are the main "pages" of the application. The `App` component decides which one to show.

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

const Dashboard = ({ navigate, cigars, theme }) => {
    const [roxyTip, setRoxyTip] = useState('');
    const [isRoxyOpen, setIsRoxyOpen] = useState(true);
    const [envData, setEnvData] = useState([]);
    const [modalState, setModalState] = useState({ isOpen: false, content: '', isLoading: false });
    const [envView, setEnvView] = useState('gauge'); // 'graph' or 'gauge'
    const [chartViews, setChartViews] = useState({ brands: 'bar', countries: 'bar', strength: 'bar' });
    const [isInventoryOpen, setIsInventoryOpen] = useState(true);

    useEffect(() => {
        // Initial data generation for the environment chart
        const now = new Date();
        const initialData = Array.from({ length: 10 }, (_, i) => {
            const time = new Date(now.getTime() - (9 - i) * 5000);
            return {
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                temp: 71 + (Math.random() - 0.5) * 4,
                humidity: 68.5 + (Math.random() - 0.5) * 7,
            };
        });
        setEnvData(initialData);
        
        // Pick a random tip from Roxy's corner
        setRoxyTip(roxysTips[Math.floor(Math.random() * roxysTips.length)]);
    }, []);

    // useMemo is a performance optimization. It ensures that the chart data is only recalculated when the 'cigars' data changes.
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
        const value = cigars.reduce((acc, cigar) => acc + (cigar.quantity * cigar.price), 0);
        const count = cigars.reduce((sum, c) => sum + c.quantity, 0);

        return { 
            topBrandsData: topBrands, 
            topCountriesData: topCountries, 
            strengthDistributionData: strengthDistribution,
            totalValue: value,
            totalCigars: count
        };
    }, [cigars]);
    
    // This function calls the Gemini API to get a summary of the user's collection.
    const handleSummarizeCollection = async () => {
        setModalState({ isOpen: true, content: '', isLoading: true });
        const inventorySummary = cigars.map(c => `${c.quantity}x ${c.brand} ${c.name} (${c.strength}, from ${c.country})`).join('\n');
        const prompt = `You are an expert tobacconist. I am providing you with my current cigar inventory. Please provide a brief, narrative summary of my collection's character. What are the dominant trends in terms of strength, brand, and country of origin? What does my collection say about my tasting preferences? My inventory is:\n\n${inventorySummary}`;
        
        const result = await callGeminiAPI(prompt);
        setModalState({ isOpen: true, content: result, isLoading: false });
    };

    // Toggles the view of a chart between bar and pie.
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
            
            <ChartCard 
                title="Live Environment" 
                action={
                    <button onClick={() => setEnvView(v => v === 'graph' ? 'gauge' : 'graph')} className={`p-1 rounded-full ${theme.button}`}>
                        {envView === 'graph' ? <Thermometer className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                    </button>
                }
            >
                {envView === 'graph' ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={envData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis dataKey="time" tick={{ fill: '#d1d5db' }} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" domain={[60, 80]} tick={{ fill: '#d1d5db' }} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="right" orientation="right" domain={[60, 80]} tick={{ fill: '#d1d5db' }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} name="Humidity (%)" dot={false} />
                            <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} name="Temp (°F)" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                     <div className="flex justify-around items-center h-full">
                        <Gauge value={envData[envData.length - 1]?.humidity || 0} maxValue={100} label="Humidity" unit="%" icon={Droplets} />
                        <Gauge value={envData[envData.length - 1]?.temp || 0} maxValue={100} label="Temperature" unit="°F" icon={Thermometer} />
                    </div>
                )}
            </ChartCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <StatCard title="Total Cigars" value={totalCigars} icon={Box} theme={theme} />
                <StatCard title="Est. Value" value={`$${totalValue.toFixed(2)}`} icon={(props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} theme={theme} />
                <StatCard title="Humidors" value={initialMockHumidors.length} icon={Briefcase} theme={theme} />
            </div>
            
            <div className="space-y-6">
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
                
                <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                     <button onClick={() => setIsInventoryOpen(!isInventoryOpen)} className="w-full p-4 flex justify-between items-center">
                         <h3 className="font-bold text-amber-300 text-lg flex items-center"><BarChart2 className="w-5 h-5 mr-2"/> Inventory Analysis</h3>
                         <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isInventoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isInventoryOpen && (
                        <div className="p-4 space-y-6">
                             <ChartCard 
                                title="Top 5 Brands" 
                                action={
                                    <button onClick={() => handleChartViewToggle('brands')} className={`p-1 rounded-full ${theme.button}`}>
                                        {chartViews.brands === 'bar' ? <PieChartIcon className="w-5 h-5" /> : <BarChart2 className="w-5 h-5" />}
                                    </button>
                                }
                            >
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
                                action={
                                    <button onClick={() => handleChartViewToggle('countries')} className={`p-1 rounded-full ${theme.button}`}>
                                        {chartViews.countries === 'bar' ? <PieChartIcon className="w-5 h-5" /> : <BarChart2 className="w-5 h-5" />}
                                    </button>
                                }
                            >
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
                                action={
                                    <button onClick={() => handleChartViewToggle('strength')} className={`p-1 rounded-full ${theme.button}`}>
                                        {chartViews.strength === 'bar' ? <PieChartIcon className="w-5 h-5" /> : <BarChart2 className="w-5 h-5" />}
                                    </button>
                                }
                            >
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

const HumidorsScreen = ({ navigate, cigars, humidors }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    
    // A custom SVG icon for the dollar sign, as it's not in the lucide-react library.
    const DollarSignIcon = (props) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    );
    
    // Updates the search query and provides suggestions as the user types.
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 1) {
            const allSuggestions = cigars
                .map(c => c.brand)
                .concat(cigars.map(c => c.name))
                .filter(name => name.toLowerCase().includes(query.toLowerCase()));
            
            const uniqueSuggestions = [...new Set(allSuggestions)];
            setSuggestions(uniqueSuggestions.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    // Handles clicking a search suggestion.
    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setSuggestions([]);
    };

    // Filters cigars based on the search query.
    const filteredCigars = searchQuery
        ? cigars.filter(cigar =>
            cigar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cigar.brand.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [];
        
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
                            <div
                                key={suggestion}
                                onMouseDown={() => handleSuggestionClick(suggestion)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors cursor-pointer"
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* If there's no search query, show the list of humidors. Otherwise, show search results. */}
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
                            const humidorValue = cigarsInHumidor.reduce((sum, c) => sum + (c.quantity * c.price), 0);

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

const MyHumidor = ({ humidor, navigate, cigars, setCigars, humidors, setHumidors, theme }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedCigarIds, setSelectedCigarIds] = useState([]);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isDeleteHumidorModalOpen, setIsDeleteHumidorModalOpen] = useState(false); // State for humidor delete modal
    const [isDeleteCigarsModalOpen, setIsDeleteCigarsModalOpen] = useState(false); // State for selected cigars delete modal
    const [isExportModalOpen, setIsExportModalOpen] = useState(false); // State for export modal

    const cigarsInHumidor = cigars.filter(c => c.humidorId === humidor.id);
    const totalQuantity = cigarsInHumidor.reduce((sum, c) => sum + c.quantity, 0);
    // Calculate estimated value for cigars in this humidor
    const humidorValue = cigarsInHumidor.reduce((sum, c) => sum + (c.quantity * c.price), 0);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 1) {
            const allSuggestions = cigarsInHumidor
                .map(c => c.brand)
                .concat(cigarsInHumidor.map(c => c.name))
                .filter(name => name.toLowerCase().includes(query.toLowerCase()));
            
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

    const filteredCigars = cigarsInHumidor.filter(cigar =>
        cigar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cigar.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Toggles the ability to select multiple cigars.
    const handleToggleSelectMode = () => {
        setIsSelectMode(!isSelectMode);
        setSelectedCigarIds([]); // Clear selections when toggling mode
    };

    // Adds or removes a cigar from the selection.
    const handleSelectCigar = (cigarId) => {
        setSelectedCigarIds(prev =>
            prev.includes(cigarId)
                ? prev.filter(id => id !== cigarId)
                : [...prev, cigarId]
        );
    };

    // Moves the selected cigars to a new humidor.
    const handleMoveCigars = (destinationHumidorId) => {
        setCigars(prevCigars =>
            prevCigars.map(cigar =>
                selectedCigarIds.includes(cigar.id)
                    ? { ...cigar, humidorId: destinationHumidorId }
                    : cigar
            )
        );
        setIsMoveModalOpen(false);
        setIsSelectMode(false);
        setSelectedCigarIds([]);
        navigate('MyHumidor', { humidorId: destinationHumidorId });
    };

    // Function to handle the confirmed deletion of the humidor from its modal
    const handleConfirmDeleteHumidor = ({ action, destinationHumidorId }) => {
        switch (action) {
            case 'move':
                // Move cigars to the selected destination
                setCigars(prevCigars =>
                    prevCigars.map(cigar =>
                        cigar.humidorId === humidor.id
                            ? { ...cigar, humidorId: destinationHumidorId }
                            : cigar
                    )
                );
                break;
            case 'export':
            case 'deleteAll':
                // Delete all cigars associated with this humidor
                setCigars(prevCigars => prevCigars.filter(c => c.humidorId !== humidor.id));
                break;
            case 'deleteEmpty':
                // No cigars to worry about, just delete the humidor
                break;
            default:
                // Do nothing if action is unknown
                return;
        }

        // In all cases, delete the humidor itself
        setHumidors(prevHumidors => prevHumidors.filter(h => h.id !== humidor.id));
        
        // Close the modal and navigate back to the main Humidors screen
        setIsDeleteHumidorModalOpen(false);
        navigate('HumidorsScreen');
    };

    // Function to handle the confirmed deletion of selected cigars
    const handleConfirmDeleteCigars = () => {
        setCigars(prevCigars => prevCigars.filter(cigar => !selectedCigarIds.includes(cigar.id)));
        setIsDeleteCigarsModalOpen(false);
        setIsSelectMode(false);
        setSelectedCigarIds([]);
    };


    return (
        <div className="p-4 pb-24">
             {isMoveModalOpen && (
                <MoveCigarsModal
                    onClose={() => setIsMoveModalOpen(false)}
                    onMove={handleMoveCigars}
                    destinationHumidors={humidors.filter(h => h.id !== humidor.id)}
                    theme={theme}
                />
            )}
            {/* Render the DeleteHumidorModal */}
            <DeleteHumidorModal
                isOpen={isDeleteHumidorModalOpen}
                onClose={() => setIsDeleteHumidorModalOpen(false)}
                onConfirm={handleConfirmDeleteHumidor}
                humidor={humidor}
                cigarsInHumidor={cigarsInHumidor}
                otherHumidors={humidors.filter(h => h.id !== humidor.id)}
                theme={theme}
            />
            {/* Render the DeleteCigarsModal */}
            <DeleteCigarsModal
                isOpen={isDeleteCigarsModalOpen}
                onClose={() => setIsDeleteCigarsModalOpen(false)}
                onConfirm={handleConfirmDeleteCigars}
                count={selectedCigarIds.length}
                theme={theme}
            />
            {/* Render the ExportModal for current humidor's cigars */}
            {isExportModalOpen && (
                <ExportModal
                    cigars={cigarsInHumidor} // Pass only cigars in the current humidor
                    onClose={() => setIsExportModalOpen(false)}
                />
            )}

            <div className="flex items-center mb-4">
                {/* Back button to return to the list of humidors */}
                <button onClick={() => navigate('HumidorsScreen')} className="p-2 -ml-2 flex-shrink-0">
                    <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                {/* Humidor name, truncated if too long */}
                <h1 className="text-3xl font-bold text-white truncate flex-grow mx-2">{humidor.name}</h1>
            </div>
            {/* Toolbar for humidor actions */}
            <div className="flex justify-around items-center bg-gray-800/50 p-3 rounded-xl mb-6">
                {/* Button to navigate to the Edit Humidor screen */}
                <button 
                    onClick={() => navigate('EditHumidor', { humidorId: humidor.id })} 
                    className="flex-1 flex flex-col items-center gap-1 text-gray-300 hover:text-amber-400 transition-colors"
                >
                    <Edit className="w-5 h-5" />
                    <span className="text-xs font-medium">Edit</span>
                </button>
                {/* Button to navigate to the Add Cigar screen for this humidor */}
                <button 
                    onClick={() => navigate('AddCigar', { humidorId: humidor.id })} 
                    className="flex-1 flex flex-col items-center gap-1 text-gray-300 hover:text-amber-400 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span className="text-xs font-medium">Add Cigar</span>
                </button>
                {/* Export Button for current humidor */}
                <button 
                    onClick={() => setIsExportModalOpen(true)} 
                    className="flex-1 flex flex-col items-center gap-1 text-gray-300 hover:text-green-400 transition-colors"
                >
                    <Download className="w-5 h-5" />
                    <span className="text-xs font-medium">Export</span>
                </button>
                {/* UPDATED: Delete button now opens the humidor delete modal */}
                <button 
                    onClick={() => setIsDeleteHumidorModalOpen(true)} 
                    className="flex-1 flex flex-col items-center gap-1 text-gray-300 hover:text-red-500 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                    <span className="text-xs font-medium">Delete</span>
                </button>
            </div>
            
            {/* Refactored: Display Temperature, Humidity, and Estimated Cost in a single row */}
            <div className="flex justify-around items-center bg-gray-800/50 p-3 rounded-xl mb-6 text-center">
                {/* Humidity Display */}
                <div className="flex flex-col items-center">
                    <Droplets className="w-5 h-5 text-blue-400 mb-1" />
                    <p className="text-sm text-gray-400">Humidity</p>
                    <p className="font-bold text-white text-base">{humidor.humidity}%</p>
                </div>
                {/* Separator */}
                <div className="h-10 w-px bg-gray-700"></div>
                {/* Temperature Display */}
                <div className="flex flex-col items-center">
                    <Thermometer className="w-5 h-5 text-red-400 mb-1" />
                    <p className="text-sm text-gray-400">Temperature</p>
                    <p className="font-bold text-white text-base">{humidor.temp}°F</p>
                </div>
                {/* Separator */}
                <div className="h-10 w-px bg-gray-700"></div>
                {/* Estimated Value Display */}
                <div className="flex flex-col items-center">
                    {/* A custom SVG icon for the dollar sign */}
                    <svg className="w-5 h-5 text-green-400 mb-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <p className="text-sm text-gray-400">Est. Value</p>
                    <p className="font-bold text-white text-base">${humidorValue.toFixed(2)}</p>
                </div>
            </div>


            {/* Consolidated Search, View Mode, and Select/Cancel buttons */}
            <div className="flex items-center mb-4 gap-2"> {/* Reduced gap for compactness */}
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Search this humidor..." value={searchQuery} onChange={handleSearchChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 rounded-b-xl mt-1 z-20 overflow-hidden">
                            {suggestions.map(suggestion => (
                                <div
                                    key={suggestion}
                                    onMouseDown={() => handleSuggestionClick(suggestion)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors cursor-pointer"
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex bg-gray-800 border border-gray-700 rounded-full p-1 flex-shrink-0"> {/* Added flex-shrink-0 */}
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full transition-colors duration-200 ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-gray-400'}`}>
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-full transition-colors duration-200 ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-gray-400'}`}>
                        <List className="w-5 h-5" />
                    </button>
                </div>
                {/* Moved Select/Cancel button here */}
                <button onClick={handleToggleSelectMode} className="flex items-center gap-2 bg-gray-700 text-white font-bold text-sm px-4 py-2 rounded-full hover:bg-gray-600 transition-colors flex-shrink-0"> {/* Added flex-shrink-0 */}
                    {isSelectMode ? <X className="w-4 h-4"/> : <Check className="w-4 h-4" />}
                    {isSelectMode ? 'Cancel' : 'Select'}
                </button>
            </div>

            {/* Moved cigar counts here, below the consolidated search/view/select row */}
            <div className="flex justify-between items-center mb-6 px-2">
                <div>
                    <p className="text-sm text-gray-300"><span className="font-bold text-white">{filteredCigars.length}</span> Unique</p>
                    <p className="text-xs text-gray-400"><span className="font-bold text-gray-200">{totalQuantity}</span> Total Cigars</p>
                </div>
            </div>

            <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}>
                {filteredCigars.map(cigar => (
                    viewMode === 'grid'
                        ? <GridCigarCard key={cigar.id} cigar={cigar} navigate={navigate} isSelectMode={isSelectMode} isSelected={selectedCigarIds.includes(cigar.id)} onSelect={handleSelectCigar} />
                        : <ListCigarCard key={cigar.id} cigar={cigar} navigate={navigate} isSelectMode={isSelectMode} isSelected={selectedCigarIds.includes(cigar.id)} onSelect={handleSelectCigar} />
                ))}
                 {filteredCigars.length === 0 && (
                    <div className="col-span-full text-center py-10">
                        <p className="text-gray-400">No cigars found in this humidor.</p>
                         <button onClick={() => navigate('AddCigar', { humidorId: humidor.id })} className="mt-4 flex items-center mx-auto gap-2 bg-amber-500 text-white font-bold text-sm px-4 py-2 rounded-full hover:bg-amber-600 transition-colors">
                            <Plus className="w-4 h-4" />
                            Add First Cigar
                        </button>
                    </div>
                )}
            </div>
            {/* This bar appears at the bottom when in select mode and at least one cigar is selected */}
            {isSelectMode && selectedCigarIds.length > 0 && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 flex gap-2"> {/* Added flex and gap for buttons */}
                    <button onClick={() => setIsMoveModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 rounded-full hover:bg-amber-600 transition-colors shadow-lg">
                        <Move className="w-5 h-5"/>
                        Move ({selectedCigarIds.length})
                    </button>
                    {/* NEW: Delete Selected button */}
                    <button onClick={() => setIsDeleteCigarsModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-full hover:bg-red-700 transition-colors shadow-lg">
                        <Trash2 className="w-5 h-5"/>
                        Delete ({selectedCigarIds.length})
                    </button>
                </div>
            )}
        </div>
    );
};

const CigarDetail = ({ cigar, navigate, setCigars }) => {
    const [modalState, setModalState] = useState({ isOpen: false, type: null, content: '', isLoading: false });
    const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    // Increases or decreases the quantity of the current cigar.
    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 0) return;
        setCigars(prevCigars =>
            prevCigars.map(c =>
                c.id === cigar.id ? { ...c, quantity: newQuantity } : c
            )
        );
    };

    // Calls the Gemini API to get pairing suggestions.
    const handleSuggestPairings = async () => {
        setModalState({ isOpen: true, type: 'pairings', content: '', isLoading: true });
        const prompt = `You are a world-class sommelier and cigar expert. Given the following cigar:\n- Brand: ${cigar.brand}\n- Name: ${cigar.name}\n- Strength: ${cigar.strength}\n- Wrapper: ${cigar.wrapper}\n\nSuggest three diverse drink pairings (e.g., a spirit, a coffee, a non-alcoholic beverage). For each, provide a one-sentence explanation for why it works well. Format the response clearly with headings for each pairing.`;
        const result = await callGeminiAPI(prompt);
        setModalState({ isOpen: true, type: 'pairings', content: result, isLoading: false });
    };

    // Calls the Gemini API to generate a sample tasting note.
    const handleGenerateNote = async () => {
        setModalState({ isOpen: true, type: 'notes', content: '', isLoading: true });
        const prompt = `You are a seasoned cigar aficionado with a poetic command of language. Based on this cigar's profile:\n- Brand: ${cigar.brand}\n- Name: ${cigar.name}\n- Strength: ${cigar.strength}\n- Wrapper: ${cigar.wrapper}\n\nGenerate a short, evocative tasting note (2-3 sentences) that a user could use as inspiration for their own review. Focus on potential flavors and the overall experience.`;
        const result = await callGeminiAPI(prompt);
        setModalState({ isOpen: true, type: 'notes', content: result, isLoading: false });
    };

    // NEW: Calls the Gemini API to find similar cigars.
    const handleFindSimilar = async () => {
        setModalState({ isOpen: true, type: 'similar', content: '', isLoading: true });
        const prompt = `You are a cigar expert. A user likes the '${cigar.brand} ${cigar.name}'. Based on its profile (Strength: ${cigar.strength}, Wrapper: ${cigar.wrapper}, Filler: ${cigar.filler}, Origin: ${cigar.country}, Flavors: ${cigar.flavorNotes.join(', ')}), suggest 3 other cigars that they might also enjoy. For each suggestion, provide the Brand and Name, and a 1-sentence reason why it's a good recommendation. Format as a list.`;
        const result = await callGeminiAPI(prompt);
        setModalState({ isOpen: true, type: 'similar', content: result, isLoading: false });
    };

    const closeModal = () => setModalState({ isOpen: false, type: null, content: '', isLoading: false });

    const RatingBadge = ({ rating }) => {
        if (!rating || rating === 0) return null;
        const color = getRatingColor(rating);
        return (
            <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 ${color}`}>
                <span className="text-2xl font-bold text-white">{rating}</span>
                <span className="text-xs text-white/80 -mt-1">RATED</span>
            </div>
        );
    };
    
    const DetailItem = ({ label, value }) => (
        <div>
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-bold text-white text-sm">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div className="pb-24">
            {modalState.isOpen && <GeminiModal title={modalState.type === 'pairings' ? "Pairing Suggestions" : modalState.type === 'notes' ? "Tasting Note Idea" : "Similar Smokes"} content={modalState.content} isLoading={modalState.isLoading} onClose={closeModal} />}
            {isFlavorModalOpen && <FlavorNotesModal cigar={cigar} setCigars={setCigars} onClose={() => setIsFlavorModalOpen(false)} />}
            {isImageModalOpen && <ImageEditModal cigar={cigar} setCigars={setCigars} onClose={() => setIsImageModalOpen(false)} />}
            
            <div className="relative">
                <img src={cigar.image || `https://placehold.co/400x600/5a3825/ffffff?text=${cigar.brand.replace(/\s/g, '+')}`} alt={cigar.name} className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                    <button onClick={() => navigate('MyHumidor', { humidorId: cigar.humidorId })} className="p-2 bg-black/50 rounded-full">
                        <ChevronLeft className="w-7 h-7 text-white" />
                    </button>
                    <button onClick={() => navigate('EditCigar', { cigarId: cigar.id })} className="p-2 bg-black/50 rounded-full">
                        <Edit className="w-6 h-6 text-white" />
                    </button>
                </div>
                <button onClick={() => setIsImageModalOpen(true)} className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full">
                    <Edit className="w-5 h-5 text-white" />
                </button>
                <div className="absolute bottom-0 p-4">
                    <p className="text-gray-300 text-sm font-semibold uppercase">{cigar.brand}</p>
                    <h1 className="text-3xl font-bold text-white">{cigar.name}</h1>
                </div>
            </div>
            <div className="p-4 space-y-6">
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
                        {cigar.flavorNotes.map(note => (
                            <span key={note} className={`text-xs font-semibold px-3 py-1 rounded-full ${getFlavorTagColor(note)}`}>{note}</span>
                        ))}
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

const AddCigar = ({ navigate, setCigars, humidorId, theme }) => {
    const [formData, setFormData] = useState({
        brand: '', name: '', shape: '', size: '', wrapper: '', binder: '', filler: '', country: '', strength: '', price: '', rating: '', quantity: 1, image: ''
    });
    const [strengthSuggestions, setStrengthSuggestions] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = React.useRef(null);
    const [isAutofilling, setIsAutofilling] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'strength') {
            if (value) {
                const filtered = strengthOptions.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));
                setStrengthSuggestions(filtered);
            } else {
                setStrengthSuggestions([]);
            }
        }
    };

    const handleSuggestionClick = (value) => {
        setFormData({ ...formData, strength: value });
        setStrengthSuggestions([]);
    };
    
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData({...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        const newCigar = {
            id: Date.now(), // Use a timestamp for a unique ID
            humidorId: humidorId,
            ...formData,
            flavorNotes: Array.isArray(formData.flavorNotes) ? formData.flavorNotes : [],
            rating: Number(formData.rating) || 0,
            price: Number(formData.price) || 0,
            quantity: Number(formData.quantity) || 1,
        };
        setCigars(prev => [...prev, newCigar]);
        navigate('MyHumidor', { humidorId: humidorId });
    };
    
    // NEW: Function to auto-fill cigar details using Gemini
    const handleAutofill = async () => {
        if (!formData.name) {
            // Replaced alert with a more user-friendly message in the modal
            setModalState({ isOpen: true, content: "Please enter a cigar name in the 'Name / Line' field before attempting to auto-fill.", isLoading: false });
            return;
        }
        setIsAutofilling(true);
        const prompt = `You are a cigar database. Based on the cigar name "${formData.name}", provide its details as a JSON object. The schema MUST be: { "brand": "string", "shape": "string", "size": "string", "country": "string", "wrapper": "string", "binder": "string", "filler": "string", "strength": "Mild" | "Mild-Medium" | "Medium" | "Medium-Full" | "Full", "flavorNotes": ["string", "string", "string", "string"] }. If you cannot determine a value, use an empty string "" or an empty array []. Do not include any text or markdown formatting outside of the JSON object.`;
        
        const result = await callGeminiAPI(prompt);
        
        try {
            // Clean the result to get only the JSON part
            const jsonString = result.substring(result.indexOf('{'), result.lastIndexOf('}') + 1);
            const parsedData = JSON.parse(jsonString);
            
            setFormData(prevData => ({
                ...prevData,
                ...parsedData,
            }));

        } catch (error) {
            console.error("Failed to parse Gemini response:", error);
            setModalState({ isOpen: true, content: "Failed to parse auto-fill data. The AI might not have found enough information or returned an unexpected format. Please try a different cigar name or fill manually.", isLoading: false });
        }
        
        setIsAutofilling(false);
    };
    // State for the GeminiModal within AddCigar
    const [modalState, setModalState] = useState({ isOpen: false, content: '', isLoading: false });
    const closeModal = () => setModalState({ isOpen: false, content: '', isLoading: false });


    return (
        <div className="p-4 pb-24">
            {modalState.isOpen && <GeminiModal title="Auto-fill Status" content={modalState.content} isLoading={modalState.isLoading} onClose={closeModal} />}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('MyHumidor', { humidorId })} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className={`w-7 h-7 ${theme.text}`} />
                </button>
                <h1 className={`text-3xl font-bold ${theme.text}`}>Add New Cigar</h1>
            </div>

            <div className="space-y-4">
                <div className="flex justify-center mb-4">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                    <button onClick={() => fileInputRef.current.click()} className="w-32 h-40 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700 hover:border-amber-500 transition-colors overflow-hidden">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover"/>
                        ) : (
                            <>
                                <ImageIcon className="w-10 h-10 mb-2" />
                                <span className="text-xs text-center">Upload Image</span>
                            </>
                        )}
                    </button>
                </div>
                
                <InputField name="name" label="Name / Line" placeholder="e.g., 1964 Anniversary" value={formData.name} onChange={handleInputChange} theme={theme} />
                
                <button onClick={handleAutofill} disabled={isAutofilling} className="w-full flex items-center justify-center gap-2 bg-purple-600/20 border border-purple-500 text-purple-300 font-bold py-2 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50">
                    {isAutofilling ? <LoaderCircle className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5" />}
                    {isAutofilling ? 'Thinking...' : '✨ Auto-fill Details'}
                </button>

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
                                {strengthSuggestions.map(suggestion => (
                                    <div
                                        key={suggestion}
                                        onMouseDown={() => handleSuggestionClick(suggestion)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors cursor-pointer"
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <InputField name="price" label="Price Paid" placeholder="e.g., 15.50" type="number" value={formData.price} onChange={handleInputChange} theme={theme} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <InputField name="rating" label="Rating" placeholder="e.g., 94" type="number" value={formData.rating} onChange={handleInputChange} theme={theme} />
                    <InputField name="quantity" label="Quantity" placeholder="e.g., 5" type="number" value={formData.quantity} onChange={handleInputChange} theme={theme} />
                </div>

                <div className="pt-4 flex space-x-4">
                    <button
                        onClick={handleSave}
                        className={`w-full ${theme.primaryBg} ${theme.text === 'text-white' ? 'text-white' : 'text-black'} font-bold py-3 rounded-lg ${theme.hoverPrimaryBg} transition-colors`}
                    >
                        Save Cigar
                    </button>
                    <button
                        onClick={() => navigate('MyHumidor', { humidorId })}
                        className={`w-full ${theme.button} ${theme.text} font-bold py-3 rounded-lg transition-colors`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditCigar = ({ navigate, setCigars, cigar, theme }) => {
    const [formData, setFormData] = useState(cigar);
    const [strengthSuggestions, setStrengthSuggestions] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'strength') {
            if (value) {
                const filtered = strengthOptions.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));
                setStrengthSuggestions(filtered);
            } else {
                setStrengthSuggestions([]);
            }
        }
    };

    const handleSuggestionClick = (value) => {
        setFormData({ ...formData, strength: value });
        setStrengthSuggestions([]);
    };

    const handleSave = () => {
        setCigars(prev => prev.map(c => c.id === formData.id ? formData : c));
        navigate('CigarDetail', { cigarId: cigar.id });
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('CigarDetail', { cigarId: cigar.id })} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <h1 className="text-3xl font-bold text-white">Edit Cigar</h1>
            </div>

            <div className="space-y-4">
                <InputField name="brand" label="Brand" placeholder="e.g., Padrón" value={formData.brand} onChange={handleInputChange} theme={theme} />
                <InputField name="name" label="Name / Line" placeholder="e.g., 1964 Anniversary" value={formData.name} onChange={handleInputChange} theme={theme} />
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
                                {strengthSuggestions.map(suggestion => (
                                    <div
                                        key={suggestion}
                                        onMouseDown={() => handleSuggestionClick(suggestion)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors cursor-pointer"
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <InputField name="price" label="Price Paid" placeholder="e.g., 15.50" type="number" value={formData.price} onChange={handleInputChange} theme={theme} />
                </div>
                <InputField name="rating" label="Rating" placeholder="e.g., 94" type="number" value={formData.rating} onChange={handleInputChange} theme={theme} />

                <div className="pt-4 flex space-x-4">
                    <button
                        onClick={handleSave}
                        className="w-full bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={() => navigate('CigarDetail', { cigarId: cigar.id })}
                        className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};


const AlertsScreen = ({ navigate }) => {
    const [alertSettings, setAlertSettings] = useState(
        initialMockHumidors.map(h => ({
            humidorId: h.id,
            name: h.name,
            humidityAlert: false,
            minHumidity: 68,
            maxHumidity: 72,
            tempAlert: false,
            minTemp: 65,
            maxTemp: 70,
        }))
    );

    const handleToggle = (humidorId, type) => {
        setAlertSettings(prev =>
            prev.map(s =>
                s.humidorId === humidorId
                    ? { ...s, [type]: !s[type] }
                    : s
            )
        );
    };
    
    const handleValueChange = (humidorId, type, value) => {
         setAlertSettings(prev =>
            prev.map(s =>
                s.humidorId === humidorId
                    ? { ...s, [type]: value }
                    : s
            )
        );
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
            </div>
            <div className="space-y-6">
                {alertSettings.map(setting => (
                    <div key={setting.humidorId} className="bg-gray-800/50 p-4 rounded-xl">
                        <h3 className="font-bold text-xl text-amber-300 mb-4">{setting.name}</h3>
                        <div className="space-y-4">
                            {/* Humidity Alert */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Humidity Alert</span>
                                <button onClick={() => handleToggle(setting.humidorId, 'humidityAlert')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${setting.humidityAlert ? 'bg-amber-500' : 'bg-gray-600'}`}>
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${setting.humidityAlert ? 'translate-x-6' : 'translate-x-1'}`}/>
                                </button>
                            </div>
                            {setting.humidityAlert && (
                                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-700 ml-2">
                                    <div className="flex items-center space-x-2">
                                        <label className="text-sm text-gray-400">Min:</label>
                                        <input type="number" value={setting.minHumidity} onChange={(e) => handleValueChange(setting.humidorId, 'minHumidity', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                        <span className="text-gray-400">%</span>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <label className="text-sm text-gray-400">Max:</label>
                                        <input type="number" value={setting.maxHumidity} onChange={(e) => handleValueChange(setting.humidorId, 'maxHumidity', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                        <span className="text-gray-400">%</span>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-700"></div>

                            {/* Temperature Alert */}
                             <div className="flex justify-between items-center">
                                <span className="text-gray-300">Temperature Alert</span>
                                <button onClick={() => handleToggle(setting.humidorId, 'tempAlert')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${setting.tempAlert ? 'bg-amber-500' : 'bg-gray-600'}`}>
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${setting.tempAlert ? 'translate-x-6' : 'translate-x-1'}`}/>
                                </button>
                            </div>
                            {setting.tempAlert && (
                                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-700 ml-2">
                                    <div className="flex items-center space-x-2">
                                        <label className="text-sm text-gray-400">Min:</label>
                                        <input type="number" value={setting.minTemp} onChange={(e) => handleValueChange(setting.humidorId, 'minTemp', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                        <span className="text-gray-400">°F</span>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <label className="text-sm text-gray-400">Max:</label>
                                        <input type="number" value={setting.maxTemp} onChange={(e) => handleValueChange(setting.humidorId, 'maxTemp', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                        <span className="text-gray-400">°F</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AddHumidor = ({ navigate, setHumidors, theme }) => {
    const [formData, setFormData] = useState({ name: '', description: '', size: '', location: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const newHumidor = {
            id: Date.now(),
            ...formData,
            humidity: 70, // Default value
            temp: 68, // Default value
            image: `https://placehold.co/600x400/3a2d27/ffffff?text=${formData.name.replace(/\s/g, '+')}`,
            goveeDeviceId: null,
            goveeDeviceModel: null,
        };
        setHumidors(prev => [...prev, newHumidor]);
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

            <div className="space-y-4">
                <InputField name="name" label="Humidor Name" placeholder="e.g., The Big One" value={formData.name} onChange={handleInputChange} theme={theme} />
                <InputField name="description" label="Description" placeholder="e.g., Main aging unit" value={formData.description} onChange={handleInputChange} theme={theme} />
                <div className="grid grid-cols-2 gap-4">
                    <InputField name="size" label="Size" placeholder="e.g., 150-count" value={formData.size} onChange={handleInputChange} theme={theme} />
                    <InputField name="location" label="Location" placeholder="e.g., Office" value={formData.location} onChange={handleInputChange} theme={theme} />
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

// NEW: Component for editing an existing humidor's details.
const EditHumidor = ({ navigate, setHumidors, humidor, goveeApiKey, goveeDevices, theme }) => {
    const [formData, setFormData] = useState(humidor);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGoveeDeviceChange = (e) => {
        const selectedDeviceId = e.target.value;
        const selectedDevice = goveeDevices.find(d => d.device === selectedDeviceId);
        setFormData(prev => ({
            ...prev,
            goveeDeviceId: selectedDevice ? selectedDevice.device : null,
            goveeDeviceModel: selectedDevice ? selectedDevice.model : null,
        }));
    };

    const handleSave = () => {
        setHumidors(prev => prev.map(h => h.id === formData.id ? formData : h));
        navigate('MyHumidor', { humidorId: humidor.id });
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('MyHumidor', { humidorId: humidor.id })} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className={`w-7 h-7 ${theme.text}`} />
                </button>
                <h1 className={`text-3xl font-bold ${theme.text}`}>Edit Humidor</h1>
            </div>

            <div className="space-y-4">
                <InputField name="name" label="Humidor Name" placeholder="e.g., The Big One" value={formData.name} onChange={handleInputChange} theme={theme} />
                <InputField name="description" label="Description" placeholder="e.g., Main aging unit" value={formData.description} onChange={handleInputChange} theme={theme} />
                <div className="grid grid-cols-2 gap-4">
                    <InputField name="size" label="Size" placeholder="e.g., 150-count" value={formData.size} onChange={handleInputChange} theme={theme} />
                    <InputField name="location" label="Location" placeholder="e.g., Office" value={formData.location} onChange={handleInputChange} theme={theme} />
                </div>
                
                {/* Govee Integration Section */}
                <div>
                    <label className={`text-sm font-medium ${theme.subtleText} mb-1 block`}>Govee Sensor</label>
                    <select
                        value={formData.goveeDeviceId || ''}
                        onChange={handleGoveeDeviceChange}
                        disabled={!goveeApiKey || goveeDevices.length === 0} // Enabled only if API key is present AND devices are fetched
                        className={`w-full ${theme.inputBg} border ${theme.borderColor} rounded-lg py-2 px-3 ${theme.text} disabled:bg-gray-800 disabled:cursor-not-allowed`}
                    >
                        <option value="">
                            {!goveeApiKey ? "Connect Govee first" : (goveeDevices.length === 0 ? "No sensors found" : "Select a sensor")}
                        </option>
                        {goveeDevices.map(device => (
                            <option key={device.device} value={device.device}>
                                {device.deviceName} ({device.model})
                            </option>
                        ))}
                    </select>
                    {!goveeApiKey && (
                        <p className="text-xs text-red-300 mt-1">
                            Please connect your Govee API key in Integrations settings to link a sensor.
                        </p>
                    )}
                    {goveeApiKey && goveeDevices.length === 0 && (
                         <p className="text-xs text-yellow-300 mt-1">
                            No Govee sensors found with your API key. Ensure they are online and correctly configured in the Govee app.
                        </p>
                    )}
                </div>

                <div className="pt-4 flex space-x-4">
                    <button
                        onClick={handleSave}
                        className={`w-full ${theme.primaryBg} ${theme.text === 'text-white' ? 'text-white' : 'text-black'} font-bold py-3 rounded-lg ${theme.hoverPrimaryBg} transition-colors`}
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={() => navigate('MyHumidor', { humidorId: humidor.id })}
                        className={`w-full ${theme.button} ${theme.text} font-bold py-3 rounded-lg transition-colors`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};


const SettingsScreen = ({navigate, theme, setTheme}) => {
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    
    const SettingItem = ({icon: Icon, title, subtitle, onClick}) => (
        <button onClick={onClick} className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-left">
            <div className="p-2 bg-gray-700 rounded-full">
                <Icon className={`w-6 h-6 ${theme.primary}`} />
            </div>
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
        setGoveeDevices([]); // Clear previous devices

        if (!key) {
            setMessage('Please enter a Govee API Key.');
            setIsLoading(false);
            return;
        }

        try {
            const devices = await fetchGoveeDevices(key);
            if (devices.length > 0) {
                setGoveeApiKey(key); // Save the key if devices are found
                setGoveeDevices(devices);
                setStatus('Connected');
                setMessage(`Successfully connected! Found ${devices.length} Govee device(s).`);
            } else {
                setGoveeApiKey(''); // Clear key if no devices found or key is invalid
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
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className={`w-7 h-7 ${theme.text}`} />
                </button>
                <h1 className={`text-3xl font-bold ${theme.text}`}>Integrations</h1>
            </div>
            <div className="space-y-6">
                <div className={`${theme.card} p-4 rounded-xl`}>
                    <h3 className="font-bold text-xl text-amber-300 mb-2">Govee</h3>
                    <p className={`${theme.subtleText} text-sm mb-4`}>
                        Connect your Govee account to automatically sync temperature and humidity data from your Govee sensors.
                    </p>
                    <div className="space-y-2">
                        <label className={`text-sm font-medium ${theme.subtleText} mb-1 block`}>Govee API Key</label>
                        <input
                            type="text"
                            placeholder="Enter your Govee API Key (e.g., TEST_KEY_123)"
                            value={key}
                            onChange={(e) => { setKey(e.target.value); setStatus('Not Connected'); setMessage(''); }} // Reset status/message on key change
                            className={`w-full ${theme.inputBg} border ${theme.borderColor} rounded-lg py-2 px-3 ${theme.text} placeholder-gray-500 focus:outline-none focus:ring-2 ${theme.ring}`}
                        />
                        <p className={`${theme.subtleText} text-xs`}>You can get this from the Govee Home app under "About Us {'>'} Apply for API Key".</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <span className={`text-sm font-bold ${status === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>
                            Status: {isLoading ? 'Connecting...' : status}
                        </span>
                        <button
                            onClick={handleConnectGovee}
                            disabled={isLoading}
                            className={`flex items-center gap-2 ${theme.primaryBg} text-white font-bold text-sm px-4 py-2 rounded-full ${theme.hoverPrimaryBg} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4" />}
                            {isLoading ? 'Connecting...' : 'Connect'}
                        </button>
                    </div>
                    {message && (
                        <p className={`mt-3 text-sm ${status === 'Connected' ? 'text-green-300' : 'text-red-300'}`}>
                            {message}
                        </p>
                    )}
                     {goveeDevices.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-300 font-semibold mb-2">Found Devices:</p>
                            <ul className="list-disc list-inside text-gray-400 text-xs">
                                {goveeDevices.map(d => (
                                    <li key={d.device}>{d.deviceName} ({d.model})</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const DataSyncScreen = ({ navigate, setCigars, cigars, humidors }) => {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    return (
        <div className="p-4 pb-24">
            {isImportModalOpen && <ImportCsvModal humidors={humidors} setCigars={setCigars} navigate={navigate} onClose={() => setIsImportModalOpen(false)} />}
            {isExportModalOpen && <ExportModal cigars={cigars} onClose={() => setIsExportModalOpen(false)} />}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <h1 className="text-3xl font-bold text-white">Import & Export</h1>
            </div>
            <div className="space-y-6">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="font-bold text-amber-300 text-lg mb-2">Export Collection</h3>
                    <p className="text-sm text-gray-400 mb-4">Download your entire cigar inventory as a CSV or JSON file. This is great for backups or for use in other applications.</p>
                    <button onClick={() => setIsExportModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">
                        <Download className="w-5 h-5" />
                        Export Collection
                    </button>
                </div>
                 <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="font-bold text-amber-300 text-lg mb-2">Import Collection</h3>
                    <p className="text-sm text-gray-400 mb-4">Import cigars from a CSV file. Make sure the file matches the format of the exported data to avoid errors.</p>
                    <button onClick={() => setIsImportModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        <UploadCloud className="w-5 h-5" />
                        Import from CSV
                    </button>
                </div>
            </div>
        </div>
    );
};

const ImportCsvModal = ({ humidors, setCigars, onClose, navigate }) => {
    const [selectedHumidor, setSelectedHumidor] = useState(humidors[0]?.id || '');
    const fileInputRef = React.useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n').slice(1); // Skip header row
            const newCigars = lines.map((line, index) => {
                const columns = line.split(',');
                if (columns.length < 14) return null; // Basic validation
                return {
                    id: Date.now() + index,
                    humidorId: parseInt(selectedHumidor, 10),
                    name: columns[1],
                    brand: columns[2],
                    shape: columns[3],
                    size: columns[4],
                    country: columns[5],
                    wrapper: columns[6],
                    binder: columns[7],
                    filler: columns[8],
                    strength: columns[9],
                    flavorNotes: columns[10].replace(/"/g, '').split(';').map(s => s.trim()),
                    rating: parseInt(columns[11]) || 0,
                    quantity: parseInt(columns[12]) || 0,
                    price: parseFloat(columns[13]) || 0, 
                    image: ''
                };
            }).filter(Boolean); // Filter out any null entries from invalid rows

            setCigars(prev => [...prev, ...newCigars]);
            onClose();
            navigate('MyHumidor', { humidorId: parseInt(selectedHumidor, 10) });
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
                        <select
                            value={selectedHumidor}
                            onChange={(e) => setSelectedHumidor(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                        >
                            {humidors.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".csv" />
                    <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        <Upload className="w-5 h-5"/> Choose CSV File
                    </button>
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
            // Flavor notes are joined with a semicolon and wrapped in quotes to handle commas within the notes.
            acc.push([id, name, brand, shape, size, country, wrapper, binder, filler, strength, `"${flavorNotes.join(';')}"`, rating, quantity, price].join(','));
            return acc;
        }, []);
        downloadFile({
            data: [...headers, ...usersCsv].join('\n'),
            fileName: 'humidor_hub_export.csv',
            fileType: 'text/csv',
        });
        onClose();
    };

    const exportToJson = () => {
        downloadFile({
            data: JSON.stringify(cigars, null, 2), // Pretty-print the JSON
            fileName: 'humidor_hub_export.json',
            fileType: 'application/json',
        });
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
                    <button onClick={exportToCsv} className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">
                        Export as CSV
                    </button>
                    <button onClick={exportToJson} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Export as JSON
                    </button>
                </div>
            </div>
        </div>
    );
};

const AboutScreen = ({ navigate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', text: '' });

    const privacyPolicyText = "Your data is stored locally on your device and is not shared with any third parties. We respect your privacy.\n\nEffective Date: July 2, 2025";
    const termsOfServiceText = "By using Humidor Hub, you agree to track your cigars responsibly. This app is for informational purposes only. Enjoy your collection!\n\nLast Updated: July 2, 2025";

    const showModal = (type) => {
        if (type === 'privacy') {
            setModalContent({ title: 'Privacy Policy', text: privacyPolicyText });
        } else {
            setModalContent({ title: 'Terms of Service', text: termsOfServiceText });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="p-4 pb-24">
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-amber-400">{modalContent.title}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X /></button>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap">{modalContent.text}</p>
                    </div>
                </div>
            )}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <h1 className="text-3xl font-bold text-white">About Humidor Hub</h1>
            </div>
            <div className="space-y-6 bg-gray-800/50 p-6 rounded-xl">
                 <div className="flex flex-col items-center">
                    <Box className="w-16 h-16 text-amber-400 mb-4" />
                    <h2 className="text-2xl font-bold text-white">Humidor Hub</h2>
                    <p className="text-gray-400">Version 1.0.0</p>
                </div>
                <p className="text-gray-300 text-center">
                    Your personal assistant for managing and enjoying your cigar collection.
                </p>
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
    // useMemo calculates the user's top 5 flavor preferences, only re-running when cigars change.
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
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className="w-7 h-7 text-white" />
                </button>
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
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-amber-500 h-2.5 rounded-full" style={{width: '70%'}}></div>
                        </div>
                         <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Mild</span>
                            <span>Medium</span>
                            <span>Full</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h4 className="font-semibold text-white mb-2">Top Flavors</h4>
                        <div className="flex flex-wrap gap-2">
                            {topFlavors.map(note => (
                                <span key={note} className={`text-xs font-semibold px-3 py-1 rounded-full ${getFlavorTagColor(note)}`}>{note}</span>
                            ))}
                        </div>
                    </div>
                </div>
                 <button className="w-full flex items-center justify-center gap-2 bg-red-800/80 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors">
                    <LogOut className="w-5 h-5"/>
                    Log Out
                </button>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---
// This is the root component of the entire application.
export default function App() {
    // Top-level state for the whole application.
    // `navigation` object tracks the current screen and any parameters.
    const [navigation, setNavigation] = useState({ screen: 'Dashboard', params: {} });
    // `cigars` and `humidors` arrays hold all the application's data.
    const [cigars, setCigars] = useState(initialMockCigars);
    const [humidors, setHumidors] = useState(initialMockHumidors);
    // `theme` holds the currently selected theme object.
    const [theme, setTheme] = useState(themes["Humidor Hub"]);
    // `goveeApiKey` stores the user's Govee API key.
    const [goveeApiKey, setGoveeApiKey] = useState('');
    // NEW STATE: Stores fetched Govee devices
    const [goveeDevices, setGoveeDevices] = useState([]);

    /**
     * The main navigation function. It's passed down to child components
     * so they can change screens.
     * @param {string} screen - The name of the screen to navigate to.
     * @param {object} params - Any data to pass to the new screen.
     */ 
    const navigate = (screen, params = {}) => {
        window.scrollTo(0, 0); // Scroll to the top of the page on every navigation.
        setNavigation({ screen, params });
    };

    /**
     * This function acts as a router. It reads the `navigation` state
     * and returns the correct screen component to display.
     */
    const renderScreen = () => {
        const { screen, params } = navigation;
        switch (screen) {
            case 'Dashboard':
                return <Dashboard navigate={navigate} cigars={cigars} theme={theme} />;
            case 'HumidorsScreen':
                return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} />;
            case 'MyHumidor':
                const humidor = humidors.find(h => h.id === params.humidorId);
                // Ensure humidor exists before rendering
                if (!humidor) return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} />; 
                return <MyHumidor humidor={humidor} navigate={navigate} cigars={cigars} setCigars={setCigars} humidors={humidors} setHumidors={setHumidors} theme={theme} />;
            case 'CigarDetail':
                const cigar = cigars.find(c => c.id === params.cigarId);
                if (!cigar) return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} />; // Fallback
                return <CigarDetail cigar={cigar} navigate={navigate} setCigars={setCigars} theme={theme} />;
            case 'Alerts':
                return <AlertsScreen navigate={navigate} theme={theme} />;
            case 'Settings':
                return <SettingsScreen navigate={navigate} setTheme={setTheme} theme={theme} />;
            case 'Integrations':
                return <IntegrationsScreen navigate={navigate} goveeApiKey={goveeApiKey} setGoveeApiKey={setGoveeApiKey} goveeDevices={goveeDevices} setGoveeDevices={setGoveeDevices} theme={theme} />;
            case 'DataSync':
                return <DataSyncScreen navigate={navigate} setCigars={setCigars} cigars={cigars} humidors={humidors} theme={theme} />;
            case 'About':
                return <AboutScreen navigate={navigate} theme={theme} />;
            case 'Profile':
                return <ProfileScreen navigate={navigate} cigars={cigars} theme={theme} />;
            case 'AddCigar':
                 const humidorForNewCigar = humidors.find(h => h.id === params.humidorId);
                 if (!humidorForNewCigar) return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} />; // Fallback
                return <AddCigar navigate={navigate} setCigars={setCigars} humidorId={params.humidorId} theme={theme} />;
            case 'EditCigar':
                 const cigarToEdit = cigars.find(c => c.id === params.cigarId);
                 if (!cigarToEdit) return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} />; // Fallback
                return <EditCigar cigar={cigarToEdit} navigate={navigate} setCigars={setCigars} theme={theme} />;
            case 'AddHumidor':
                 return <AddHumidor navigate={navigate} setHumidors={setHumidors} theme={theme} />;
            // FIXED: Added routing for the EditHumidor screen
            case 'EditHumidor':
                 const humidorToEdit = humidors.find(h => h.id === params.humidorId);
                 if (!humidorToEdit) return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} />; // Fallback
                return <EditHumidor humidor={humidorToEdit} navigate={navigate} setHumidors={setHumidors} goveeApiKey={goveeApiKey} goveeDevices={goveeDevices} theme={theme} />;
            default:
                return <Dashboard navigate={navigate} cigars={cigars} theme={theme} />;
        }
    };

    // This is the final JSX that gets rendered to the DOM.
    return (
        // The main container div applies the current theme's background and text colors.
        <div className={`font-sans antialiased ${theme.bg} ${theme.text} min-h-screen`} style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23a0522d\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
            {/* This inner container centers the app and gives it a max-width. */}
            <div className={`max-w-md mx-auto ${theme.bg}/95 min-h-screen shadow-2xl shadow-black relative`}>
                {/* Fades at the top and bottom for a nicer visual effect */}
                <div className="fixed top-0 left-0 right-0 max-w-md mx-auto h-8 z-50" style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)'}}></div>
                
                {/* Call the renderScreen function to display the current page */}
                {renderScreen()}
                
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-24 z-40" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'}}></div>
                
                {/* Render the bottom navigation bar */}
                <BottomNav activeScreen={navigation.screen} navigate={navigate} theme={theme} />
            </div>
        </div>
    );
}
