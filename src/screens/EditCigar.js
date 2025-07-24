// File: EditCigar.js
// Path: src/screens/EditCigar.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 24, 2025
// Time: 2:30 PM CDT

// Description:
// EditCigar component provides a comprehensive form interface for editing existing cigar records.
// Features include auto-fill functionality using AI, real-time field validation, flavor notes management,
// smart image handling, and dynamic form updates based on cigar shape selection. The component integrates
// with Firebase Firestore for data persistence and includes visual feedback for user interactions.

import React, { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ChevronLeft, LoaderCircle, Sparkles, Tag, Edit } from 'lucide-react';

// Import constants
import {
    strengthOptions,
    commonCigarDimensions,
    cigarShapes,
    cigarLengths,
    cigarRingGauges,
    cigarWrapperColors,
    cigarBinderTypes,
    cigarFillerTypes,
    cigarCountryOfOrigin
} from '../constants/cigarOptions';

// Import UI components
import QuantityControl from '../components/UI/QuantityControl';
import InputField from '../components/UI/InputField';
import TextAreaField from '../components/UI/TextAreaField';
import AutoCompleteInputField from '../components/UI/AutoCompleteInputField';

// Import modal components
import GeminiModal from '../components/Modals/Content/GeminiModal';
import FlavorNotesModal from '../components/Modals/Forms/FlavorNotesModal';
import SmartImageModal from '../components/Modals/Composite/SmartImageModal';

// Import utilities
import { getFlavorTagColor } from '../utils/colorUtils';

// Import services
import { callGeminiAPI } from '../services/geminiService';

const EditCigar = ({ navigate, db, appId, userId, cigar, theme }) => {
    const [formData, setFormData] = useState({
        ...cigar,
        shortDescription: cigar.shortDescription || '',
        description: cigar.description || '',
        flavorNotes: cigar.flavorNotes || [],
        dateAdded: cigar.dateAdded ? cigar.dateAdded.split('T')[0] : new Date().toISOString().split('T')[0],
        length_inches: cigar.length_inches || '',
        ring_gauge: cigar.ring_gauge || ''
    });
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

export default EditCigar;