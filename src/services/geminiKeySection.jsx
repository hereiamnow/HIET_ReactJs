// File: GeminiKeySection.jsx
// Path: src\services\geminiKeySection.jsx
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 26, 2025
// Time: 3:06 PM CDT


/**
 * A React component that provides a secure interface for users to manage their
 * personal Gemini API key. This component allows users to input, validate, save,
 * and clear their API key for use with Google's Gemini AI services.
 * 
 * Features:
 * - Secure password-style input field for API key entry
 * - Client-side validation using regex pattern matching
 * - Local storage persistence for user convenience
 * - Visual feedback for save/error states
 * - Clear functionality to remove stored keys
 * - Responsive design with Tailwind CSS styling
 * 
 * Security Notes:
 * - API keys are stored in localStorage (client-side only)
 * - Input field uses password type to prevent shoulder surfing
 * - Keys are validated before storage to prevent malformed entries
 * 
 * Usage:
 * This component is typically used in settings or configuration screens
 * where users need to provide their own API credentials for enhanced
 * functionality or quota management.
 * 
 * @component
 * @returns {JSX.Element} The GeminiKeySection component
 */

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Constants for localStorage key and API key validation
const API_KEY_STORAGE = 'userGeminiApiKey';
const API_KEY_PATTERN = /^[A-Za-z0-9_-]{20,}$/; // Regex pattern for Gemini API key format validation

export default function GeminiKeySection() {
    // State management for component
    const [apiKey, setApiKey] = useState(''); // Current API key input value
    const [status, setStatus] = useState(null); // Status indicator: 'success' | 'error' | null
    const [message, setMessage] = useState(''); // User feedback message
    const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility

    console.log('GeminiKeySection: Component rendered');

    // Effect hook to load saved API key from localStorage on component mount
    useEffect(() => {
        console.log('GeminiKeySection: Loading saved API key from localStorage');
        const saved = localStorage.getItem(API_KEY_STORAGE) || '';

        if (saved) {
            console.log('GeminiKeySection: Found saved API key, length:', saved.length);
            setApiKey(saved);
        } else {
            console.log('GeminiKeySection: No saved API key found');
        }
    }, []);

    /**
     * Validates the API key format using regex pattern
     * @param {string} key - The API key to validate
     * @returns {boolean} - True if key matches expected format
     */
    const validateKey = (key) => {
        const isValid = API_KEY_PATTERN.test(key);
        console.log('GeminiKeySection: Validating API key, length:', key.length, 'isValid:', isValid);
        return isValid;
    };

    /**
     * Handles saving the API key to localStorage
     * Validates the key before saving and provides user feedback
     */
    const handleSave = () => {
        console.log('GeminiKeySection: Save button clicked, attempting to save API key');

        // Validate the API key format before saving
        if (!validateKey(apiKey)) {
            console.log('GeminiKeySection: API key validation failed');
            setStatus('error');
            setMessage('Invalid key format. Please check and try again.');
            return;
        }

        // Save to localStorage and update UI state
        try {
            localStorage.setItem(API_KEY_STORAGE, apiKey);
            console.log('GeminiKeySection: API key saved successfully to localStorage');
            setStatus('success');
            setMessage('API key saved successfully.');
        } catch (error) {
            console.error('GeminiKeySection: Error saving API key to localStorage:', error);
            setStatus('error');
            setMessage('Failed to save API key. Please try again.');
        }
    };

    /**
     * Handles clearing the API key from localStorage and resetting component state
     */
    const handleClear = () => {
        console.log('GeminiKeySection: Clear button clicked, removing API key');

        try {
            localStorage.removeItem(API_KEY_STORAGE);
            console.log('GeminiKeySection: API key removed from localStorage');

            // Reset all component state
            setApiKey('');
            setStatus(null);
            setMessage('');
        } catch (error) {
            console.error('GeminiKeySection: Error clearing API key from localStorage:', error);
        }
    };

    /**
     * Toggles the password visibility state
     */
    const togglePasswordVisibility = () => {
        console.log('GeminiKeySection: Toggling password visibility, current state:', showPassword);
        setShowPassword(!showPassword);
    };

    return (
        <section className="p-6 bg-gray-800/50 rounded-xl shadow-lg max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-white">
                Gemini API Key
            </h2>
            <p className="mt-2 text-gray-400 text-sm">
                Paste your personal Gemini API key to use your own quota and customize your experience.
            </p>

            <div className="mt-4 relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => {
                        setApiKey(e.target.value);
                        setStatus(null);
                    }}
                    placeholder="Enter your Gemini API key"
                    className="w-full px-4 py-2 pr-12 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors"
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none focus:text-white transition-colors"
                    aria-label={showPassword ? "Hide API key" : "Show API key"}
                >
                    {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                    ) : (
                        <Eye className="w-5 h-5" />
                    )}
                </button>
            </div>

            <div className="mt-4 flex space-x-2">
                <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
                >
                    Save Key
                </button>
                <button
                    onClick={handleClear}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                >
                    Clear Key
                </button>
            </div>

            {status && (
                <p
                    className={`mt-3 text-sm font-medium ${status === 'success' ? 'text-green-400' : 'text-red-400'
                        }`}
                >
                    {message}
                </p>
            )}

            <p className="mt-6 text-xs text-gray-500">
                Your key is stored securely and never shared.
            </p>
        </section>
    );
}