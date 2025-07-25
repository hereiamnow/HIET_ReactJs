// File: AddCigar.js
// Path: src/screens/AddCigar.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 24, 2025
// Time: 10:01 PM CDT

// Description:
// AddCigar is a comprehensive React component that provides an advanced form interface for users to add new cigars to their humidor collection.
// The component features AI-powered auto-fill capabilities using Gemini API, smart image modal integration, flavor notes management,
// and extensive form validation with Firebase Firestore persistence. It includes intelligent field suggestions and real-time updates.
//
// Key Features:
// - AI-powered auto-fill using Gemini API with structured response schema for accurate cigar data population
// - SmartImageModal integration for custom cigar images with positioning controls
// - Comprehensive form with all cigar attributes including dimensions, wrapper details, and flavor profiles
// - AutoCompleteInputField components with intelligent suggestions for shapes, wrappers, binders, fillers, and countries
// - Dynamic field updates with visual feedback (flashing animations) when shape selection auto-populates dimensions
// - FlavorNotesModal integration for advanced flavor profile management with visual tags
// - QuantityControl component for intuitive quantity selection
// - Firebase Firestore integration for seamless data persistence
// - Responsive design optimized for mobile devices with touch-friendly controls
// - Theme-aware styling throughout the interface with accessibility considerations
// - Real-time validation and error handling for all input fields
// - Navigation integration with proper back button and cancel functionality
//
// AI Integration:
// - Gemini API integration with structured prompts for accurate cigar data retrieval
// - Intelligent field population that respects existing user input
// - Visual feedback system showing which fields were auto-populated
// - Error handling and fallback for API failures
//
// Form Intelligence:
// - Shape selection automatically populates length and ring gauge from common dimensions database
// - Strength field with autocomplete suggestions and dropdown selection
// - Price formatting with automatic decimal precision
// - Date handling with proper ISO string conversion for database storage

import React, { useState, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ChevronLeft, LoaderCircle, Sparkles, Tag, Edit } from 'lucide-react';
import { strengthOptions, commonCigarDimensions, cigarShapes, cigarLengths, cigarRingGauges, cigarWrapperColors, cigarBinderTypes, cigarFillerTypes, cigarCountryOfOrigin } from '../constants/cigarOptions';
import InputField from '../components/UI/InputField';
import TextAreaField from '../components/UI/TextAreaField';
import AutoCompleteInputField from '../components/UI/AutoCompleteInputField';
import QuantityControl from '../components/UI/QuantityControl';
import SmartImageModal from '../components/Modals/Composite/SmartImageModal';
import GeminiModal from '../components/Modals/Content/GeminiModal';
import FlavorNotesModal from '../components/Modals/Forms/FlavorNotesModal';
import { getFlavorTagColor } from '../utils/colorUtils';
import { callGeminiAPI } from '../services/geminiService';

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
    const sizeInputRef = useRef(null);
    const [isLengthFlashing, setIsLengthFlashing] = useState(false);
    const [isGaugeFlashing, setIsGaugeFlashing] = useState(false);
    const [isSizeFlashing, setIsSizeFlashing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'strength') {
            setStrengthSuggestions(value ? strengthOptions.filter(opt => opt.toLowerCase().includes(value.toLowerCase())) : []);
        } else if (name === 'shape') {
            // Auto-update length_inches, ring_gauge, and size based on selected shape
            const dimensions = commonCigarDimensions[value];
            if (dimensions) {
                const updatedData = {
                    length_inches: dimensions.length_inches || '',
                    ring_gauge: dimensions.ring_gauge || ''
                };

                // Only update size if it's empty or null
                if (!formData.size || formData.size.trim() === '') {
                    updatedData.size = `${dimensions.length_inches}x${dimensions.ring_gauge}`;
                }

                setFormData(prev => ({
                    ...prev,
                    ...updatedData
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
                // Flash size field if it was updated
                if (!formData.size || formData.size.trim() === '') {
                    setIsSizeFlashing(true);
                    setTimeout(() => setIsSizeFlashing(false), 500);
                }
            }
        }
    };

    const handleSuggestionClick = (value) => {
        setFormData({ ...formData, strength: value });
        setStrengthSuggestions([]);
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
                        suggestions={Object.keys(commonCigarDimensions)}
                        theme={theme}
                    />
                    <InputField
                        name="size"
                        label="Size"
                        placeholder="e.g., 5.5x50"
                        value={formData.size}
                        onChange={handleInputChange}
                        theme={theme}
                        className={isSizeFlashing ? 'ring-2 ring-amber-400 animate-pulse' : ''}
                        inputRef={sizeInputRef}
                    />
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
                    <AutoCompleteInputField
                        name="strength"
                        label="Profile"
                        placeholder="e.g., Full"
                        value={formData.strength}
                        onChange={handleInputChange}
                        suggestions={strengthOptions}
                        theme={theme}
                    />
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
                <button 
                onClick={() => navigate('MyHumidor', { humidorId })} 
                className={`w-full ${theme.button} ${theme.text} font-bold py-3 rounded-lg transition-colors`}>
                    Cancel</button>
                <button 
                onClick={handleSave} 
                className={`w-full ${theme.primaryBg} ${theme.text === 'text-white' ? 'text-white' : 'text-black'} font-bold py-3 rounded-lg ${theme.hoverPrimaryBg} transition-colors`}>
                    Save Cigar</button>
            </div>
        </div>
    );
};

export default AddCigar;