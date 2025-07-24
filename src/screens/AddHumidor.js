// File: AddHumidor.js
// Path: src/screens/AddHumidor.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 24, 2025
// Time: 10:01 PM CDT

// Description:
// AddHumidor is a React component that provides a comprehensive form interface for users to add new humidors to their collection.
// The component features a smart image modal for visual customization, environment tracking options, and form validation.
// It integrates with Firebase Firestore for data persistence and includes responsive design elements optimized for mobile devices.
//
// Key Features:
// - Dynamic form with controlled inputs for humidor details (name, description, size, location, type)
// - SmartImageModal integration for custom humidor images with positioning
// - Environment tracking toggle with temperature and humidity controls
// - Firebase Firestore integration for data persistence
// - Responsive design with mobile-first approach
// - Theme-aware styling and accessibility considerations
// - Navigation integration with back button and cancel functionality

import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ChevronLeft, Thermometer } from 'lucide-react';
import InputField from '../components/UI/InputField';
import TextAreaField from '../components/UI/TextAreaField';
import SmartImageModal from '../components/Modals/Composite/SmartImageModal';

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

export default AddHumidor;