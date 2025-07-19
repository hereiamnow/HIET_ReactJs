/**
 * ManualReadingModal - A modal for manually inputting temperature and humidity readings for a humidor
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is currently open
 * @param {Function} props.onClose - Function to call when the modal should be closed
 * @param {Function} props.onSave - Function to call when saving the reading with (temp, humidity) parameters
 * @param {number} props.initialTemp - Initial temperature value
 * @param {number} props.initialHumidity - Initial humidity value
 */
import React, { useState } from 'react';
import { X, Thermometer, Droplets } from 'lucide-react';

const ManualReadingModal = ({ isOpen, onClose, onSave, initialTemp, initialHumidity }) => {
    const [temp, setTemp] = useState(initialTemp);
    const [humidity, setHumidity] = useState(initialHumidity);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(temp, humidity);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-amber-400">Manual Reading</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            <Thermometer className="w-4 h-4 inline mr-2" />
                            Temperature (°F)
                        </label>
                        <input
                            type="number"
                            value={temp}
                            onChange={(e) => setTemp(Number(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
                            placeholder="Enter temperature"
                            min="0"
                            max="100"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            <Droplets className="w-4 h-4 inline mr-2" />
                            Humidity (%)
                        </label>
                        <input
                            type="number"
                            value={humidity}
                            onChange={(e) => setHumidity(Number(e.target.value))}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-amber-500"
                            placeholder="Enter humidity"
                            min="0"
                            max="100"
                        />
                    </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                    <button 
                        onClick={onClose}
                        className="flex-1 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex-1 bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        Save Reading
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualReadingModal;