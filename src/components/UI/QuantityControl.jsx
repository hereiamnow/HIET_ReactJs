import React from 'react';
import { Minus, Plus } from 'lucide-react';

const QuantityControl = ({ quantity, onChange, theme }) => (
    <div className="flex items-center gap-4">
        <button type="button" onClick={() => onChange(quantity - 1)} className={`${theme.button} text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl active:bg-gray-500 disabled:opacity-50`} disabled={quantity <= 0}>
            <Minus className="w-6 h-6" />
        </button>
        {/* Increased font size for the quantity display */}
        <span className={`text-5xl ${quantity === 0 ? 'text-red-500' : theme.text} font-bold w-16 text-center`}>{quantity}</span>
        <button type="button" onClick={() => onChange(quantity + 1)} className={`${theme.button} text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl active:bg-gray-500`}>
            <Plus className="w-6 h-6" />
        </button>
    </div>
);

export default QuantityControl;
