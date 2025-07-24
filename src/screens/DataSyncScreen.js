// File: DataSyncScreen.js
// Path: src/screens/DataSyncScreen.js
// Project: Humidor Hub
// Author: Shawn Miller (hereiamnow@gmail.com)
// Date: July 24, 2025
// Time: 3:00 PM CDT

// Description:
// DataSyncScreen component provides comprehensive data import and export functionality for the Humidor Hub application.
// Features include CSV import/export for cigars and humidors, environment data export with historical temperature
// and humidity readings, and modal-based interfaces for data management. The component is organized into collapsible
// panels for different data types (Cigar Collection, Humidor Management, Environment Data) and integrates with
// Firebase Firestore for data persistence. It supports bulk operations and provides user-friendly interfaces
// for data migration and backup scenarios.

import React, { useState } from 'react';
import { ChevronLeft, Cigarette, Box, Thermometer, UploadCloud, Download } from 'lucide-react';

// Import UI components
import CollapsiblePanel from '../components/UI/CollapsiblePanel';

// Import modal components
import ImportCsvModal from '../components/Modals/Data/ImportCsvModal';
import ExportModal from '../components/Modals/Data/ExportModal';

// Import utilities
import { downloadFile } from '../utils/fileUtils';

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

export default DataSyncScreen;