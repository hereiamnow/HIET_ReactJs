/**
 * Gauge - Component for displaying humidity and temperature in a circular gauge format
 * @param {Object} props - Component props
 * @param {number} props.value - Current value to display
 * @param {number} props.maxValue - Maximum value for the gauge
 * @param {string} props.label - Label text to display below the value
 * @param {string} props.unit - Unit symbol to display (e.g., '%', '°F')
 * @param {React.Component} props.icon - Icon component to display
 */
import React from 'react';

const Gauge = ({ value, maxValue, label, unit, icon: Icon }) => {
    const percentage = Math.min(Math.max(value / maxValue, 0), 1);
    const isOptimalHum = value >= 68 && value <= 72 && unit === '%';
    const isOptimalTemp = value >= 65 && value <= 70 && unit === '°F';
    const ringColor = (isOptimalHum || isOptimalTemp) ? 'stroke-green-400' : 'stroke-yellow-400';

    return (
        <div className="relative flex flex-col items-center justify-center w-40 h-40 sm:w-48 sm:h-48">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="stroke-current text-gray-700"
                    cx="60"
                    cy="60"
                    r="50"
                    strokeWidth="10"
                    fill="none"
                />
                <circle
                    className={`transform -rotate-90 origin-center transition-all duration-500 ${ringColor}`}
                    cx="60"
                    cy="60"
                    r="50"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="314"
                    strokeDashoffset={314 - (percentage * 314)}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                {Icon && <Icon className="w-8 h-8 mb-1 text-gray-300" />}
                <span className="text-4xl font-bold text-white">{value.toFixed(0)}<span className="text-2xl">{unit}</span></span>
                <span className="text-sm text-gray-400">{label}</span>
            </div>
        </div>
    );
};

export default Gauge;