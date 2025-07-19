/**
 * GeminiModal - A pop-up used to display content fetched from the Gemini API
 * @param {Object} props - Component props
 * @param {string} props.title - The title to display in the modal header
 * @param {string} props.content - The content text to display in the modal body
 * @param {boolean} props.isLoading - Whether the modal is in a loading state
 * @param {Function} props.onClose - Function to call when the modal should be closed
 */
import React from 'react';
import { LoaderCircle } from 'lucide-react';

const GeminiModal = ({ title, content, isLoading, onClose }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center mb-4">
                <h3 className="text-xl font-bold text-amber-400">{title}</h3>
            </div>
            <div className="text-center">
                {isLoading ? (
                    <div className="flex flex-col items-center">
                        <LoaderCircle className="w-8 h-8 text-amber-400 animate-spin mb-4" />
                        <p className="text-gray-300">Loading...</p>
                    </div>
                ) : (
                    <p className="text-gray-300 whitespace-pre-line">{content}</p>
                )}
            </div>
            {!isLoading && (
                <div className="flex justify-center mt-6">
                    <button onClick={onClose} className="bg-amber-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-600 transition-colors">
                        Got it!
                    </button>
                </div>
            )}
        </div>
    </div>
);

export default GeminiModal;