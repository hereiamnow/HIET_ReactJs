// File: FontPicker.js
// Path: src/components/Settings/FontPicker.js
// Project: Humidor Hub
// Author: Extracted from App.js
// Date: July 23, 2025

// Description:
// A font selection component that provides a dropdown for choosing font combinations
// and displays a live preview of heading and body text styles. Used in the FontsScreen
// to allow users to customize the app's typography. Features real-time preview updates
// and proper theming integration for consistent styling across the application.

import React from 'react';
import { fontOptions } from '../../constants/fontOptions';

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

export default FontPicker;