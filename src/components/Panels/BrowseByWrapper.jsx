// File: BrowseByWrapper.js
// Path: src/components/Drawers/BrowseByWrapper.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 21, 2025
// Time: 10:30 AM
// Description: Drawer component for browsing cigars by wrapper type with collapsible interface

import React, { useMemo } from 'react';
import { Leaf, ChevronDown } from 'lucide-react';

const BrowseByWrapper = ({ cigars, navigate, theme, isCollapsed, onToggle }) => {
    // Calculate unique wrapper types and their counts
    const wrapperData = useMemo(() => {
        const counts = cigars.reduce((acc, cigar) => {
            const wrapper = cigar.wrapper || 'Unknown'; // Handle cigars without a wrapper defined
            acc[wrapper] = (acc[wrapper] || 0) + cigar.quantity;
            return acc;
        }, {});
        // Convert to an array of objects for easier mapping and sorting
        return Object.entries(counts)
            .map(([wrapper, quantity]) => ({ wrapper, quantity }))
            .sort((a, b) => a.wrapper.localeCompare(b.wrapper)); // Sort alphabetically by wrapper name
    }, [cigars]);

    return (
        <div id="pnlBrowseByWrapper" className={`${theme.drawerBg} border ${theme.borderColor} rounded-xl overflow-hidden`}>
            <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
                <h3 className={`font-bold ${theme.primary} text-lg flex items-center`}>
                    {/* <Leaf className={`w-5 h-5 mr-2 ${theme.primary}`} />  */}
                    Browse by Wrapper
                </h3>
                <ChevronDown className={`w-5 h-5 ${theme.primary} transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
            {!isCollapsed && (
                <div id="pnlContents" className="px-4 pb-4 space-y-2">
                    {wrapperData.length > 0 ? (
                        wrapperData.map(({ wrapper, quantity }) => (
                            <button
                                key={wrapper}
                                onClick={() => navigate('HumidorsScreen', { preFilterWrapper: wrapper })}
                                className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex justify-between items-center"
                            >
                                <span className="text-gray-300">{wrapper}</span>
                                <span className="text-gray-400">({quantity})</span>
                            </button>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No wrapper data available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BrowseByWrapper;