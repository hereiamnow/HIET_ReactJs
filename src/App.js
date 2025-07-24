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
import DataSyncScreen from './screens/DataSyncScreen';
import IntegrationsScreen from './screens/IntegrationsScreen';
import DashboardSettingsScreen from './screens/DashboardSettingsScreen';
import AlertsScreen from './screens/AlertsScreen';
import SettingsScreen from './screens/SettingsScreen';
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
