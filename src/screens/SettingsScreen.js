// File: SettingsScreen.js
// Path: src/screens/SettingsScreen.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 24, 2025
// Time: 4:00 PM CDT

// Description:
// SettingsScreen component provides the main settings navigation interface for the Humidor Hub application.
// Features include organized setting categories with icons, titles, and descriptions for easy navigation.
// The component includes settings for Profile management, Data & Sync operations, Dashboard Components
// customization, Theme selection with modal interface, Font preferences, Deeper Statistics access,
// and About information with version display. Each setting item is presented as a clickable card with
// consistent styling and hover effects. The component integrates with the theme system and provides
// navigation to various settings sub-screens throughout the application.

import React, { useState } from 'react';
import { 
    User, 
    Database, 
    LayoutGrid, 
    Palette, 
    Info, 
    BarChart2, 
    Settings as SettingsIcon 
} from 'lucide-react';

// Import modal components
import ThemeModal from '../components/Modals/Content/ThemeModal';

const SettingsScreen = ({ navigate, theme, setTheme, dashboardPanelVisibility, setDashboardPanelVisibility, selectedFont, setSelectedFont }) => {
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const appVersion = process.env.REACT_APP_VERSION || '1.1.0-dev';
    
    const SettingItem = ({ icon: Icon, title, subtitle, onClick }) => (
        <button onClick={onClick} className="w-full flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-left">
            <div className="p-2 bg-gray-700 rounded-full"><Icon className={`w-6 h-6 ${theme.primary}`} /></div>
            <div>
                <p className={`font-bold ${theme.text}`}>{title}</p>
                <p className={`text-xs ${theme.subtleText}`}>{subtitle}</p>
            </div>
        </button>
    );

    return (
        <div className="p-4 pb-24">
            {isThemeModalOpen && <ThemeModal currentTheme={theme} setTheme={setTheme} onClose={() => setIsThemeModalOpen(false)} />}
            <div className="flex items-center mb-6">
                <SettingsIcon className={`w-8 h-8 mr-3 ${theme.primary}`} />
                <h1 className="text-3xl font-bold text-white">Settings</h1>
            </div>
            <div className="space-y-4">
                <SettingItem icon={User} title="Profile" subtitle="Manage your account details" onClick={() => navigate('Profile')} />
                <SettingItem icon={Database} title="Data & Sync" subtitle="Export or import your collection" onClick={() => navigate('DataSync')} />
                <SettingItem icon={LayoutGrid} title="Dashboard Components" subtitle="Customize what appears on your dashboard" onClick={() => navigate('DashboardSettings')} />
                {/* <SettingItem icon={Bell} title="Notifications" subtitle="Set up alerts for humidity and temp" onClick={() => navigate('Notifications')} /> */}
                {/* <SettingItem icon={Zap} title="Integrations" subtitle="Connect to Govee and other services" onClick={() => navigate('Integrations')} /> */}
                <SettingItem icon={Palette} title="Theme" subtitle={`Current: ${theme.name}`} onClick={() => setIsThemeModalOpen(true)} />
                <SettingItem icon={Info} title="Fonts" subtitle="Choose your preferred font combination" onClick={() => navigate('Fonts')} disabled={true} />
                <SettingItem icon={BarChart2} title="Deeper Statistics & Insights" subtitle="Explore advanced stats about your collection" onClick={() => navigate('DeeperStatistics')} />
                <SettingItem icon={Info} title="About Humidor Hub" subtitle={`Version ${appVersion}`} onClick={() => navigate('About')} />
            </div>
        </div>
    );
};

export default SettingsScreen;