import React, { useMemo, useState } from 'react';
import { BookText, Search, X } from 'lucide-react';
import JournalEntryCard from './JournalEntryCard';

const CigarJournalScreen = ({ navigate, journalEntries, theme, db, appId, userId }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const sortedEntries = useMemo(() => {
        return [...journalEntries].sort((a, b) => new Date(b.dateSmoked) - new Date(a.dateSmoked));
    }, [journalEntries]);

    const filteredEntries = useMemo(() => {
        if (!searchQuery) return sortedEntries;
        return sortedEntries.filter(entry =>
            entry.cigarName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.cigarBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (entry.notes && entry.notes.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [sortedEntries, searchQuery]);

    const handleEdit = (entry) => {
        navigate('AddEditJournalEntry', { cigarId: entry.cigarId, entryId: entry.id });
    };

    const handleDelete = async (entryId) => {
        if (window.confirm("Are you sure you want to delete this journal entry?")) {
            const { doc, deleteDoc } = await import('firebase/firestore');
            const entryRef = doc(db, 'artifacts', appId, 'users', userId, 'journalEntries', entryId);
            await deleteDoc(entryRef);
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
                            onDelete={handleDelete}
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
        </div>
    );
};

export default CigarJournalScreen;