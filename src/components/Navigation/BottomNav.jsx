/**
 * BottomNav - Component for the main app navigation
 * @param {Object} props - Component props
 * @param {string} props.activeScreen - Currently active screen name
 * @param {Function} props.navigate - Function to handle navigation
 * @param {Object} props.theme - Theme object for styling
 */
import React from 'react';
import { BarChart2, Box, BookText, Bell, Settings as SettingsIcon } from 'lucide-react';

const BottomNav = ({ activeScreen, navigate, theme }) => {
    const navItems = [
        { name: 'Dashboard', icon: BarChart2 },
        { name: 'HumidorsScreen', icon: Box },
        { name: 'CigarJournal', icon: BookText },
        { name: 'Alerts', icon: Bell },
        { name: 'Settings', icon: SettingsIcon }
    ];

    return (
        <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto ${theme.card} border-t ${theme.border} flex justify-around py-2 z-50`}>
            {navItems.map(({ name, icon: Icon }) => (
                <button
                    key={name}
                    onClick={() => navigate(name)}
                    className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                        activeScreen === name 
                            ? `${theme.primary} ${theme.primaryBg}` 
                            : `${theme.subtleText} hover:${theme.text}`
                    }`}
                >
                    <Icon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">
                        {name === 'HumidorsScreen' ? 'Humidors' : 
                         name === 'CigarJournal' ? 'Journal' : name}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default BottomNav;