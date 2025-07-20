/**
 * Simple test utility to verify Gemini API configuration
 */

import { firebaseConfigExport } from '../firebase';

/**
 * Test function to verify Gemini API is working
 * @returns {Promise<Object>} Test result with success status and message
 */
export const testGeminiAPI = async () => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY || firebaseConfigExport.apiKey;
    
    if (!apiKey) {
        return {
            success: false,
            message: "No API key found. Please set REACT_APP_GEMINI_API_KEY in your .env file."
        };
    }

    if (apiKey === 'your_gemini_api_key_here') {
        return {
            success: false,
            message: "Please replace 'your_gemini_api_key_here' with your actual Gemini API key in the .env file."
        };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const testPayload = {
        contents: [{
            role: "user",
            parts: [{ text: "Say 'Hello, Gemini API is working!' in exactly those words." }]
        }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            return {
                success: false,
                message: `API Error (${response.status}): ${errorBody.error?.message || 'Unknown error'}`,
                details: errorBody
            };
        }

        const result = await response.json();
        
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return {
                success: true,
                message: "Gemini API is working correctly!",
                response: result.candidates[0].content.parts[0].text
            };
        } else {
            return {
                success: false,
                message: "API responded but with unexpected format",
                details: result
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Network error: ${error.message}`,
            error: error
        };
    }
};