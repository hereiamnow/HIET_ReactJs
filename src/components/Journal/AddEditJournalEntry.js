import React, { useState, useEffect } from 'react';
import { doc, addDoc, updateDoc, collection, deleteDoc } from 'firebase/firestore';
import { ChevronLeft, Star, MapPin, GlassWater, Calendar as CalendarIcon, Save, Trash2, Compass as BrowseIcon, HelpCircle } from 'lucide-react';
import InputField from '../UI/InputField';
import TextAreaField from '../UI/TextAreaField';
import FlavorWheel from './FlavorWheel';



const AddEditJournalEntry = ({ navigate, db, appId, userId, cigar, existingEntry, theme }) => {
    const isEditing = !!existingEntry;
    const [isFlavorWheelOpen, setIsFlavorWheelOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 

    const [formData, setFormData] = useState({
        dateSmoked: new Date().toISOString(),
        location: '',
        pairing: '',
        experienceRating: 0,
        drawRating: 0,
        burnRating: 0,
        ashRating: 0,
        firstThirdNotes: '',
        secondThirdNotes: '',
        finalThirdNotes: '',
        burnTimeMinutes: '',
        ...existingEntry,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (name, rating) => {
        setFormData(prev => ({ ...prev, [name]: rating }));
    };

    const handleSave = async () => {
        const collectionRef = collection(db, 'artifacts', appId, 'users', userId, 'journalEntries');
        const dataToSave = {
            ...formData,
            cigarId: cigar.id,
            cigarName: cigar.name,
            cigarBrand: cigar.brand,
            experienceRating: Number(formData.experienceRating),
            drawRating: Number(formData.drawRating),
            burnRating: Number(formData.burnRating),
            ashRating: Number(formData.ashRating),
            burnTimeMinutes: Number(formData.burnTimeMinutes) || 0,
        };

        if (isEditing) {
            const docRef = doc(db, 'artifacts', appId, 'users', userId, 'journalEntries', existingEntry.id);
            await updateDoc(docRef, dataToSave);
        } else {
            await addDoc(collectionRef, dataToSave);
        }
        navigate('CigarJournal');
    };

    const handleDelete = async () => {
        if (isEditing) {
            const docRef = doc(db, 'artifacts', appId, 'users', userId, 'journalEntries', existingEntry.id);
            await deleteDoc(docRef);
            navigate('CigarJournal');
        }
    };



    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('CigarDetail', { cigarId: cigar.id })} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className={`w-7 h-7 ${theme.text}`} />
                </button>
                <h1 className="text-2xl font-bold text-white">{isEditing ? 'Edit Journal Entry' : 'Log New Experience'}</h1>
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl mb-4">
                <p className="text-sm text-gray-400">{cigar.brand}</p>
                <h2 className="text-xl font-bold text-amber-300">{cigar.name}</h2>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col items-center">
                    <label className="text-sm font-medium text-gray-300 mb-2">Experience Rating</label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => handleRatingChange('experienceRating', star)}>
                                <Star className={`w-8 h-8 transition-colors ${formData.experienceRating >= star ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <InputField icon={CalendarIcon} name="dateSmoked" label="Date & Time" type="datetime-local" value={formData.dateSmoked.substring(0, 16)} onChange={handleInputChange} theme={theme} />
                <InputField icon={MapPin} name="location" label="Location" placeholder="e.g., Back Patio" value={formData.location} onChange={handleInputChange} theme={theme} />
                <InputField icon={GlassWater} name="pairing" label="Drink Pairing" placeholder="e.g., Espresso, Bourbon" value={formData.pairing} onChange={handleInputChange} theme={theme} />

                <div id="pnlPerformanceStarRatings" className="bg-gray-800/50 p-4 rounded-xl space-y-4">
                    <h3 className="text-lg font-semibold text-amber-300 text-center">Performance Ratings</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">Draw</label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => handleRatingChange('drawRating', star)}>
                                        <Star className={`w-6 h-6 transition-colors ${formData.drawRating >= star ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">Burn</label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => handleRatingChange('burnRating', star)}>
                                        <Star className={`w-6 h-6 transition-colors ${formData.burnRating >= star ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">Ash</label>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => handleRatingChange('ashRating', star)}>
                                        <Star className={`w-6 h-6 transition-colors ${formData.ashRating >= star ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="firstThirdNotes" className="block text-sm font-medium text-gray-300">First Third Notes</label>
                        <button onClick={() => setIsFlavorWheelOpen(true)} className="text-gray-400 hover:text-white">
                            <HelpCircle className="w-5 h-5" />
                        </button>
                    </div>
                    <TextAreaField name="firstThirdNotes" placeholder="e.g., Peppery, with hints of cedar..." value={formData.firstThirdNotes} onChange={handleInputChange} theme={theme} rows={3} />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="secondThirdNotes" className="block text-sm font-medium text-gray-300">Second Third Notes</label>
                        <button onClick={() => setIsFlavorWheelOpen(true)} className="text-gray-400 hover:text-white">
                            <HelpCircle className="w-5 h-5" />
                        </button>
                    </div>
                    <TextAreaField name="secondThirdNotes" placeholder="e.g., Mellowed into cocoa and leather..." value={formData.secondThirdNotes} onChange={handleInputChange} theme={theme} rows={3} />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="finalThirdNotes" className="block text-sm font-medium text-gray-300">Final Third Notes</label>
                        <button onClick={() => setIsFlavorWheelOpen(true)} className="text-gray-400 hover:text-white">
                            <HelpCircle className="w-5 h-5" />
                        </button>
                    </div>
                    <TextAreaField name="finalThirdNotes" placeholder="e.g., A sweet, creamy finish..." value={formData.finalThirdNotes} onChange={handleInputChange} theme={theme} rows={3} />
                </div>  
                <InputField name="burnTimeMinutes" label="Burn Time (minutes)" type="number" placeholder="e.g., 75" value={formData.burnTimeMinutes} onChange={handleInputChange} theme={theme} />

                <div className="pt-4 flex space-x-4">
                    <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors">
                        <Save className="w-5 h-5" /> {isEditing ? 'Save Changes' : 'Save Entry'}
                    </button>
                    {isEditing && (
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" /> Delete
                        </button>
                    )}
                </div>




            </div>


            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold text-red-400 flex items-center">
                                <Trash2 className="w-5 h-5 mr-2" /> Delete Journal Entry
                            </h3>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <p className="text-gray-300 mb-4">
                            Are you sure you want to delete this journal entry? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-700">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    await handleDelete();
                                    setIsDeleteModalOpen(false);
                                }}
                                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Ensures the panel is tall enough to show the full wheel and flavor chips, and stays above bottom navigation.
            Adjust h-[80vh] or max-h-[calc(100vh-5rem)] as needed for your layout. */}
            {isFlavorWheelOpen && (
                <div
                    id="pnlFlavorWheelPanel"
                    className="fixed inset-x-0 bottom-0 z-40 h-[60vh] max-h-[calc(80vh-5rem)] transform-gpu transition-transform duration-300 ease-in-out overflow-y-auto"
                    style={{ transform: isFlavorWheelOpen ? 'translateY(0)' : 'translateY(100%)' }}
                >
                    <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 shadow-2xl h-full flex flex-col">
                        <div className="flex-shrink-0 p-4 flex justify-between items-center border-b border-gray-700">
                            <h3 id="flavorWheelTitle" className="text-xl font-bold text-amber-400 flex items-center">
                                {/* <BrowseIcon className="w-5 h-5 mr-2" /> */}
                                Flavor Wheel
                            </h3>
                            <button onClick={() => setIsFlavorWheelOpen(false)} className="text-amber-400 font-semibold">Done</button>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto">
                            <FlavorWheel onFlavorSelect={() => { }} />
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default AddEditJournalEntry;