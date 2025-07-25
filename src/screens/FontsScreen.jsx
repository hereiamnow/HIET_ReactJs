// File: FontsScreen.js
// Path: src/screens/FontsScreen.js
// Project: Humidor Hub
// Author: Extracted from App.js
// Date: July 23, 2025

// Description:
// A dedicated screen for font customization that allows users to preview and apply
// different font combinations throughout the app. Features local preview state management,
// save/cancel functionality, and integrates with the FontPicker component for font selection.
// Provides a user-friendly interface for typography customization with live preview capabilities.

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import FontPicker from '../components/Settings/FontPicker';

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

export default FontsScreen;