/**
 * ExportModal - Component that handles both cigar and humidor exports to CSV and JSON formats
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data items to export
 * @param {string} props.dataType - Type of data being exported ('cigar' or 'humidor')
 * @param {Function} props.onClose - Function to call when the modal should be closed
 */
import React from 'react';
import { X, Download } from 'lucide-react';
import { downloadFile } from '../../../utils/fileUtils';

const ExportModal = ({ data, dataType, onClose }) => {
    const getHeaders = () => {
        if (dataType === 'cigar') {
            return ['id,name,brand,line,shape,isBoxPress,isPuro,length_inches,ring_gauge,Size,Country of Origin,wrapper,binder,filler,strength,flavorNotes,rating,userRating,price,quantity,image,shortDescription,description,dateAdded'];
        } else if (dataType === 'humidor') {
            return ['id,name,shortDescription,longDescription,size,location,image,type,temp,humidity,goveeDeviceId,goveeDeviceModel'];
        }
        return [];
    };

    const formatDataForCsv = () => {
        const headers = getHeaders();
        const csvRows = data.reduce((acc, item) => {
            if (dataType === 'cigar') {
                const {
                    id, name, brand, line = '', shape, isBoxPress = false, isPuro = false, length_inches = 0, ring_gauge = 0,
                    size, country, wrapper, binder, filler, strength, flavorNotes, rating, userRating = 0,
                    quantity, price, image = '', shortDescription = '', description = '', dateAdded
                } = item;
                acc.push([
                    id, name, brand, line, shape, isBoxPress ? 'TRUE' : 'FALSE', isPuro ? 'TRUE' : 'FALSE', length_inches, ring_gauge,
                    size, country, wrapper, binder, filler, strength, `"${(flavorNotes || []).join(';')}"`,
                    rating, userRating, price, quantity, image, `"${shortDescription}"`, `"${description}"`, dateAdded
                ].map(field => `"${String(field ?? '').replace(/"/g, '""')}"`).join(',')); // Escape double quotes
            } else if (dataType === 'humidor') {
                const {
                    id, name, shortDescription = '', longDescription = '', size = '', location = '',
                    image = '', type = '', temp = 0, humidity = 0, goveeDeviceId = '', goveeDeviceModel = ''
                } = item;
                acc.push([
                    id, name, shortDescription, longDescription, size, location, image, type, temp, humidity,
                    goveeDeviceId, goveeDeviceModel
                ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')); // Escape double quotes
            }
            return acc;
        }, []);
        return [...headers, ...csvRows].join('\n');
    };

    const exportToCsv = () => {
        downloadFile({
            data: formatDataForCsv(),
            fileName: `humidor_hub_${dataType}s_export.csv`,
            fileType: 'text/csv',
        });
        onClose();
    };

    const exportToJson = () => {
        downloadFile({
            data: JSON.stringify(data, null, 2),
            fileName: `humidor_hub_${dataType}s_export.json`,
            fileType: 'application/json',
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400 flex items-center">
                        <Download className="w-5 h-5 mr-2" /> 
                        Export {dataType === 'cigar' ? 'Cigars' : 'Humidors'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                        {dataType === 'cigar' && data.length === 1 
                            ? "Choose a format to export this cigar." 
                            : `Choose a format to export your ${dataType} collection.`
                        }
                    </p>
                    
                    <button 
                        onClick={exportToCsv} 
                        className="w-full flex items-center justify-center gap-2 bg-green-600/80 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Export as CSV
                    </button>
                    
                    <button 
                        onClick={exportToJson} 
                        className="w-full flex items-center justify-center gap-2 bg-blue-600/80 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Export as JSON
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;