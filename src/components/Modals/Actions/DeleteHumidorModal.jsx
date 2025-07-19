/**
 * DeleteHumidorModal - A modal for confirming the deletion of a humidor with options for handling contained cigars
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is currently open
 * @param {Function} props.onClose - Function to call when the modal should be closed
 * @param {Function} props.onConfirm - Function to call when deletion is confirmed with (action, destinationId) parameters
 * @param {Object} props.humidor - The humidor object being deleted
 * @param {Array} props.cigarsInHumidor - Array of cigars currently in the humidor
 * @param {Array} props.otherHumidors - Array of other available humidors for moving cigars
 */
import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Move } from 'lucide-react';

const DeleteHumidorModal = ({ isOpen, onClose, onConfirm, humidor, cigarsInHumidor, otherHumidors }) => {
    const [deleteAction, setDeleteAction] = useState('move');
    const [destinationHumidorId, setDestinationHumidorId] = useState(otherHumidors[0]?.id || '');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(deleteAction, destinationHumidorId);
        onClose();
    };

    const cigarCount = cigarsInHumidor.length;
    const hasOtherHumidors = otherHumidors.length > 0;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-red-400 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Delete Humidor
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="mb-6">
                    <p className="text-gray-300 mb-4">
                        Are you sure you want to delete <strong className="text-white">"{humidor?.name}"</strong>?
                    </p>
                    
                    {cigarCount > 0 && (
                        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-4">
                            <p className="text-yellow-200 text-sm mb-3">
                                This humidor contains <strong>{cigarCount}</strong> cigar{cigarCount !== 1 ? 's' : ''}. 
                                What would you like to do with {cigarCount !== 1 ? 'them' : 'it'}?
                            </p>
                            
                            <div className="space-y-3">
                                {hasOtherHumidors && (
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="deleteAction"
                                            value="move"
                                            checked={deleteAction === 'move'}
                                            onChange={(e) => setDeleteAction(e.target.value)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 text-green-400 font-medium">
                                                <Move className="w-4 h-4" />
                                                Move to another humidor
                                            </div>
                                            <select
                                                value={destinationHumidorId}
                                                onChange={(e) => setDestinationHumidorId(e.target.value)}
                                                disabled={deleteAction !== 'move'}
                                                className="mt-2 w-full bg-gray-700 border border-gray-600 rounded py-1 px-2 text-white text-sm disabled:opacity-50"
                                            >
                                                {otherHumidors.map(h => (
                                                    <option key={h.id} value={h.id}>{h.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </label>
                                )}
                                
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="deleteAction"
                                        value="delete"
                                        checked={deleteAction === 'delete'}
                                        onChange={(e) => setDeleteAction(e.target.value)}
                                    />
                                    <div className="flex items-center gap-2 text-red-400 font-medium">
                                        <Trash2 className="w-4 h-4" />
                                        Delete all cigars permanently
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                    
                    <p className="text-gray-400 text-sm">
                        This action cannot be undone.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="flex-1 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Delete Humidor
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteHumidorModal;