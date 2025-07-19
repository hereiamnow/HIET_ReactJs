/**
 * FlavorNotesModal - A pop-up for editing the flavor notes of a cigar
 * @param {Object} props - Component props
 * @param {Object} props.cigar - The cigar object being edited
 * @param {Object} props.db - Firestore database instance
 * @param {string} props.appId - Application ID for Firestore collection
 * @param {string} props.userId - Current user ID
 * @param {Function} props.onClose - Function to call when the modal should be closed
 * @param {Function} props.setSelectedNotes - Function to update parent component's selected notes (aliased as updateParentNotes)
 */
import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { X, Check } from 'lucide-react';
import { allFlavorNotes } from '../../../constants/cigarOptions';

const FlavorNotesModal = ({ cigar, db, appId, userId, onClose, setSelectedNotes: updateParentNotes }) => {
    const [selectedNotes, setSelectedNotes] = useState(cigar?.flavorNotes || []);

    const toggleNote = (note) => {
        setSelectedNotes(prev => 
            prev.includes(note) 
                ? prev.filter(n => n !== note)
                : [...prev, note]
        );
    };

    const saveNotes = async () => {
        try {
            const cigarRef = doc(db, `${appId}_${userId}_cigars`, cigar.id);
            await updateDoc(cigarRef, { flavorNotes: selectedNotes });
            updateParentNotes(selectedNotes);
            onClose();
        } catch (error) {
            console.error("Error updating flavor notes:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-amber-400">Edit Flavor Notes</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-4">
                    <div className="grid grid-cols-2 gap-2">
                        {allFlavorNotes.map(note => (
                            <button
                                key={note}
                                onClick={() => toggleNote(note)}
                                className={`p-2 rounded-lg text-sm font-medium transition-all ${
                                    selectedNotes.includes(note)
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{note}</span>
                                    {selectedNotes.includes(note) && (
                                        <Check className="w-4 h-4" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={saveNotes}
                        className="flex-1 bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        Save Notes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlavorNotesModal;