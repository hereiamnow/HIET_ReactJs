/**
 * File: NotificationsScreen.jsx
 * Path: src/components/Settings/NotificationsScreen.jsx
 * Project: Humidor Hub
 * Author: Shawn Miller (hereiamnow@gmail.com)
 * Date: July 20, 2025
 * 
 * Description:
 * This component renders the Notifications settings screen for the Humidor Hub app.
 * It allows users to view and (in the future) configure notification preferences for
 * in-app, email, and push notifications related to their humidor collection.
 * The screen also displays a history of recent alerts for humidity and temperature.
 * 
 * Props:
 * - navigate: function to change screens
 * - humidors: array of user's humidors (for future notification targeting)
 */

import React from 'react';
import { ChevronLeft } from 'lucide-react';

const NotificationsScreen = ({ navigate, humidors }) => {
    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className="w-7 h-7 text-white" />
                </button>
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
            </div>
            <div className="space-y-6">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="font-bold text-xl text-amber-300 mb-2">Notification Preferences</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Choose how you want to be notified about important events in your humidor collection.
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">In-App Alerts</span>
                            <input type="checkbox" checked readOnly className="accent-amber-500 w-5 h-5" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">Email Notifications</span>
                            <input type="checkbox" disabled className="accent-amber-500 w-5 h-5" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300">Push Notifications</span>
                            <input type="checkbox" disabled className="accent-amber-500 w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl">
                    <h3 className="font-bold text-xl text-amber-300 mb-2">Recent Alerts</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Here you’ll see a history of recent humidity and temperature alerts for your humidors.
                    </p>
                    <ul className="text-sm text-gray-300 space-y-2">
                        <li>No recent alerts. All your humidors are in the safe zone!</li>
                        {/* Example: <li>Humidity dropped below 68% in "Office Humidor" (July 7, 2025)</li> */}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NotificationsScreen;
