/**
 * MoveCigarsModal - A pop-up for moving selected cigars to another humidor
 * @param {Object} props - Component props
 * @param {Function} props.onClose - Function to call when the modal should be closed
 * @param {Function} props.onMove - Function to call when moving cigars with (humidorId) parameter
 * @param {Array} props.destinationHumidors - Array of available destination humidors
 * @param {Object} props.theme - Theme object for styling
 */
import React, { useState } from 'react';
import { X, Move } from 'lucide-react';

const MoveCigarsModal = ({ onClose, onMove, destinationHumidors, theme }) => {
    const [selectedHumidorId, setSelectedHumidorId] = useState(destinationHumidors[0]?.id || '');

    const handleMove = () => {
        if (selectedHumidorId) {
            onMove(selectedHumidorId);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center">
                        <Move className="w-5 h-5 mr-2" />
                        Move Cigars
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                        Select Destination Humidor
                    </label>
                    <select
                        value={selectedHumidorId}
                        onChange={(e) => setSelectedHumidorId(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
                    >
                        {destinationHumidors.map(humidor => (
                            <option key={humidor.id} value={humidor.id}>
                                {humidor.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleMove}
                        disabled={!selectedHumidorId}
                        className="flex-1 bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Move Cigars
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MoveCigarsModal;