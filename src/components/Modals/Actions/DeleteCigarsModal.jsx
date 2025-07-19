/**
 * DeleteCigarsModal - A simple confirmation modal for deleting cigars
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is currently open
 * @param {Function} props.onClose - Function to call when the modal should be closed
 * @param {Function} props.onConfirm - Function to call when deletion is confirmed
 * @param {number} props.count - Number of cigars being deleted
 */
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const DeleteCigarsModal = ({ isOpen, onClose, onConfirm, count }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-red-400 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Delete Cigars
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="mb-6">
                    <p className="text-gray-300 mb-4">
                        Are you sure you want to delete <strong className="text-white">{count}</strong> selected cigar{count !== 1 ? 's' : ''}?
                    </p>
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
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Delete {count !== 1 ? 'Cigars' : 'Cigar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteCigarsModal;