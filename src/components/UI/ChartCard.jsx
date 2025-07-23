import React from 'react';

const ChartCard = ({ title, children, action, theme }) => (
    <div className="bg-gray-800/50 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-4">
            <h3 className={`font-bold ${theme?.primary || 'text-amber-300'} text-lg`}>{title}</h3>
            {action}
        </div>
        <div className="h-64">
            {children}
        </div>
    </div>
);

export default ChartCard;
