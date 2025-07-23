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
    // Extract colors from theme objects for better previews
    const getThemeColors = (theme) => {
        const colorMap = {
            'text-amber-400': '#fbbf24',
            'text-sky-400': '#38bdf8',
            'text-orange-400': '#fb923c',
            'text-amber-700': '#b45309',
            'bg-gray-800': '#1f2937',
            'bg-slate-800': '#1e293b',
            'bg-stone-800': '#292524',
            'bg-white': '#ffffff'
        };

        return {
            primary: colorMap[theme.primary] || '#fbbf24',
            background: colorMap[theme.card?.replace('/50', '')] || colorMap[theme.bg] || '#1f2937',
            text: theme.name === 'Classic Light' ? '#1f2937' : '#ffffff'
        };
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-gray-700/50" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-xl mr-3">
                            <Palette className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Choose Theme</h3>
                            <p className="text-gray-400 text-sm">Personalize your experience</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    {Object.entries(themes).map(([key, theme]) => {
                        const colors = getThemeColors(theme);
                        const isSelected = currentTheme.name === theme.name;

                        return (
                            <button
                                key={key}
                                onClick={() => {
                                    setTheme(theme);
                                    onClose();
                                }}
                                className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${isSelected
                                        ? 'border-amber-500 bg-gradient-to-br from-amber-500/20 to-orange-500/10 shadow-lg shadow-amber-500/25'
                                        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                        ✓
                                    </div>
                                )}

                                <div className="flex flex-col items-center space-y-3">
                                    <div className="relative">
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20"
                                            style={{
                                                background: `linear-gradient(135deg, ${colors.background}, ${colors.primary}20)`
                                            }}
                                        >
                                            <span
                                                className="font-bold text-xl"
                                                style={{ color: colors.text }}
                                            >
                                                {theme.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div
                                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                            style={{ backgroundColor: colors.primary }}
                                        ></div>
                                    </div>

                                    <div className="text-center">
                                        <span className="text-white font-semibold text-sm block">{theme.name}</span>
                                        <span className="text-gray-400 text-xs">
                                            {theme.name === 'Classic Light' ? 'Light Mode' : 'Dark Mode'}
                                        </span>
                                    </div>

                                    <div className="flex space-x-1.5">
                                        <div
                                            className="w-4 h-4 rounded-full border-2 border-white/30 shadow-sm"
                                            style={{ backgroundColor: colors.primary }}
                                        ></div>
                                        <div
                                            className="w-4 h-4 rounded-full border-2 border-white/30 shadow-sm"
                                            style={{ backgroundColor: colors.background }}
                                        ></div>
                                        <div
                                            className="w-4 h-4 rounded-full border-2 border-white/30 shadow-sm"
                                            style={{ backgroundColor: `${colors.primary}80` }}
                                        ></div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-3 px-8 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-200 shadow-lg"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeModal;