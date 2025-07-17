import React from 'react';
import { Star, MapPin, GlassWater, Calendar as CalendarIcon, MoreVertical, Edit, Trash2 } from 'lucide-react';

const JournalEntryCard = ({ entry, onEdit, onDelete, theme }) => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const menuRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    const RatingStars = ({ rating }) => (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
            ))}
        </div>
    );

    return (
        <div className={`${theme.card} p-4 rounded-xl shadow-lg relative`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs text-gray-400 flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> {formatDate(entry.dateSmoked)}</p>
                    <h4 className="font-bold text-lg text-white mt-1">{entry.cigarName}</h4>
                    <p className="text-sm text-gray-300">{entry.cigarBrand}</p>
                </div>
                <div className="flex flex-col items-end">
                    <RatingStars rating={entry.experienceRating} />
                    <p className="text-xs text-gray-400 mt-1">{entry.experienceRating}/5 Stars</p>
                </div>
            </div>

            <div className="mt-4 border-t border-gray-700 pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-gray-300">{entry.location || 'No location specified'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <GlassWater className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-gray-300">{entry.pairing || 'No pairing specified'}</span>
                </div>
            </div>

            <div className="mt-4 border-t border-gray-700 pt-4">
                <h5 className="text-sm font-semibold text-amber-300 mb-3">Performance</h5>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="text-xs text-gray-400">Draw</p>
                        <RatingStars rating={entry.drawRating || 0} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Burn</p>
                        <RatingStars rating={entry.burnRating || 0} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Ash</p>
                        <RatingStars rating={entry.ashRating || 0} />
                    </div>
                </div>
            </div>


            <div className="mt-4 border-t border-gray-700 pt-4 space-y-3">
                <h5 className="text-sm font-semibold text-amber-300">Tasting Notes</h5>
                <div className="text-sm text-gray-400 space-y-2 pl-2 border-l-2 border-gray-700">
                    <p><strong>1/3:</strong> {entry.firstThirdNotes || 'N/A'}</p>
                    <p><strong>2/3:</strong> {entry.secondThirdNotes || 'N/A'}</p>
                    <p><strong>3/3:</strong> {entry.finalThirdNotes || 'N/A'}</p>
                </div>
            </div>

            <div className="absolute top-4 right-4" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded-full hover:bg-gray-700">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
                {menuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 overflow-hidden">
                        <button onClick={() => { onEdit(entry); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left text-gray-200 hover:bg-gray-700">
                            <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => { onDelete(entry.id); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left text-red-400 hover:bg-red-900/50">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JournalEntryCard;