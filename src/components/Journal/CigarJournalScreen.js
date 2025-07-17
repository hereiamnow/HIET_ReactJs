import React, { useMemo, useState } from 'react';
import { BookText, Search, X, Trash2 } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import JournalEntryCard from './JournalEntryCard';

const CigarJournalScreen = ({ navigate, journalEntries, theme, db, appId, userId }) => {
    const [entryToDelete, setEntryToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const sortedEntries = useMemo(() => {
        return [...journalEntries].sort((a, b) => new Date(b.dateSmoked) - new Date(a.dateSmoked));
    }, [journalEntries]);

    const filteredEntries = useMemo(() => {
        if (!searchQuery) return sortedEntries;
        const lowercasedQuery = searchQuery.toLowerCase();
        return sortedEntries.filter(entry =>
            entry.cigarName.toLowerCase().includes(lowercasedQuery) ||
            entry.cigarBrand.toLowerCase().includes(lowercasedQuery) ||
            (entry.notes && entry.notes.toLowerCase().includes(lowercasedQuery)) ||
            (entry.firstThirdNotes && entry.firstThirdNotes.toLowerCase().includes(lowercasedQuery)) ||
            (entry.secondThirdNotes && entry.secondThirdNotes.toLowerCase().includes(lowercasedQuery)) ||
            (entry.finalThirdNotes && entry.finalThirdNotes.toLowerCase().includes(lowercasedQuery))
        );
    }, [sortedEntries, searchQuery]);

    const handleEdit = (entry) => {
        navigate('AddEditJournalEntry', { cigarId: entry.cigarId, entryId: entry.id });
    };

    const handleDelete = async () => {
        if (entryToDelete) {
            const docRef = doc(db, 'artifacts', appId, 'users', userId, 'journalEntries', entryToDelete.id);
            await deleteDoc(docRef);
            setIsDeleteModalOpen(false);
            setEntryToDelete(null);
            navigate('CigarJournal');
        }
    };

    return (
        <div className="p-4 pb-24">
            <div className="flex items-center mb-6">
                <BookText className={`w-8 h-8 mr-3 ${theme.primary}`} />
                <h1 className="text-3xl font-bold text-white">Cigar Journal</h1>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search journal entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {filteredEntries.length > 0 ? (
                    filteredEntries.map(entry => (
                        <JournalEntryCard
                            key={entry.id}
                            entry={entry}
                            onEdit={handleEdit}
                            onDelete={() => {
                                setEntryToDelete(entry);
                                setIsDeleteModalOpen(true);
                            }}
                            theme={theme}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 bg-gray-800/50 rounded-xl">
                        <BookText className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                        <h3 className="font-bold text-white">Your Journal is Empty</h3>
                        <p className="text-gray-400 mt-2">Smoke a cigar and log your experience to start your journal.</p>
                    </div>
                )}
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

        </div>
    );
};

export default CigarJournalScreen;