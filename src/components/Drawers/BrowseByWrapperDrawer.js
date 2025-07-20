import React, { useMemo } from 'react';
import { Leaf, ChevronDown } from 'lucide-react';

const BrowseByWrapperDrawer = ({ cigars, navigate, theme, isCollapsed, onToggle }) => {
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
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
            <button onClick={onToggle} className="w-full p-4 flex justify-between items-center">
                <h3 className="font-bold text-amber-300 text-lg flex items-center">
                    <Leaf className="w-5 h-5 mr-2" /> Browse by Wrapper
                </h3>
                <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
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

export default BrowseByWrapperDrawer;