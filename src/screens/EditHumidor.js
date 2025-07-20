// File: EditHumidor.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 20, 2025
// Time: 10:01 PM CDT

// Description: Edit Humidor screen component - form for editing existing humidors
// with validation, Firebase integration, and Govee device selection

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Upload, Trash2 } from 'lucide-react';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import InputField from '../components/UI/InputField';
import TextAreaField from '../components/UI/TextAreaField';
import ImageUploadModal from '../components/Modals/Forms/ImageUploadModal';
import DeleteHumidorModal from '../components/Modals/Actions/DeleteHumidorModal';

const EditHumidor = ({ navigate, db, appId, userId, humidor, goveeApiKey, goveeDevices, theme }) => {
    const humidorTypes = ["Desktop Humidor", "Cabinet Humidor", "Glass Top Humidor", "Travel Humidor", "Cigar Cooler", "Walk-In Humidor", "Personalized Humidor"];
    const [formData, setFormData] = useState({
        name: humidor.name || '',
        type: humidor.type || '',
        size: humidor.size || '',
        capacity: humidor.capacity?.toString() || '',
        location: humidor.location || '',
        description: humidor.description || '',
        image: humidor.image || '',
        temperature: humidor.temperature?.toString() || '',
        humidity: humidor.humidity?.toString() || '',
        goveeDevice: humidor.goveeDevice || ''
    });
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (imageUrl) => {
        setFormData(prev => ({ ...prev, image: imageUrl }));
        setIsImageModalOpen(false);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            alert('Please enter a humidor name.');
            return;
        }

        setIsSaving(true);
        try {
            const updateData = {
                ...formData,
                capacity: formData.capacity ? parseInt(formData.capacity) : null,
                temperature: formData.temperature ? parseFloat(formData.temperature) : null,
                humidity: formData.humidity ? parseFloat(formData.humidity) : null,
                lastModified: new Date().toISOString()
            };

            await updateDoc(doc(db, `apps/${appId}/users/${userId}/humidors`, humidor.id), updateData);
            navigate('MyHumidor', { humidorId: humidor.id });
        } catch (error) {
            console.error('Error updating humidor:', error);
            alert('Failed to update humidor. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, `apps/${appId}/users/${userId}/humidors`, humidor.id));
            navigate('Dashboard');
        } catch (error) {
            console.error('Error deleting humidor:', error);
            alert('Failed to delete humidor. Please try again.');
        }
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('MyHumidor', { humidorId: humidor.id })}
                        className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Edit Humidor</h1>
                </div>
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                <InputField
                    label="Humidor Name"
                    value={formData.name}
                    onChange={(value) => handleInputChange('name', value)}
                    placeholder="Enter humidor name"
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Humidor Type
                    </label>
                    <select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                        <option value="">Select type</option>
                        {humidorTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <InputField
                    label="Size"
                    value={formData.size}
                    onChange={(value) => handleInputChange('size', value)}
                    placeholder="e.g., 12x8x4 inches"
                />

                <InputField
                    label="Capacity"
                    value={formData.capacity}
                    onChange={(value) => handleInputChange('capacity', value)}
                    placeholder="Number of cigars"
                    type="number"
                />

                <InputField
                    label="Location"
                    value={formData.location}
                    onChange={(value) => handleInputChange('location', value)}
                    placeholder="Where is this humidor located?"
                />

                <TextAreaField
                    label="Description"
                    value={formData.description}
                    onChange={(value) => handleInputChange('description', value)}
                    placeholder="Additional details about this humidor"
                    rows={3}
                />

                {/* Image Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Image
                    </label>
                    <div className="flex items-center space-x-4">
                        {formData.image && (
                            <img
                                src={formData.image}
                                alt="Humidor"
                                className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                            />
                        )}
                        <button
                            onClick={() => setIsImageModalOpen(true)}
                            className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {formData.image ? 'Change Image' : 'Add Image'}
                        </button>
                        {formData.image && (
                            <button
                                onClick={() => handleInputChange('image', '')}
                                className="text-red-400 hover:text-red-300 transition-colors"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>

                {/* Environmental Settings */}
                <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-medium text-white mb-4">Environmental Settings</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Temperature (°F)"
                            value={formData.temperature}
                            onChange={(value) => handleInputChange('temperature', value)}
                            placeholder="70"
                            type="number"
                            step="0.1"
                        />

                        <InputField
                            label="Humidity (%)"
                            value={formData.humidity}
                            onChange={(value) => handleInputChange('humidity', value)}
                            placeholder="70"
                            type="number"
                            step="0.1"
                        />
                    </div>

                    {/* Govee Device Selection */}
                    {goveeDevices && goveeDevices.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Govee Device
                            </label>
                            <select
                                value={formData.goveeDevice}
                                onChange={(e) => handleInputChange('goveeDevice', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                            >
                                <option value="">No device selected</option>
                                {goveeDevices.map(device => (
                                    <option key={device.device} value={device.device}>
                                        {device.deviceName} ({device.model})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(!goveeDevices || goveeDevices.length === 0) && (
                        <InputField
                            label="Govee Device ID (Optional)"
                            value={formData.goveeDevice}
                            onChange={(value) => handleInputChange('goveeDevice', value)}
                            placeholder="AA:BB:CC:DD:EE:FF"
                        />
                    )}
                </div>

                {/* Save Button */}
                <div className="pt-6">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !formData.name.trim()}
                        className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors"
                    >
                        {isSaving ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="w-5 h-5 mr-2" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Image Upload Modal */}
            <ImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onImageUpload={handleImageUpload}
                theme={theme}
            />

            {/* Delete Confirmation Modal */}
            <DeleteHumidorModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                humidorName={humidor.name}
                theme={theme}
            />
        </div>
    );
};

export default EditHumidor;