// File: AlertsScreen.js
// Path: src/screens/AlertsScreen.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 24, 2025
// Time: 3:45 PM CDT

// Description:
// AlertsScreen component provides environmental monitoring alert configuration for humidors in the
// Humidor Hub application. Features include customizable temperature and humidity alert thresholds
// for each humidor, toggle switches to enable/disable alerts, and input fields for setting minimum
// and maximum values. The component displays a personalized interface for each humidor with separate
// controls for humidity alerts (with percentage thresholds) and temperature alerts (with Fahrenheit
// thresholds). When no humidors are present, it shows a helpful "Roxy's Corner" message encouraging
// users to add their first humidor. The interface includes visual feedback with toggle switches
// and organized layout with collapsible alert settings.

import React, { useState } from 'react';
import { ChevronLeft, Wind, Plus } from 'lucide-react';

const AlertsScreen = ({ navigate, humidors }) => {
    const [alertSettings, setAlertSettings] = useState(
        humidors.map(h => ({ humidorId: h.id, name: h.name, humidityAlert: false, minHumidity: 68, maxHumidity: 72, tempAlert: false, minTemp: 65, maxTemp: 70 }))
    );

    const handleToggle = (humidorId, type) => {
        setAlertSettings(prev => prev.map(s => s.humidorId === humidorId ? { ...s, [type]: !s[type] } : s));
    };

    const handleValueChange = (humidorId, type, value) => {
        setAlertSettings(prev => prev.map(s => s.humidorId === humidorId ? { ...s, [type]: value } : s));
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className="w-7 h-7 text-white" /></button>
                <h1 className="text-3xl font-bold text-white">Alerts</h1>
            </div>
            <div className="space-y-6">
                {humidors && humidors.length > 0 ? (
                    alertSettings.map(setting => (
                        <div key={setting.humidorId} className="bg-gray-800/50 p-4 rounded-xl">
                            <h3 className="font-bold text-xl text-amber-300 mb-4">{setting.name}</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Humidity Alert</span>
                                    <button onClick={() => handleToggle(setting.humidorId, 'humidityAlert')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${setting.humidityAlert ? 'bg-amber-500' : 'bg-gray-600'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${setting.humidityAlert ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                                </div>
                                {setting.humidityAlert && (
                                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-700 ml-2">
                                        <div className="flex items-center space-x-2"><label className="text-sm text-gray-400">Min:</label><input type="number" value={setting.minHumidity} onChange={(e) => handleValueChange(setting.humidorId, 'minHumidity', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" /><span className="text-gray-400">%</span></div>
                                        {/* FIX: Changed unit from °F to % for max humidity */}
                                        <div className="flex items-center space-x-2"><label className="text-sm text-gray-400">Max:</label><input type="number" value={setting.maxHumidity} onChange={(e) => handleValueChange(setting.humidorId, 'maxHumidity', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" /><span className="text-gray-400">%</span></div>
                                    </div>
                                )}
                                <div className="border-t border-gray-700"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Temperature Alert</span>
                                    <button onClick={() => handleToggle(setting.humidorId, 'tempAlert')} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${setting.tempAlert ? 'bg-amber-500' : 'bg-gray-600'}`}><span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${setting.tempAlert ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                                </div>
                                {setting.tempAlert && (
                                    <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-700 ml-2">
                                        <div className="flex items-center space-x-2"><label className="text-sm text-gray-400">Min:</label><input type="number" value={setting.minTemp} onChange={(e) => handleValueChange(setting.humidorId, 'minTemp', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" /><span className="text-gray-400">°F</span></div>
                                        <div className="flex items-center space-x-2"><label className="text-sm text-gray-400">Max:</label><input type="number" value={setting.maxTemp} onChange={(e) => handleValueChange(setting.humidorId, 'maxTemp', e.target.value)} className="w-16 bg-gray-700 text-white text-center rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500" /><span className="text-gray-400">°F</span></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-6 text-center">
                        <h3 className="font-bold text-amber-300 text-lg flex items-center justify-center mb-3">
                            <Wind className="w-5 h-5 mr-2" /> Roxy's Corner
                        </h3>
                        <p className="text-amber-200 text-sm mb-4">
                            Ruff! You need to add a humidor before you can set up any alerts. Let's get your first one set up!
                        </p>
                        <button
                            onClick={() => navigate('AddHumidor')}
                            className="flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors w-full"
                        >
                            <Plus className="w-4 h-4" /> Add a Humidor
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsScreen;