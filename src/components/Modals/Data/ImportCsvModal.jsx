/**
 * ImportCsvModal - Component that handles both cigar and humidor imports from CSV files
 * Features multi-step process: file selection, field mapping, import, and completion
 * @param {Object} props - Component props
 * @param {string} props.dataType - Type of data being imported ('cigar' or 'humidor')
 * @param {Array} props.data - Current data array (not used directly but passed for consistency)
 * @param {Object} props.db - Firestore database instance
 * @param {string} props.appId - Application ID for Firestore collection
 * @param {string} props.userId - Current user ID
 * @param {Function} props.onClose - Function to call when the modal should be closed
 * @param {Array} props.humidors - Array of available humidors for cigar imports
 * @param {Function} props.navigate - Navigation function
 * @param {Function} props.onSwitchType - Function to switch between import types
 */
import React, { useState, useRef, useMemo } from 'react';
import { X, UploadCloud, Upload, LoaderCircle, Wind } from 'lucide-react';
import { writeBatch, collection, doc } from 'firebase/firestore';
import Papa from 'papaparse';

// Field definitions for different data types
const APP_HUMIDOR_FIELDS = [
    { key: 'name', label: 'Humidor Name', required: true },
    { key: 'shortDescription', label: 'Short Description', required: false },
    { key: 'longDescription', label: 'Long Description', required: false },
    { key: 'size', label: 'Size', required: false },
    { key: 'location', label: 'Location', required: false },
    { key: 'image', label: 'Image URL', required: false },
    { key: 'type', label: 'Type', required: false },
    { key: 'temp', label: 'Temperature', required: false, type: 'number' },
    { key: 'humidity', label: 'Humidity', required: false, type: 'number' },
    { key: 'goveeDeviceId', label: 'Govee Device ID', required: false },
    { key: 'goveeDeviceModel', label: 'Govee Device Model', required: false },
];

const APP_FIELDS = [
    { key: 'name', label: 'Cigar Name', required: true },
    { key: 'brand', label: 'Brand', required: true },
    { key: 'line', label: 'Product Line', required: false },
    { key: 'shape', label: 'Shape', required: false },
    { key: 'isBoxPress', label: 'Is Box Pressed', required: false, type: 'boolean' },
    { key: 'length_inches', label: 'Length (in)', required: false, type: 'number' },
    { key: 'ring_gauge', label: 'Ring Gauge', required: false, type: 'number' },
    { key: 'size', label: 'Size (e.g., 5.5x50)', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'wrapper', label: 'Wrapper', required: false },
    { key: 'binder', label: 'Binder', required: false },
    { key: 'filler', label: 'Filler', required: false },
    { key: 'strength', label: 'Strength', required: false },
    { key: 'flavorNotes', label: 'Flavor Notes (semicolon-separated)', required: false, type: 'array' },
    { key: 'rating', label: 'Rating (Official)', required: false, type: 'number' },
    { key: 'userRating', label: 'My Rating', required: false, type: 'number' },
    { key: 'price', label: 'Price', required: false, type: 'number' },
    { key: 'quantity', label: 'Quantity', required: true, type: 'number' },
    { key: 'image', label: 'Image URL', required: false },
    { key: 'shortDescription', label: 'Short Description', required: false },
    { key: 'description', label: 'Long Description', required: false },
    { key: 'dateAdded', label: 'Date Added', required: false, type: 'date' }
];

const ImportCsvModal = ({ dataType, data, db, appId, userId, onClose, humidors, navigate, onSwitchType }) => {
    const [step, setStep] = useState('selectFile');
    const [selectedHumidor, setSelectedHumidor] = useState(humidors[0]?.id || '');
    const [fileName, setFileName] = useState('');
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [csvRows, setCsvRows] = useState([]);
    const [fieldMapping, setFieldMapping] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [importedCount, setImportedCount] = useState(0);
    const fileInputRef = useRef(null);

    const currentAppFields = dataType === 'cigar' ? APP_FIELDS : APP_HUMIDOR_FIELDS;
    const collectionName = dataType === 'cigar' ? 'cigars' : 'humidors';

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setIsProcessing(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (!results.data.length || !results.meta.fields) {
                    alert("CSV file appears to be empty or invalid.");
                    setIsProcessing(false);
                    return;
                }

                const headers = results.meta.fields;
                const rows = results.data.map(row => headers.map(header => row[header]));

                setCsvHeaders(headers);
                setCsvRows(rows);

                const initialMapping = {};
                currentAppFields.forEach(appField => {
                    const matchedHeader = headers.find(header => header.toLowerCase().replace(/[\s_]/g, '') === appField.label.toLowerCase().replace(/[\s_]/g, ''));
                    if (matchedHeader) {
                        initialMapping[appField.key] = matchedHeader;
                    } else {
                        initialMapping[appField.key] = 'none';
                    }
                });
                setFieldMapping(initialMapping);

                setStep('mapFields');
                setIsProcessing(false);
            },
            error: (error) => {
                alert(`Error parsing CSV file: ${error.message}`);
                setIsProcessing(false);
            }
        });
    };

    const handleMappingChange = (appFieldKey, csvHeader) => {
        setFieldMapping(prev => ({ ...prev, [appFieldKey]: csvHeader }));
    };

    const handleImport = async () => {
        setStep('importing');
        const batch = writeBatch(db);
        const targetCollectionRef = collection(db, `${appId}_${userId}_${collectionName}`);
        let count = 0;

        csvRows.forEach(row => {
            const newItem = {
                // Add humidorId for cigars, but not for humidors themselves
                ...(dataType === 'cigar' && { humidorId: selectedHumidor }),
                // Initialize arrays for certain fields
                ...(dataType === 'cigar' && { flavorNotes: [] }),
                // Default quantity for cigars
                ...(dataType === 'cigar' && { quantity: 1 }),
                // Default dateAdded to now if not provided
                ...(dataType === 'cigar' && { dateAdded: new Date().toISOString() }),
                // Default temp/humidity for humidors if not provided
                ...(dataType === 'humidor' && { temp: 70, humidity: 70 }),
            };

            currentAppFields.forEach(appField => {
                const mappedHeader = fieldMapping[appField.key];
                if (mappedHeader && mappedHeader !== 'none') {
                    const headerIndex = csvHeaders.indexOf(mappedHeader);
                    if (headerIndex === -1) return;

                    let value = row[headerIndex]?.trim();

                    if (appField.type === 'number') {
                        newItem[appField.key] = parseFloat(value) || 0;
                    } else if (appField.type === 'boolean') {
                        newItem[appField.key] = value?.toLowerCase() === 'true' || value === '1';
                    } else if (appField.type === 'array') {
                        newItem[appField.key] = value ? value.split(';').map(s => s.trim()).filter(Boolean) : [];
                    } else if (appField.type === 'date') {
                        const date = new Date(value);
                        if (value && !isNaN(date)) {
                            newItem[appField.key] = date.toISOString();
                        }
                        // If value is invalid or missing, the default from above is used.
                    } else {
                        newItem[appField.key] = value;
                    }
                }
            });

            // Ensure required fields are present before adding
            const isValidItem = currentAppFields.every(field => {
                if (field.required) {
                    return newItem[field.key] !== undefined && newItem[field.key] !== null && newItem[field.key] !== '';
                }
                return true;
            });

            if (isValidItem) {
                const itemRef = doc(targetCollectionRef); // Firestore will generate a new ID
                batch.set(itemRef, newItem);
                count++;
            } else {
                console.warn(`Skipping row due to missing required fields for ${dataType}:`, row);
            }
        });

        try {
            await batch.commit();
            setImportedCount(count);
            setStep('complete');
        } catch (error) {
            console.error("Error during batch import:", error);
            alert(`Import failed: ${error.message}. Check console for details.`);
            setStep('selectFile'); // Go back to file selection on error
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setStep('selectFile');
        setCsvHeaders([]);
        setCsvRows([]);
        setFileName('');
        setFieldMapping({});
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSwitchType = (newType) => {
        onSwitchType(newType); // Notify parent to change the data type
        handleReset(); // Reset the modal state for the new import
    };

    const isMappingValid = useMemo(() => {
        const requiredFields = currentAppFields.filter(f => f.required);
        return requiredFields.every(f => fieldMapping[f.key] && fieldMapping[f.key] !== 'none');
    }, [fieldMapping, currentAppFields]);

    const renderContent = () => {
        switch (step) {
            case 'selectFile':
                return (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-amber-400 flex items-center"><UploadCloud className="w-5 h-5 mr-2" /> Import {dataType === 'cigar' ? 'Cigars' : 'Humidors'} from CSV</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                        </div>
                        <div className="space-y-4">
                            {dataType === 'cigar' && (
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-1 block">1. Select Destination Humidor</label>
                                    <select value={selectedHumidor} onChange={(e) => setSelectedHumidor(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                                        {humidors.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-1 block">{dataType === 'cigar' ? '2' : '1'}. Choose CSV File</label>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".csv" />
                                <button onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                    {isProcessing ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                    {fileName || 'Choose CSV File'}
                                </button>
                            </div>
                        </div>
                    </>
                );
            case 'mapFields':
                return (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-amber-400">Map CSV Fields</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">Match your CSV columns to the app's fields. Required fields are marked with *.</p>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {currentAppFields.map(appField => (
                                <div key={appField.key} className="grid grid-cols-2 gap-4 items-center">
                                    <label className="text-sm font-medium text-gray-200 text-right">{appField.label}{appField.required && '*'}</label>
                                    <select value={fieldMapping[appField.key] || 'none'} onChange={(e) => handleMappingChange(appField.key, e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white">
                                        <option value="none">-- Do not import --</option>
                                        {csvHeaders.map(header => <option key={header} value={header}>{header}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between gap-3 pt-4 mt-4 border-t border-gray-700">
                            <button onClick={handleReset} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Back</button>
                            <button onClick={handleImport} disabled={!isMappingValid} className="bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                                Import
                            </button>
                        </div>
                    </>
                );
            case 'importing':
                return (
                    <div className="flex flex-col items-center justify-center h-48">
                        <LoaderCircle className="w-12 h-12 text-amber-500 animate-spin" />
                        <p className="mt-4 text-gray-300">Importing your {dataType === 'cigar' ? 'cigars' : 'humidors'}...</p>
                    </div>
                );
            case 'complete':
                return (
                    <div className="bg-amber-900/20 border border-amber-800 rounded-xl p-6 text-center">
                        <h3 className="font-bold text-amber-300 text-xl flex items-center justify-center mb-3">
                            <Wind className="w-5 h-5 mr-2" /> Import Complete!
                        </h3>
                        <p className="text-amber-200 text-sm mb-6">
                            Woof! Successfully imported {importedCount} {dataType === 'cigar' ? 'cigars' : 'humidors'}.
                            <br />
                            What would you like to do next?
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleSwitchType('cigar')}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <UploadCloud className="w-5 h-5" /> Import More Cigars
                            </button>
                            <button
                                onClick={() => handleSwitchType('humidor')}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <UploadCloud className="w-5 h-5" /> Import More Humidors
                            </button>
                            <button
                                onClick={() => {
                                    if (dataType === 'cigar' && selectedHumidor) {
                                        navigate('MyHumidor', { humidorId: selectedHumidor });
                                    } else if (dataType === 'humidor') {
                                        navigate('HumidorsScreen');
                                    }
                                    onClose();
                                }}
                                className="w-full bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors"
                            >
                                Finish & Close
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={step !== 'importing' ? onClose : undefined}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg flex flex-col" onClick={e => e.stopPropagation()}>
                {renderContent()}
            </div>
        </div>
    );
};

export default ImportCsvModal;