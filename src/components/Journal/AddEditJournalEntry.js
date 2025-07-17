import React, { useState, useEffect } from 'react';
import { doc, addDoc, updateDoc, collection, deleteDoc } from 'firebase/firestore';
import { ChevronLeft, Star, MapPin, GlassWater, Calendar as CalendarIcon, Save, Trash2 } from 'lucide-react';
import InputField from '../UI/InputField';
import TextAreaField from '../UI/TextAreaField';

const AddEditJournalEntry = ({ navigate, db, appId, userId, cigar, existingEntry, theme }) => {
    const isEditing = !!existingEntry;
    const [formData, setFormData] = useState({
        dateSmoked: new Date().toISOString(),
        location: '',
        pairing: '',
        experienceRating: 0,
        notes: '',
        burnTimeMinutes: '',
        ...existingEntry,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (rating) => {
        setFormData(prev => ({ ...prev, experienceRating: rating }));
    };

    const handleSave = async () => {
        const collectionRef = collection(db, 'artifacts', appId, 'users', userId, 'journalEntries');
        const dataToSave = {
            ...formData,
            cigarId: cigar.id,
            cigarName: cigar.name,
            cigarBrand: cigar.brand,
            experienceRating: Number(formData.experienceRating),
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
        if (isEditing && window.confirm("Are you sure you want to delete this journal entry?")) {
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
                            <button key={star} onClick={() => handleRatingChange(star)}>
                                <Star className={`w-8 h-8 transition-colors ${formData.experienceRating >= star ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                <InputField icon={CalendarIcon} name="dateSmoked" label="Date & Time" type="datetime-local" value={formData.dateSmoked.substring(0, 16)} onChange={handleInputChange} theme={theme} />
                <InputField icon={MapPin} name="location" label="Location" placeholder="e.g., Back Patio" value={formData.location} onChange={handleInputChange} theme={theme} />
                <InputField icon={GlassWater} name="pairing" label="Drink Pairing" placeholder="e.g., Espresso, Bourbon" value={formData.pairing} onChange={handleInputChange} theme={theme} />
                <TextAreaField name="notes" label="Tasting Notes" placeholder="e.g., First third was peppery, mellowed into cocoa..." value={formData.notes} onChange={handleInputChange} theme={theme} rows={5} />
                <InputField name="burnTimeMinutes" label="Burn Time (minutes)" type="number" placeholder="e.g., 75" value={formData.burnTimeMinutes} onChange={handleInputChange} theme={theme} />

                <div className="pt-4 flex space-x-4">
                    <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors">
                        <Save className="w-5 h-5" /> {isEditing ? 'Save Changes' : 'Save Entry'}
                    </button>
                    {isEditing && (
                        <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors">
                            <Trash2 className="w-5 h-5" /> Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddEditJournalEntry;