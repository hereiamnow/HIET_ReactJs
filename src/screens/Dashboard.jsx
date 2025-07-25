// File: Dashboard.jsx
// Path: src/screens/Dashboard.jsx
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 17, 2025
// Time: 7:32 AM CDT

// Description: Dashboard screen component - main overview of user's cigar collection
// Features: Collection statistics, browse by filters, Roxy's tips, interactive panels
// Includes: Gemini AI integration for collection summaries, dynamic panel management

// React imports
import React, { useState, useEffect, useMemo } from 'react';

// Third-party library imports
import {
    BarChart2,
    ChevronDown,
    Cigarette,
    Filter,
    Leaf,
    MapPin,
    Move,
    Plus,
    ShieldPlus,
    Sparkles,
    Wind,
    XCircle
} from 'lucide-react';

// Local constants
import { roxysTips } from '../constants/roxysTips';

// Services
import { callGeminiAPI } from '../services/geminiService';

// Components - Modals
import GeminiModal from '../components/Modals/Content/GeminiModal';

// Components - Drawers
import {
    BrowseByWrapper,
    BrowseByStrength,
    BrowseByCountry,
    InteractiveWorldMap
} from '../components/Drawers';

// Components - Panels
import {
    InventoryAnalysisPanel,
    MyCollectionStatsCards,
    AgingWellPanel
} from '../components/Panels';

const Dashboard = ({
    navigate,
    cigars,
    humidors,
    theme,
    showWrapperPanel,
    showStrengthPanel,
    showCountryPanel,
    showInventoryAnalysis,
    panelStates,
    setPanelStates,
    dashboardPanelVisibility
}) => {
    // Debug: Log props on component render
    console.log('Dashboard props:', {
        cigarsCount: cigars?.length || 0,
        humidorsCount: humidors?.length || 0,
        showWrapperPanel,
        showStrengthPanel,
        showCountryPanel,
        showInventoryAnalysis,
        panelStates,
        dashboardPanelVisibility
    });

    // State for Roxy's random tip display
    const [roxyTip, setRoxyTip] = useState('');
    // State for Gemini AI modal (collection summary)
    const [modalState, setModalState] = useState({ isOpen: false, content: '', isLoading: false });
    // State for browse by mode panel visibility
    const [isBrowseByModeOpen, setIsBrowseByModeOpen] = useState(false);
    // State for current browse mode (wrapper, strength, country)
    const [browseMode, setBrowseMode] = useState('wrapper');

    useEffect(() => {
        // Pick a random tip from Roxy's corner on component mount
        const randomTip = roxysTips[Math.floor(Math.random() * roxysTips.length)];
        console.log('Selected Roxy tip:', randomTip);
        setRoxyTip(randomTip);
    }, []);

    // Memoized calculation for chart data and statistics
    const { totalValue, totalCigars } = useMemo(() => {
        const value = cigars.reduce((acc, cigar) => acc + (cigar.price * cigar.quantity), 0);
        const count = cigars.reduce((sum, c) => sum + c.quantity, 0);

        console.log('Collection stats calculated:', { totalValue: value, totalCigars: count });

        return {
            totalValue: value,
            totalCigars: count
        };
    }, [cigars]);

    // --- Data for Browse By Panel ---
    // Memoized wrapper data for browse by wrapper functionality
    const wrapperData = useMemo(() => {
        if (browseMode !== 'wrapper') return [];
        const counts = cigars.reduce((acc, cigar) => {
            const wrapper = cigar.wrapper || 'Unknown';
            acc[wrapper] = (acc[wrapper] || 0) + cigar.quantity;
            return acc;
        }, {});
        const result = Object.entries(counts)
            .map(([wrapper, quantity]) => ({ wrapper, quantity }))
            .sort((a, b) => a.wrapper.localeCompare(b.wrapper));

        console.log('Wrapper data calculated:', result);
        return result;
    }, [cigars, browseMode]);

    // Memoized strength data for browse by strength functionality
    const strengthData = useMemo(() => {
        if (browseMode !== 'strength') return [];
        const strengthCategories = [
            { label: 'Mild Cigars', filterValue: 'Mild' },
            { label: 'Mild to Medium Cigars', filterValue: 'Mild-Medium' },
            { label: 'Medium Cigars', filterValue: 'Medium' },
            { label: 'Medium to Full Cigars', filterValue: 'Medium-Full' },
            { label: 'Full Bodied Cigars', filterValue: 'Full' }
        ];
        const counts = strengthCategories.map(category => {
            const quantity = cigars
                .filter(cigar => cigar.strength === category.filterValue)
                .reduce((sum, cigar) => sum + cigar.quantity, 0);
            return { label: category.label, quantity, filterValue: category.filterValue };
        });
        const result = counts.filter(item => item.quantity > 0);

        console.log('Strength data calculated:', result);
        return result;
    }, [cigars, browseMode]);

    // Memoized country data for browse by country functionality
    const countryData = useMemo(() => {
        if (browseMode !== 'country') return [];
        const countryCategories = [
            { label: 'Dominican Cigars', filterValue: 'Dominican Republic' },
            { label: 'Nicaraguan Cigars', filterValue: 'Nicaragua' },
            { label: 'Honduran Cigars', filterValue: 'Honduras' },
            { label: 'American Cigars', filterValue: 'USA' },
            { label: 'Cuban Cigars', filterValue: 'Cuba' },
            { label: 'Mexican Cigars', filterValue: 'Mexico' },
            { label: 'Other Countries', filterValue: 'Other' }
        ];
        const counts = cigars.reduce((acc, cigar) => {
            const country = cigar.country || 'Unknown';
            const matchedCategory = countryCategories.find(cat => cat.filterValue.toLowerCase() === country.toLowerCase());
            const key = matchedCategory ? matchedCategory.label : 'Other Countries';
            acc[key] = (acc[key] || 0) + cigar.quantity;
            return acc;
        }, {});
        const result = countryCategories
            .map(category => ({
                label: category.label,
                quantity: counts[category.label] || 0,
                filterValue: category.filterValue
            }))
            .filter(item => item.quantity > 0)
            .sort((a, b) => a.label.localeCompare(b.label));

        console.log('Country data calculated:', result);
        return result;
    }, [cigars, browseMode]);
    // --- End of Data for Browse By Panel ---

    // Function to call Gemini API for a collection summary
    const handleSummarizeCollection = async () => {
        console.log('Starting collection summary generation...');
        setModalState({ isOpen: true, content: '', isLoading: true });

        // Create inventory summary for Gemini API
        const inventorySummary = cigars.map(c => `${c.quantity}x ${c.brand} ${c.name} (${c.strength}, from ${c.country})`).join('\n');
        console.log('Inventory summary for Gemini:', inventorySummary);

        const prompt = `You are an expert tobacconist. I am providing you with my current cigar inventory. Please provide a brief, narrative summary of my collection's character. What are the dominant trends in terms of strength, brand, and country of origin? What does my collection say about my tasting preferences? My inventory is:\n\n${inventorySummary}`;

        try {
            const result = await callGeminiAPI(prompt);
            console.log('Gemini API response received:', result);
            setModalState({ isOpen: true, content: result, isLoading: false });
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            setModalState({ isOpen: true, content: 'Error generating summary. Please try again.', isLoading: false });
        }
    };

    // Handle browse by mode button clicks with animation timing
    const handleBrowseByClick = (mode) => {
        console.log('Browse by mode clicked:', mode, 'Current mode:', browseMode, 'Panel open:', isBrowseByModeOpen);

        if (isBrowseByModeOpen && browseMode === mode) {
            // Same mode clicked - close panel
            console.log('Closing browse panel (same mode)');
            setIsBrowseByModeOpen(false);
        } else if (isBrowseByModeOpen) {
            // Different mode clicked - animate out then in
            console.log('Switching browse mode with animation');
            setIsBrowseByModeOpen(false);
            // Use a timeout to allow the panel to animate out before animating back in
            setTimeout(() => {
                setBrowseMode(mode);
                setIsBrowseByModeOpen(true);
            }, 150); // Adjust timing based on your animation duration
        } else {
            // Panel closed - open with new mode
            console.log('Opening browse panel with mode:', mode);
            setBrowseMode(mode);
            setIsBrowseByModeOpen(true);
        }
    };

    // Generic toggle handler for all panels
    const handlePanelToggle = (panelName) => {
        console.log('Toggling panel:', panelName, 'Current state:', panelStates[panelName]);
        setPanelStates(prev => ({ ...prev, [panelName]: !prev[panelName] }));
    };

    // Determine if humidors are present
    const hasHumidors = humidors && humidors.length > 0;
    // Determine if cigars are present
    const hasCigars = cigars && cigars.length > 0;

    console.log('Collection status:', { hasHumidors, hasCigars });

    // Configuration for browse by mode buttons and panels
    const browseByConfig = {
        wrapper: { title: 'Browse by Wrapper', icon: Leaf },
        strength: { title: 'Browse by Profile', icon: Leaf },
        country: { title: 'Browse by Country', icon: MapPin },
        default: { title: 'Browse by', icon: Filter }
    };

    const currentBrowseConfig = browseByConfig[browseMode] || browseByConfig.default;
    const BrowseIcon = currentBrowseConfig.icon;

    return (
        <div className="p-4 pb-24">
            {modalState.isOpen && (
                <GeminiModal
                    title="Collection Summary"
                    content={modalState.content}
                    isLoading={modalState.isLoading}
                    onClose={() => setModalState({ isOpen: false, content: '', isLoading: false })}
                />
            )}
            <div className="flex items-center mb-2">
                <BarChart2 className={`w-8 h-8 mr-3 ${theme.primary}`} />
                <h1 className={`text-3xl font-bold ${theme.text}`}>Dashboard</h1>
            </div>
            <p className={`${theme.subtleText} mb-6`}>Your collection's live overview.</p>

            {hasHumidors && (
                <MyCollectionStatsCards
                    totalCigars={totalCigars}
                    totalValue={totalValue}
                    humidors={humidors}
                    theme={theme}
                />
            )}

            {/* New: Roxy's Tips panel when no humidors are present */}
            {!hasHumidors && (
                <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-4 mb-6 text-center">
                    <h3 className="font-bold text-amber-300 text-lg flex items-center justify-center mb-3">
                        <Wind className="w-5 h-5 mr-2" /> Roxy's Tips!
                    </h3>
                    <p className="text-amber-200 text-sm mb-4">
                        Looks like your humidor collection is empty! Add your first humidor and some cigars to get insightful analytics on your dashboard.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => navigate('AddHumidor')}
                            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-2 rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Humidor
                        </button>
                        {/* Disable Add Cigar if no humidors exist to put them in */}
                        <button
                            disabled={true}
                            title="Add a humidor first to add cigars"
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-gray-500 font-bold py-2 rounded-lg cursor-not-allowed"
                        >
                            <Cigarette className="w-4 h-4" /> Add Cigar
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-6">


                {/* Browse by mode buttons */}
                <div id="toolbar-browse-by-mode-buttons" className="flex justify-center gap-4">
                    <button
                        id="btnBrowseByWrapper"
                        onClick={() => handleBrowseByClick('wrapper')}
                        className={`p-3 bg-gray-800/50 border border-gray-700 rounded-full ${theme.primary} hover:bg-gray-700 transition-colors`}
                    >
                        <Leaf className="w-5 h-5" />
                    </button>
                    <button
                        id="btnBrowseByStrength"
                        onClick={() => handleBrowseByClick('strength')}
                        className={`p-3 bg-gray-800/50 border border-gray-700 rounded-full ${theme.primary} hover:bg-gray-700 transition-colors`}
                    >
                        <ShieldPlus className="w-5 h-5" />
                    </button>
                    <button
                        id="btnBrowseByCountry"
                        onClick={() => handleBrowseByClick('country')}
                        className={`p-3 bg-gray-800/50 border border-gray-700 rounded-full ${theme.primary} hover:bg-gray-700 transition-colors`}
                    >
                        <MapPin className="w-5 h-5" />
                    </button>
                </div>

                {/* Existing Roxy's Corner panel */}
                <div className="bg-amber-900/20 border border-amber-800 rounded-xl overflow-hidden">
                    <button onClick={() => handlePanelToggle('roxy')} className="w-full p-4 flex justify-between items-center">
                        <h3 className="font-bold text-amber-300 text-lg flex items-center">
                            <Wind className="w-5 h-5 mr-2" /> Roxy's Corner
                        </h3>
                        <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${!panelStates.roxy ? 'rotate-180' : ''}`} />
                    </button>
                    {!panelStates.roxy && (
                        <div className="px-4 pb-4">
                            {/* New: Friendly message when humidors exist but no cigars */}
                            {hasHumidors && !hasCigars ? (
                                <div className="text-amber-200 text-sm mb-4">
                                    <p className="mb-3">Woof! Your humidors are looking a bit empty. Add some cigars or move them here to get personalized insights and organize your collection!</p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            // Pass the ID of the first humidor if available, otherwise null.
                                            // The AddCigar screen should handle the case of no humidor selected.
                                            onClick={() => navigate('AddCigar', { humidorId: humidors.length > 0 ? humidors[0].id : null })}
                                            className="flex-1 flex items-center justify-center gap-2 bg-amber-500/20 border border-amber-500 text-amber-300 font-bold py-2 rounded-lg hover:bg-amber-500/30 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Add Cigar
                                        </button>
                                        <button
                                            onClick={() => navigate('HumidorsScreen')}
                                            className="flex-1 flex items-center justify-center gap-2 bg-sky-500/20 border border-sky-500 text-sky-300 font-bold py-2 rounded-lg hover:bg-sky-500/30 transition-colors"
                                        >
                                            <Move className="w-4 h-4" /> Manage & Move
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-amber-200 text-sm">{roxyTip}</p>
                                    {/* Conditionally render "Ask Roxy for a Summary" if there are cigars */}
                                    {hasCigars && (
                                        <button
                                            onClick={handleSummarizeCollection}
                                            className="mt-4 w-full flex items-center justify-center bg-purple-600/20 border border-purple-500 text-purple-300 font-bold py-2 rounded-lg hover:bg-purple-600/30 transition-colors"
                                        >
                                            <Sparkles className="w-5 h-5 mr-2" /> Ask Roxy for a Summary
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {hasCigars && dashboardPanelVisibility.showAgingWellPanel && (
                    <AgingWellPanel
                        cigars={cigars}
                        navigate={navigate}
                        theme={theme}
                        isCollapsed={panelStates.agingWell}
                        onToggle={() => handlePanelToggle('agingWell')}
                    />
                )}



                {/* Conditionally render InventoryAnalysisPanel if there are cigars and it's enabled in settings */}
                {hasCigars && showInventoryAnalysis && (
                    <InventoryAnalysisPanel
                        cigars={cigars}
                        theme={theme}
                        isCollapsed={panelStates.inventoryAnalysis}
                        onToggle={() => handlePanelToggle('inventoryAnalysis')}
                    />
                )}

                {/* Conditionally render the new InteractiveWorldMap */}
                {hasCigars && dashboardPanelVisibility.showWorldMap && (
                    <InteractiveWorldMap
                        cigars={cigars}
                        navigate={navigate}
                        theme={theme}
                        isCollapsed={panelStates.worldMap}
                        onToggle={() => handlePanelToggle('worldMap')}
                    />
                )}

                {/* Conditionally render BrowseByWrapper if there are cigars and it's enabled in settings */}
                {hasCigars && showWrapperPanel && (
                    <BrowseByWrapper
                        cigars={cigars}
                        navigate={navigate}
                        theme={theme}
                        isCollapsed={panelStates.wrapper}
                        onToggle={() => handlePanelToggle('wrapper')}
                    />
                )}

                {/* Conditionally render BrowseByStrength if there are cigars and it's enabled in settings */}
                {hasCigars && showStrengthPanel && (
                    <BrowseByStrength
                        cigars={cigars}
                        navigate={navigate}
                        theme={theme}
                        isCollapsed={panelStates.strength}
                        onToggle={() => handlePanelToggle('strength')}
                    />
                )}

                {/* Conditionally render BrowseByCountry if there are cigars and it's enabled in settings */}
                {hasCigars && showCountryPanel && (
                    <BrowseByCountry
                        cigars={cigars}
                        navigate={navigate}
                        theme={theme}
                        isCollapsed={panelStates.country}
                        onToggle={() => handlePanelToggle('country')}
                    />
                )}
            </div>

            {isBrowseByModeOpen && (
                <div id="pnlBrowseByModePanel" className={`fixed bottom-20 left-0 right-0 ${theme.drawerBg} backdrop-blur-sm p-4 z-40 border-t ${theme.drawerBorderColor}`}>
                    <div className="max-w-md mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 id="browseByMode" className="text-xl font-bold text-amber-400 flex items-center">
                                <BrowseIcon className="w-5 h-5 mr-2" /> {currentBrowseConfig.title}
                            </h3>
                            <button onClick={() => setIsBrowseByModeOpen(false)} className="text-amber-400 font-semibold"><XCircle /></button>
                        </div>
                        <div className="mb-4 max-h-64 overflow-y-auto space-y-2">
                            {browseMode === 'wrapper' && wrapperData.map(({ wrapper, quantity }) => (
                                <button
                                    key={wrapper}
                                    onClick={() => { navigate('HumidorsScreen', { preFilterWrapper: wrapper }); setIsBrowseByModeOpen(false); }}
                                    className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex justify-between items-center"
                                >
                                    <span className="text-gray-300">{wrapper}</span>
                                    <span className="text-gray-400">({quantity})</span>
                                </button>
                            ))}
                            {browseMode === 'strength' && strengthData.map(({ label, quantity, filterValue }) => (
                                <button
                                    key={label}
                                    onClick={() => { navigate('HumidorsScreen', { preFilterStrength: filterValue }); setIsBrowseByModeOpen(false); }}
                                    className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex justify-between items-center"
                                >
                                    <span className="text-gray-300">{label}</span>
                                    <span className="text-gray-400">({quantity})</span>
                                </button>
                            ))}
                            {browseMode === 'country' && countryData.map(({ label, quantity, filterValue }) => (
                                <button
                                    key={label}
                                    onClick={() => { navigate('HumidorsScreen', { preFilterCountry: filterValue }); setIsBrowseByModeOpen(false); }}
                                    className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex justify-between items-center"
                                >
                                    <span className="text-gray-300">{label}</span>
                                    <span className="text-gray-400">({quantity})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;