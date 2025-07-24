// File: App.js
// Path: src\App.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 24, 2025
// Time: 12:18 PM CDT
//
// Next Features:
// - Implement drag-and-drop reordering for the dashboard panels on desktop.
// - Persist the user's custom panel order to local storage.
// - Enhance error handling with user-friendly messages for all API calls and database operations.
// - Add more robust input validation for all forms.
// - Give the user the option to reset the date when moving cigars to a new humidor.
// - Implement a "Cigar of the Day" feature that highlights a random cigar from the user's collection each day picked by Roxy.
// - Implement Firebase Storage integration for image uploads.

// Firebase configuration and initialization.
import { db, auth, firebaseConfigExport } from './firebase';

// FirebaseUI component for authentication.
import FirebaseAuthUI from './FirebaseAuthUI';// FirebaseUI component for handling user sign-in and authentication.

// React is the main library for building the user interface.
// useState, useEffect, and useMemo are "hooks" that let us use state and other React features in functional components.
import React, { useState, useEffect, useMemo, useRef } from 'react'; // Import useRef for flashing effect
// react-simple-maps provides a set of components for rendering maps.
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";


// lucide-react provides a set of clean, modern icons used throughout the app.
import { ArrowUp, ArrowDown, CheckSquare, AlertTriangle, BarChart2, Bell, Box, Calendar as CalendarIcon, Check, ChevronDown, ChevronLeft, Cigarette, Database, DollarSign, Download, Droplets, Edit, Filter, Info, LayoutGrid, Leaf, List, LoaderCircle, MapPin, Minus, Move, Palette, PieChart as PieChartIcon, Plus, Search, Settings as SettingsIcon, Sparkles, Star, Tag, Thermometer, Trash2, Upload, UploadCloud, User, Wind, X, Zap, Github, Bug, BookText } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse'; // Import papaparse for CSV parsing and exporting.
// Import Firebase libraries for database and authentication
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, writeBatch, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, connectAuthEmulator } from "firebase/auth";



// App Constants
import { themes } from './constants/themes';
import { roxysTips } from './constants/roxysTips';
import { fontOptions } from './constants/fontOptions';
import { strengthOptions, allFlavorNotes, commonCigarDimensions, cigarShapes, cigarLengths, cigarRingGauges, cigarWrapperColors, cigarBinderTypes, cigarFillerTypes, cigarCountryOfOrigin } from './constants/cigarOptions';
import { APP_HUMIDOR_FIELDS, APP_CIGAR_FIELDS } from './constants/fieldDefinitions';

// App Components
import QuantityControl from './components/UI/QuantityControl';
import GridCigarCard from './components/Cigar/GridCigarCard';
import ListCigarCard from './components/Cigar/ListCigarCard';


import InputField from './components/UI/InputField';
import TextAreaField from './components/UI/TextAreaField';
import AutoCompleteInputField from './components/UI/AutoCompleteInputField';
import ChartCard from './components/UI/ChartCard';
import { getRatingColor } from './components/utils/getRatingColor';
import { calculateAge } from './components/utils/calculateAge';
import ProfileScreen from './components/Settings/ProfileScreen';
import AboutScreen from './components/Settings/AboutScreen';
import AddEditJournalEntry from './components/Journal/AddEditJournalEntry';
import JournalEntryCard from './components/Journal/JournalEntryCard';
import CigarJournalScreen from './components/Journal/CigarJournalScreen';

// Import components
import FilterSortModal from './components/UI/FilterSortModal';
import HumidorActionMenu from './components/Menus/HumidorActionMenu';
import CigarActionMenu from './components/Menus/CigarActionMenu';
import DraggableImage from './components/UI/DraggableImage';
import ImagePreview from './components/UI/ImagePreview';
import Gauge from './components/UI/Gauge';
import StatCard from './components/UI/StatCard';
import CollapsiblePanel from './components/UI/CollapsiblePanel';
import BottomNav from './components/Navigation/BottomNav';

// Import drawer components
import {
    BrowseByWrapperDrawer,
    BrowseByStrengthDrawer,
    BrowseByCountryDrawer,
    InteractiveWorldMapDrawer
} from './components/Drawers';

// Import panel components
import {
    InventoryAnalysisPanel,
    MyCollectionStatsCards,
    AgingWellPanel
} from './components/Panels';

// Import screens
import Dashboard from './screens/Dashboard';
import MyHumidor from './screens/MyHumidor';
import AddHumidor from './screens/AddHumidor';
import EditHumidor from './screens/EditHumidor';
import AddCigar from './screens/AddCigar';
import EditCigar from './screens/EditCigar';
import CigarDetail from './screens/CigarDetail';
import DeeperStatisticsScreen from './screens/DeeperStatisticsScreen';
import FontsScreen from './screens/FontsScreen';
import HumidorsScreen from './screens/HumidorsScreen';
import NotificationsScreen from './components/Settings/NotificationsScreen';

// Import utilities
import { downloadFile, generateAiImage } from './utils/fileUtils';
import { getFlavorTagColor } from './utils/colorUtils';
import { parseHumidorSize, formatDate } from './utils/formatUtils';

// Import services
import { callGeminiAPI } from './services/geminiService';
import { fetchGoveeDevices } from './services/goveeService';

// Import modal components
import GeminiModal from './components/Modals/Content/GeminiModal';
import ThemeModal from './components/Modals/Content/ThemeModal';
import FlavorNotesModal from './components/Modals/Forms/FlavorNotesModal';
import ManualReadingModal from './components/Modals/Forms/ManualReadingModal';
import ImageUploadModal from './components/Modals/Forms/ImageUploadModal';
import MoveCigarsModal from './components/Modals/Actions/MoveCigarsModal';
import DeleteHumidorModal from './components/Modals/Actions/DeleteHumidorModal';
import DeleteCigarsModal from './components/Modals/Actions/DeleteCigarsModal';
import ImportCsvModal from './components/Modals/Data/ImportCsvModal';
import ExportModal from './components/Modals/Data/ExportModal';
import SmartImageModal from './components/Modals/Composite/SmartImageModal';


// Initialize Firebase Authentication token
const initialAuthToken = typeof window !== "undefined" && window.initialAuthToken ? window.initialAuthToken : null;

// List of countries known for producing cigars, used in the app for filtering and categorization.
const cigarCountries = [
    "United States",
    "Mexico",
    "Cuba",
    "Dominican Republic",
    "Honduras",
    "Nicaragua"
];

// URL for the world map data used in the Map component.
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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

const IntegrationsScreen = ({ navigate, goveeApiKey, setGoveeApiKey, goveeDevices, setGoveeDevices, theme }) => {
    const [key, setKey] = useState(goveeApiKey || '');
    const [status, setStatus] = useState(goveeApiKey ? 'Connected' : 'Not Connected');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleConnectGovee = async () => {
        setIsLoading(true);
        setMessage('');
        setGoveeDevices([]);

        if (!key) {
            setMessage('Please enter a Govee API Key.');
            setIsLoading(false);
            return;
        }

        try {
            const devices = await fetchGoveeDevices(key);
            if (devices.length > 0) {
                setGoveeApiKey(key);
                setGoveeDevices(devices);
                setStatus('Connected');
                setMessage(`Successfully connected! Found ${devices.length} Govee device(s).`);
            } else {
                setGoveeApiKey('');
                setGoveeDevices([]);
                setStatus('Not Connected');
                setMessage('No Govee devices found with this API key. Please check your key and ensure devices are online.');
            }
        } catch (error) {
            console.error("Error connecting to Govee:", error);
            setGoveeApiKey('');
            setGoveeDevices([]);
            setStatus('Not Connected');
            setMessage(`Failed to connect to Govee: ${error.message}.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className={`w-7 h-7 ${theme.text}`} /></button>
                <h1 className={`text-3xl font-bold ${theme.text}`}>Integrations</h1>
            </div>
            <div className="space-y-6">
                <div className={`${theme.card} p-4 rounded-xl`}>
                    <h3 className="font-bold text-xl text-amber-300 mb-2">Govee</h3>
                    <p className={`${theme.subtleText} text-sm mb-4`}>Connect your Govee account to automatically sync temperature and humidity data.</p>
                    <div className="space-y-2">
                        <label className={`text-sm font-medium ${theme.subtleText} mb-1 block`}>Govee API Key</label>
                        <input type="text" placeholder="Enter your Govee API Key (e.g., TEST_KEY_123)" value={key} onChange={(e) => { setKey(e.target.value); setStatus('Not Connected'); setMessage(''); }} className={`w-full ${theme.inputBg} border ${theme.borderColor} rounded-lg py-2 px-3 ${theme.text} placeholder-gray-500 focus:outline-none focus:ring-2 ${theme.ring}`} />
                        <p className={`${theme.subtleText} text-xs`}>Get this from the Govee Home app under "About Us {'>'} Apply for API Key".</p>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <span className={`text-sm font-bold ${status === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>Status: {isLoading ? 'Connecting...' : status}</span>
                        <button onClick={handleConnectGovee} disabled={isLoading} className={`flex items-center gap-2 ${theme.primaryBg} text-white font-bold text-sm px-4 py-2 rounded-full ${theme.hoverPrimaryBg} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}>
                            {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {isLoading ? 'Connecting...' : 'Connect'}
                        </button>
                    </div>
                    {message && (<p className={`mt-3 text-sm ${status === 'Connected' ? 'text-green-300' : 'text-red-300'}`}>{message}</p>)}
                    {goveeDevices.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-300 font-semibold mb-2">Found Devices:</p>
                            <ul className="list-disc list-inside text-gray-400 text-xs">{goveeDevices.map(d => (<li key={d.device}>{d.deviceName} ({d.model})</li>))}</ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DataSyncScreen = ({ navigate, db, appId, userId, cigars, humidors }) => {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [modalDataType, setModalDataType] = useState(null); // 'cigar' or 'humidor'

    const exportEnvironmentData = () => {
        let headers = ['humidorId,name,humidity,temp'];
        let envCsv = humidors.reduce((acc, humidor) => {
            const { id, name, humidity, temp } = humidor;
            acc.push([id, name, humidity, temp].join(','));
            return acc;
        }, []);
        downloadFile({ data: [...headers, ...envCsv].join('\n'), fileName: 'humidor_environment_export.csv', fileType: 'text/csv' });
    };

    const handleOpenExportModal = (type) => {
        setModalDataType(type);
        setIsExportModalOpen(true);
    };

    const handleOpenImportModal = (type) => {
        setModalDataType(type);
        setIsImportModalOpen(true);
    };

    return (
        <div className="p-4 pb-24">
            {isImportModalOpen && <ImportCsvModal dataType={modalDataType} data={modalDataType === 'cigar' ? cigars : humidors} db={db} appId={appId} userId={userId} onClose={() => setIsImportModalOpen(false)} humidors={humidors} navigate={navigate} />}
            {isExportModalOpen && <ExportModal dataType={modalDataType} data={modalDataType === 'cigar' ? cigars : humidors} onClose={() => setIsExportModalOpen(false)} />}

            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className="w-7 h-7 text-white" /></button>                <h1 className="text-3xl font-bold text-white">Import & Export</h1>
            </div>

            <div className="space-y-6">
                <CollapsiblePanel title="Cigar Collection" description="Import or export your individual cigar data." icon={Cigarette}>
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => handleOpenImportModal('cigar')} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"><UploadCloud className="w-5 h-5" />Import Cigars from CSV</button>
                        <button onClick={() => handleOpenExportModal('cigar')} className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"><Download className="w-5 h-5" />Export Cigars</button>
                    </div>
                </CollapsiblePanel>

                <CollapsiblePanel title="Humidor Management" description="Transfer your humidor setup and details." icon={Box}>
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={() => handleOpenImportModal('humidor')} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"><UploadCloud className="w-5 h-5" />Import Humidors from CSV</button>
                        <button onClick={() => handleOpenExportModal('humidor')} className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"><Download className="w-5 h-5" />Export Humidors</button>
                    </div>
                </CollapsiblePanel>

                <CollapsiblePanel title="Environment Data" description="Download historical temperature and humidity data for all humidors." icon={Thermometer}>
                    <div className="grid grid-cols-1 gap-4">
                        <button onClick={exportEnvironmentData} className="w-full flex items-center justify-center gap-2 bg-purple-600/80 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors"><Download className="w-5 h-5" />Export Environment CSV</button>
                    </div>
                </CollapsiblePanel>
            </div>
        </div>
    );
};

export default function App() {
    const [navigation, setNavigation] = useState({ screen: 'Dashboard', params: {} });
    const [cigars, setCigars] = useState([]);
    const [humidors, setHumidors] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);
    const [theme, setTheme] = useState(themes["Humidor Hub"]);
    const [goveeApiKey, setGoveeApiKey] = useState('');
    const [goveeDevices, setGoveeDevices] = useState([]);

    const [selectedFont, setSelectedFont] = useState(fontOptions[0]);

    // State for controlling dashboard panel visibility
    // This state will determine which panels are shown in the Dashboard.
    // It is initialized to show all panels by default, will be conditionally overridden in Dashboard component
    const [dashboardPanelVisibility, setDashboardPanelVisibility] = useState({
        showWrapperPanel: false,
        showStrengthPanel: false,
        showCountryPanel: false,

        showInventoryAnalysis: true,
        showWorldMap: true,
        showAgingWellPanel: true,
    });

    // New state to manage the open/closed status of dashboard panels
    const [dashboardPanelStates, setDashboardPanelStates] = useState({
        roxy: true,
        liveEnvironment: true,
        inventoryAnalysis: true,
        wrapper: true,
        strength: true,
        country: true,
        worldMap: true,
        agingWell: true
    });

    // Gemini TODO:Firebase state
    // This state will hold the Firebase database and authentication instances.
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch

    // Extract appId from the Firebase configuration to pass as a prop.
    const appId = firebaseConfigExport.appId;

    // One-time Firebase initialization and authentication
    useEffect(() => {
        try {
            // Check if the Firebase config object is available.
            if (Object.keys(firebaseConfigExport).length === 0) {
                console.error("Firebase config is empty. App cannot initialize.");
                setIsLoading(false);
                return;
            }

            // Initialize the Firebase app with the provided configuration.
            const app = initializeApp(firebaseConfigExport);
            // Get instances of Firestore and Authentication services.
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);

            // --- LOCAL DEVELOPMENT EMULATOR SETUP ---
            // This checks if the app is running on 'localhost'.
            // If it is, it connects to the local Firebase emulators instead of the live cloud services.
            // This is crucial for development to avoid touching production data.
            const isLocalDev = window.location.hostname === 'localhost';
            if (isLocalDev) {
                console.log("Connecting to local Firebase emulators...");

                // Connect to the Auth emulator. The default port is 9099.
                connectAuthEmulator(firebaseAuth, "http://localhost:9099");

                // Connect to the Firestore emulator. The default port is 8080.
                connectFirestoreEmulator(firestoreDb, 'localhost', 8080);
            }
            // --- END OF EMULATOR SETUP ---

            // Set the initialized db and auth instances to state.
            setDb(firestoreDb);
            setAuth(firebaseAuth);

            // Set the Firebase app ID for use in Firestore paths.
            onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    console.log("User signed in:", user.uid);
                } else {
                    if (isLocalDev || !initialAuthToken) {
                        // Gemini TODO: App hangs here when loading into Capacitor
                        console.log("No user signed in. Using anonymous sign-in.");
                        // Local dev or no token: use anonymous sign-in
                        await signInAnonymously(firebaseAuth);
                    } else {
                        // Production with token: use custom token
                        console.log("Using custom auth token for sign-in.");
                        try {
                            await signInWithCustomToken(firebaseAuth, initialAuthToken);
                        } catch (error) {
                            console.error("Failed to sign in with custom token:", error);
                            await signInAnonymously(firebaseAuth);
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Firebase initialization failed:", error);
            setIsLoading(false);
        }
    }, []); // The empty dependency array `[]` ensures this effect runs only once when the component mounts.

    // Effect for fetching data from Firestore
    // This effect runs whenever the `db` or `userId` state changes.
    useEffect(() => {
        // We only proceed if both the database connection and the user ID are available.
        if (db && userId) {
            setIsLoading(true); // Set loading to true while we fetch data.

            // Set up a real-time listener for the 'humidors' collection.
            // `onSnapshot` will automatically update the `humidors` state whenever data changes in Firestore.
            const humidorsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'humidors');
            const unsubscribeHumidors = onSnapshot(humidorsCollectionRef, (snapshot) => {
                const humidorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHumidors(humidorsData);
            }, (error) => {
                console.error("Error fetching humidors:", error);
            });

            // Set up a real-time listener for the 'cigars' collection.
            const cigarsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'cigars');
            const unsubscribeCigars = onSnapshot(cigarsCollectionRef, (snapshot) => {
                const cigarsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCigars(cigarsData);
                setIsLoading(false); // Set loading to false after the initial cigar data is loaded.
            }, (error) => {
                console.error("Error fetching cigars:", error);
                setIsLoading(false);
            });

            // Set up a real-time listener for the 'journalEntries' collection.
            const journalEntriesCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'journalEntries');
            const unsubscribeJournalEntries = onSnapshot(journalEntriesCollectionRef, (snapshot) => {
                const entriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setJournalEntries(entriesData);
            }, (error) => {
                console.error("Error fetching journal entries:", error);
            });



            // This is a cleanup function. When the component unmounts (or `db`/`userId` changes),
            // it will detach the listeners to prevent memory leaks.
            return () => {
                console.log("Cleaning up Firestore listeners...");
                unsubscribeHumidors();
                console.log("Unsubscribing from humidors updates.");
                unsubscribeCigars();
                console.log("Unsubscribing from cigars updates.");
                unsubscribeJournalEntries();
                console.log("Unsubscribing from journal entries updates.");
            };
        }
    }, [db, userId]); // Dependencies for this effect.

    // This effect runs whenever the `navigation` state changes.
    // It is used to scroll the window to the top smoothly when navigating between screens.
    // Scroll to top on navigation change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [navigation]);

    // Function to handle navigation between screens.
    // It takes the screen name and any parameters to pass to that screen.
    const navigate = (screen, params = {}) => {
        setNavigation({ screen, params });
    };

    // This function determines which screen component to render based on the current navigation state.
    const renderScreen = () => {
        const { screen, params } = navigation;

        // A loading screen is shown while Firebase is initializing and fetching data.
        if (isLoading) {
            return (
                <div className={`w-full h-screen flex flex-col items-center justify-center ${theme.bg}`}>
                    <LoaderCircle className={`w-12 h-12 ${theme.primary} animate-spin`} />
                    <p className={`mt-4 ${theme.text}`}>Loading Your Collection...</p>
                </div>
            );
        }

        // A `switch` statement is used to select the correct component.
        switch (screen) {
            case 'Dashboard':
                return <Dashboard navigate={navigate} cigars={cigars}
                    humidors={humidors} theme={theme}
                    showWrapperPanel={dashboardPanelVisibility.showWrapperPanel}
                    showStrengthPanel={dashboardPanelVisibility.showStrengthPanel}
                    showCountryPanel={dashboardPanelVisibility.showCountryPanel}

                    showInventoryAnalysis={dashboardPanelVisibility.showInventoryAnalysis}
                    panelStates={dashboardPanelStates}
                    setPanelStates={setDashboardPanelStates}
                    dashboardPanelVisibility={dashboardPanelVisibility} />;
            case 'HumidorsScreen':
                return <HumidorsScreen navigate={navigate} cigars={cigars} humidors={humidors} db={db} appId={appId} userId={userId} theme={theme} {...params} />;
            case 'MyHumidor':
                const humidor = humidors.find(h => h.id === params.humidorId);
                return humidor ? <MyHumidor humidor={humidor} navigate={navigate} cigars={cigars} humidors={humidors} db={db} appId={appId} userId={userId} theme={theme} /> : <div>Humidor not found</div>;
            case 'CigarDetail':
                const cigar = cigars.find(c => c.id === params.cigarId);
                return cigar ? <CigarDetail cigar={cigar} navigate={navigate} db={db} appId={appId} userId={userId} journalEntries={journalEntries} /> : <div>Cigar not found</div>; case 'AddCigar':
                return <AddCigar navigate={navigate} db={db} appId={appId} userId={userId} humidorId={params.humidorId} theme={theme} />;
            case 'EditCigar':
                const cigarToEdit = cigars.find(c => c.id === params.cigarId);
                return cigarToEdit ? <EditCigar navigate={navigate} db={db} appId={appId} userId={userId} cigar={cigarToEdit} theme={theme} /> : <div>Cigar not found</div>;
            case 'Alerts':
                return <AlertsScreen navigate={navigate} humidors={humidors} />;
            case 'Fonts':
                return <FontsScreen navigate={navigate} selectedFont={selectedFont} setSelectedFont={setSelectedFont} theme={theme} />;
            case 'Settings':
                return <SettingsScreen navigate={navigate} theme={theme} setTheme={setTheme} dashboardPanelVisibility={dashboardPanelVisibility} setDashboardPanelVisibility={setDashboardPanelVisibility} selectedFont={selectedFont} setSelectedFont={setSelectedFont} />;
            case 'AddHumidor':
                return <AddHumidor navigate={navigate} db={db} appId={appId} userId={userId} theme={theme} />;
            case 'EditHumidor':
                const humidorToEdit = humidors.find(h => h.id === params.humidorId);
                return humidorToEdit ? <EditHumidor navigate={navigate} db={db} appId={appId} userId={userId} humidor={humidorToEdit} goveeApiKey={goveeApiKey} goveeDevices={goveeDevices} theme={theme} /> : <div>Humidor not found</div>;
            case 'CigarJournal':
                return <CigarJournalScreen navigate={navigate} journalEntries={journalEntries} theme={theme} db={db} appId={appId} userId={userId} />;
            case 'AddEditJournalEntry':
                const cigarForJournal = cigars.find(c => c.id === params.cigarId);
                const entryToEdit = journalEntries.find(e => e.id === params.entryId);
                return cigarForJournal ? <AddEditJournalEntry navigate={navigate} db={db} appId={appId} userId={userId} cigar={cigarForJournal} existingEntry={entryToEdit} theme={theme} /> : <div>Cigar not found for journal entry.</div>;
            case 'DashboardSettings':
                return <DashboardSettingsScreen navigate={navigate} theme={theme} dashboardPanelVisibility={dashboardPanelVisibility} setDashboardPanelVisibility={setDashboardPanelVisibility} />;

            case 'DeeperStatistics':
                return <DeeperStatisticsScreen navigate={navigate} cigars={cigars} theme={theme} />;
            case 'Integrations':
                return <IntegrationsScreen navigate={navigate} goveeApiKey={goveeApiKey} setGoveeApiKey={setGoveeApiKey} goveeDevices={goveeDevices} setGoveeDevices={setGoveeDevices} theme={theme} />;
            case 'DataSync':
                return <DataSyncScreen navigate={navigate} db={db} appId={appId} userId={userId} cigars={cigars} humidors={humidors} />;
            case 'Notifications':
                return <NotificationsScreen navigate={navigate} humidors={humidors} />;
            case 'About':
                return <AboutScreen navigate={navigate} />;
            case 'Profile':
                return <ProfileScreen navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} userId={userId} auth={auth} />;
            default:
                return <Dashboard navigate={navigate} cigars={cigars} humidors={humidors} theme={theme} showWrapperPanel={dashboardPanelVisibility.showWrapperPanel} showStrengthPanel={dashboardPanelVisibility.showStrengthPanel} showCountryPanel={dashboardPanelVisibility.showCountryPanel} showInventoryAnalysis={dashboardPanelVisibility.showInventoryAnalysis} panelStates={dashboardPanelStates} setPanelStates={setDashboardPanelStates} />;
        }
    }; //end of renderScreen function

    // If the user is not signed in and Firebase auth is available, show the Firebase Auth UI.
    // This component handles user authentication.
    if (!userId && auth) {
        return <FirebaseAuthUI auth={auth} onSignIn={setUserId} />;
    }

    // The main return statement for the App component.
    return (
        <div
            className={`min-h-screen ${theme.bg} ${theme.text}`}
            style={{
                fontFamily: selectedFont.body,
            }}
        >
            <div className="max-w-md mx-auto">
                {renderScreen()}
            </div>
            <BottomNav activeScreen={navigation.screen} navigate={navigate} theme={theme} />
        </div>
    );
}
