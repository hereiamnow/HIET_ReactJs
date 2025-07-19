/**
 * StatCard - Component for displaying a single statistic on the dashboard
 * @param {Object} props - Component props
 * @param {string} props.title - The title/label for the statistic
 * @param {string|number} props.value - The value to display
 * @param {React.Component} props.icon - Icon component to display
 * @param {Object} props.theme - Theme object for styling
 */
import React from 'react';

const StatCard = ({ title, value, icon: Icon, theme }) => (
    <div className={`${theme.card} p-3 rounded-md  flex items-center space-x-3 w-full min-w-0`}>
        {Icon && (
            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <Icon className={`w-6 h-6 ${theme.primary}`} />
            </div>
        )}
        <div className="flex flex-col min-w-0 ">
            <p className={`${theme.subtleText} text-xs truncate`}>{title}</p>
            <p className={`${theme.text} font-bold text-lg truncate`}>{value}</p>
        </div>
    </div>
);

export default StatCard;