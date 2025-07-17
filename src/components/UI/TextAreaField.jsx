import React from 'react';

const TextAreaField = ({ name, label, placeholder, value, onChange, theme, className = '' }) => (
    <div>
        <label className={`text-sm font-medium ${theme.subtleText} mb-1 block`}>{label}</label>
        <textarea
            name={name}
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            rows="3"
            className={`w-full ${theme.inputBg} border ${theme.borderColor} rounded-lg py-2 px-3 ${theme.text} placeholder-gray-500 focus:outline-none focus:ring-2 ${theme.ring} ${className}`}
        />
    </div>
);

export default TextAreaField;
