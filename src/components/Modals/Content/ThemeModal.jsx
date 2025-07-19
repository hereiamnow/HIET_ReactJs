/**
 * ThemeModal - A pop-up for selecting a new app theme
 * @param {Object} props - Component props
 * @param {Object} props.currentTheme - The currently selected theme object
 * @param {Function} props.setTheme - Function to update the selected theme
 * @param {Function} props.onClose - Function to call when the modal should be closed
 */
import React from 'react';
import { X, Palette } from 'lucide-react';
import { themes } from '../../../constants/themes';

const ThemeModal = ({ currentTheme, setTheme, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center">
                        <Palette className="w-5 h-5 mr-2" />
                        Choose Theme
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(themes).map(([key, theme]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setTheme(theme);
                                onClose();
                            }}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                currentTheme.name === theme.name 
                                    ? 'border-amber-500 bg-amber-500/20' 
                                    : 'border-gray-600 hover:border-gray-500'
                            }`}
                        >
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                                     style={{ backgroundColor: theme.primaryColor }}>
                                    <span className="text-white font-bold text-lg">
                                        {theme.name.charAt(0)}
                                    </span>
                                </div>
                                <span className="text-white font-medium">{theme.name}</span>
                                <div className="flex space-x-1">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.secondaryColor }}></div>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentColor }}></div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                
                <div className="flex justify-center mt-6">
                    <button 
                        onClick={onClose}
                        className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeModal;