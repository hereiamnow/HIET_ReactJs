// src/components/GeminiKeySection.jsx
import React, { useState, useEffect } from 'react';

const API_KEY_STORAGE = 'userGeminiApiKey';
const API_KEY_PATTERN = /^[A-Za-z0-9_-]{20,}$/; // adjust pattern to your key format

export default function GeminiKeySection() {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState(null);      // 'success' | 'error' | null
  const [message, setMessage] = useState('');

  // Load saved key on mount
  useEffect(() => {
    const saved = localStorage.getItem(API_KEY_STORAGE) || '';
    if (saved) setApiKey(saved);
  }, []);

  const validateKey = (key) => API_KEY_PATTERN.test(key);

  const handleSave = () => {
    if (!validateKey(apiKey)) {
      setStatus('error');
      setMessage('Invalid key format. Please check and try again.');
      return;
    }
    localStorage.setItem(API_KEY_STORAGE, apiKey);
    setStatus('success');
    setMessage('API key saved successfully.');
  };

  const handleClear = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey('');
    setStatus(null);
    setMessage('');
  };

  return (
    <section className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-gray-800">
        Gemini API Key
      </h2>
      <p className="mt-2 text-gray-600 text-sm">
        Paste your personal Gemini API key to use your own quota and customize your experience.
      </p>

      <div className="mt-4">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setStatus(null);
          }}
          placeholder="Enter your Gemini API key"
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          Save Key
        </button>
        <button
          onClick={handleClear}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Clear Key
        </button>
      </div>

      {status && (
        <p
          className={`mt-3 text-sm ${
            status === 'success' ? 'text-green-600' : 'text-red-600'
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