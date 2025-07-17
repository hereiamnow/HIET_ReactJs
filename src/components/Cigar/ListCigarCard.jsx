import React from 'react';
import { Check } from 'lucide-react';
import { getRatingColor } from '../utils/getRatingColor';

const ListCigarCard = ({ cigar, navigate, isSelectMode, isSelected, onSelect }) => {
    const ratingColor = getRatingColor(cigar.rating);
    const clickHandler = isSelectMode ? () => onSelect(cigar.id) : () => navigate('CigarDetail', { cigarId: cigar.id });

    return (
        <div className="relative" onClick={clickHandler}>
            <div className={`bg-gray-800/50 rounded-xl overflow-hidden group cursor-pointer flex transition-all duration-200 ${isSelected ? 'ring-2 ring-amber-400' : ''}`}>
                <div className="relative flex-shrink-0">
                    <img src={cigar.image || `https://placehold.co/400x600/5a3825/ffffff?text=${cigar.brand.replace(/\s/g, '+')}`} alt={`${cigar.brand} ${cigar.name}`} className="w-28 h-full object-cover" />
                </div>
                <div className="p-3 flex-grow flex flex-col justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase">{cigar.brand}</p>
                        <h3 className="text-white font-bold text-base truncate">{cigar.name}</h3>
                    </div>
                    <div className="text-xs mt-2 space-y-1">
                        <p className="text-gray-400">Shape: <span className="font-semibold text-gray-200">{cigar.shape}</span></p>
                        <p className="text-gray-400">Size: <span className="font-semibold text-gray-200">{cigar.size}</span></p>
                        <p className="text-gray-400">Origin: <span className="font-semibold text-gray-200">{cigar.country}</span></p>
                        <p className="text-gray-400 truncate">Flavors: <span className="font-semibold text-gray-200">{cigar.flavorNotes.join(', ')}</span></p>
                        {cigar.rating > 0 && <div className="flex items-center gap-2">
                            <p className="text-gray-400">Rating:</p>
                            <div className={`text-xs font-bold text-white px-2 py-0.5 rounded-full border ${ratingColor}`}>{cigar.rating}</div>
                        </div>}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <p className="text-gray-400 text-xs">Strength: <span className="font-semibold text-gray-200">{cigar.strength}</span></p>
                        <span className="text-lg font-bold bg-gray-700 text-white px-3 py-1 rounded-full">{cigar.quantity}</span>
                    </div>
                </div>
            </div>
            {isSelectMode && (
                <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-amber-500 border-white' : 'bg-gray-900/50 border-gray-400'}`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
            )}
        </div>
    );
};

export default ListCigarCard;