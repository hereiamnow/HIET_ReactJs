// File: CollapsiblePanel.js
// Path: src/components/UI/CollapsiblePanel.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 23, 2025

// Description:
// A reusable UI component that creates an expandable/collapsible content section.
// Features a clickable header with optional icon, smooth chevron animation, and
// conditional content rendering. Used throughout the app for organizing dashboard
// panels and data management sections while reducing visual clutter.

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CollapsiblePanel = ({ title, description, children, icon: Icon, theme }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full p-4 flex justify-between items-center">
                <h3 className="font-bold text-amber-300 text-lg flex items-center">
                    {Icon && <Icon className="w-5 h-5 mr-2" />} {title}
                </h3>
                <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
            {!isCollapsed && (
                <div className="px-4 pb-4 space-y-4">
                    <p className="text-gray-400 text-sm">{description}</p>
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsiblePanel;