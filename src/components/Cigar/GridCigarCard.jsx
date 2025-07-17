import React from 'react';
import { Check } from 'lucide-react'; 
import { getRatingColor } from '../utils/getRatingColor'; 
import { calculateAge } from '../utils/calculateAge';

const GridCigarCard = ({ cigar, navigate, isSelectMode, isSelected, onSelect }) => {
    const ratingColor = getRatingColor(cigar.rating);
    const clickHandler = isSelectMode ? () => onSelect(cigar.id) : () => navigate('CigarDetail', { cigarId: cigar.id });

    return (
        <div className="relative" onClick={clickHandler}>
            <div className={`bg-gray-800/50 rounded-xl overflow-hidden group cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-amber-400' : ''}`}>
                <div className="relative">
                    <img
                        src={cigar.image || `https://placehold.co/400x600/5a3825/ffffff?text=${cigar.brand.replace(/\s/g, '+')}`}
                        alt={`${cigar.brand} ${cigar.name}`}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 rounded-lg px-2 py-1 max-w-[70%]">
                        <p className="text-gray-200 text-xs font-semibold uppercase truncate">
                            {cigar.brand}
                            {cigar.country ? ` - ${cigar.country}` : ''}
                        </p>
                        <h3 className="text-white font-bold text-sm truncate">{cigar.name}</h3>
                    </div>
                    {cigar.rating > 0 && (
                        <div className={`absolute bottom-2 right-2 flex items-center justify-center rounded-full border-2 ${ratingColor} bg-black/70`} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}>
                            <span className="text-sm font-bold text-white">{cigar.rating}</span>
                        </div>
                    )}
                </div>
                <div className="p-3 space-y-3">
                    {/* Details */}
                    <div className="text-xs space-y-2">
                        <div id="pnlShapeSizeStrength" className="grid grid-cols-3 gap-x-2 mb-2 text-left">
                            <div>
                                <p className="text-gray-400">Shape</p>
                                <p className="font-semibold text-gray-200 truncate" title={cigar.shape}>{cigar.shape || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Size</p>
                                <p className="font-semibold text-gray-200 truncate" title={cigar.size}>{cigar.size || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Strength</p>
                                <p className="font-semibold text-gray-200 truncate" title={cigar.strength}>{cigar.strength || 'N/A'}</p>
                            </div>
                        </div>

                        <div id="pnlWrapperBinderFiller" className="grid grid-cols-3 gap-x-2 text-left">
                            <div>
                                <p className="text-gray-400">Wrapper</p>
                                <p className="font-semibold text-gray-200 truncate" title={cigar.wrapper}>{cigar.wrapper || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Binder</p>
                                <p className="font-semibold text-gray-200 truncate" title={cigar.binder}>{cigar.binder || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Filler</p>
                                <p className="font-semibold text-gray-200 truncate" title={cigar.filler}>{cigar.filler || 'N/A'}</p>
                            </div>
                        </div>
                        <div id="pnlShortDescription"> {cigar.shortDescription && <p className="text-gray-400 pt-1">{cigar.shortDescription}</p>}</div>

                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700/50">
                        <p className="text-gray-400 text-xs">Time in Humidor: <span className="font-semibold text-gray-200">{calculateAge(cigar.dateAdded)}</span></p>
                        <span id="cigar-quantity" className="text-lg font-bold bg-gray-700 text-white px-3 py-1 rounded-full">{cigar.quantity}</span>
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

export default GridCigarCard;
