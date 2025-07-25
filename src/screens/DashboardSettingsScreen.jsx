// File: DashboardSettingsScreen.js
// Path: src/screens/DashboardSettingsScreen.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 24, 2025
// Time: 3:30 PM CDT

// Description:
// DashboardSettingsScreen component provides user interface for customizing dashboard panel visibility
// in the Humidor Hub application. Features include toggle switches for controlling the display of
// various dashboard components such as Inventory Analysis, Interactive World Map, Browse by Wrapper,
// Browse by Strength, Browse by Country, and Aging Well panels. The component uses a clean toggle
// switch interface with visual feedback and integrates with the application's theme system. Changes
// are immediately applied to the dashboard panel visibility state, allowing users to personalize
// their dashboard experience by showing or hiding specific analytical and browsing panels.

import React from 'react';
import { ChevronLeft } from 'lucide-react';

const DashboardSettingsScreen = ({ navigate, theme, dashboardPanelVisibility, setDashboardPanelVisibility }) => {
    const ToggleSwitch = ({ label, isChecked, onToggle }) => (
        <div className="flex justify-between items-center py-2">
            <span className="text-gray-300">{label}</span>
            <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isChecked ? 'bg-amber-500' : 'bg-gray-600'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className={`w-7 h-7 ${theme.text}`} /></button>
                <h1 className={`text-3xl font-bold ${theme.text}`}>Dashboard Components</h1>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-xl space-y-2">
                <ToggleSwitch
                    label="Inventory Analysis"
                    isChecked={dashboardPanelVisibility.showInventoryAnalysis}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showInventoryAnalysis: !prev.showInventoryAnalysis }))}
                />
                <ToggleSwitch
                    label="Interactive World Map"
                    isChecked={dashboardPanelVisibility.showWorldMap}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showWorldMap: !prev.showWorldMap }))}
                />
                <ToggleSwitch
                    label="Browse by Wrapper"
                    isChecked={dashboardPanelVisibility.showWrapperPanel}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showWrapperPanel: !prev.showWrapperPanel }))}
                />
                <ToggleSwitch
                    label="Browse by Strength"
                    isChecked={dashboardPanelVisibility.showStrengthPanel}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showStrengthPanel: !prev.showStrengthPanel }))}
                />
                <ToggleSwitch
                    label="Browse by Country"
                    isChecked={dashboardPanelVisibility.showCountryPanel}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showCountryPanel: !prev.showCountryPanel }))}
                />
                <ToggleSwitch
                    label="Aging Well / From the Cellar"
                    isChecked={dashboardPanelVisibility.showAgingWellPanel}
                    onToggle={() => setDashboardPanelVisibility(prev => ({ ...prev, showAgingWellPanel: !prev.showAgingWellPanel }))}
                />
            </div>
        </div>
    );
};

export default DashboardSettingsScreen;