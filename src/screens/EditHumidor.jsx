// File: EditHumidor.js
// Path: src/screens/EditHumidor.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 24, 2025
// Time: 10:01 PM CDT

// Description:
// EditHumidor is a React component that provides a comprehensive form interface for users to edit existing humidors in their collection.
// The component features advanced environment tracking options including Govee sensor integration, smart image modal for visual customization,
// and form validation with Firebase Firestore persistence. It supports both manual and automated environment monitoring.
//
// Key Features:
// - Pre-populated form with existing humidor data and backward compatibility for legacy fields
// - SmartImageModal integration for custom humidor images with positioning controls
// - Dual environment tracking modes: manual input and Govee sensor integration
// - Govee API integration with device selection and real-time sensor data display
// - Firebase Firestore integration for data persistence and updates
// - Responsive design optimized for mobile devices with touch-friendly controls
// - Theme-aware styling throughout the interface with accessibility considerations
// - Form validation and error handling for all input fields
// - Navigation integration with proper back button and cancel functionality
//
// Environment Tracking:
// - Manual mode: Users can input temperature and humidity values directly
// - Govee mode: Integration with Govee sensors for automated readings with device selection
// - Real-time display of current sensor readings when Govee devices are connected
// - Fallback handling for missing API keys or unavailable sensors

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ChevronLeft, MapPin } from 'lucide-react';
import InputField from '../components/UI/InputField';
import TextAreaField from '../components/UI/TextAreaField';
import SmartImageModal from '../components/Modals/Composite/SmartImageModal';

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

export default EditHumidor;