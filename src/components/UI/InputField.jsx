import React from 'react';

const InputField = ({ name, label, placeholder, type = 'text', value, onChange, onBlur, theme, className = '', inputRef }) => (
    <div>
        <label className={`text-sm font-medium ${theme.subtleText} mb-1 block`}>{label}</label>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            onBlur={onBlur}
            ref={inputRef}
            className={`w-full ${theme.inputBg} border ${theme.borderColor} rounded-lg py-2 px-3 ${theme.text} placeholder-gray-500 focus:outline-none focus:ring-2 ${theme.ring} ${className}`}
        />
    </div>
);

export default InputField;
