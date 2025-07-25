/**
 * HumidorActionMenu - A dropdown menu for managing humidor actions
 * Provides options to add cigars, edit, take readings, export, delete, and import cigars
 * @param {Object} props - Component props
 * @param {Function} props.onAddCigar - Function to handle add cigar action
 * @param {Function} props.onEdit - Function to handle edit action
 * @param {Function} props.onTakeReading - Function to handle take reading action
 * @param {Function} props.onExport - Function to handle export action
 * @param {Function} props.onDelete - Function to handle delete action
 * @param {Function} props.onImport - Function to handle import action
 */
import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, PencilRuler, ClipboardPenLine, FileDown, FileUp, Trash, Plus } from 'lucide-react';

const HumidorActionMenu = ({ onAddCigar, onEdit, onTakeReading, onExport, onDelete, onImport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const MenuItem = ({ icon: Icon, text, onClick, className = '' }) => (
        <button
            onClick={() => {
                onClick();
                setIsOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-700 ${className}`}
        >
            <Icon className="w-5 h-5" />
            <span>{text}</span>
        </button>
    );

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-black/50 rounded-full text-white">
                <MoreVertical className="w-6 h-6" />
            </button>
            {isOpen && (
                <div id="pnlHumidorActionMenu" className="absolute top-full right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-30 overflow-hidden">
                    {/* <div className="border-t border-gray-700 my-1"></div> */}
                    <MenuItem icon={PencilRuler} text="Edit Humidor" onClick={onEdit} className="text-gray-200" />
                    <MenuItem icon={ClipboardPenLine} text="Take Reading" onClick={onTakeReading} className="text-gray-200" />
                    <div className="border-t border-gray-700 my-1"></div>
                    <MenuItem icon={Plus} text="Add Cigar" onClick={onAddCigar} className="text-gray-200" />
                    <MenuItem icon={FileDown} text="Import Cigars from CSV" onClick={onImport} className="text-gray-200" />
                    <MenuItem icon={FileUp} text="Export Cigars to CSV" onClick={onExport} className="text-gray-200" />
                    <div className="border-t border-gray-700 my-1"></div>
                    <MenuItem icon={Trash} text="Delete Humidor" onClick={onDelete} className="text-red-400 hover:bg-red-900/50" />
                </div>
            )}
        </div>
    );
};

export default HumidorActionMenu;