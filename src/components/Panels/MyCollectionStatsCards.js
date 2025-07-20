import React from 'react';
import StatCard from '../UI/StatCard';
import { Cigarette, DollarSign, Box } from 'lucide-react';

const MyCollectionStatsCards = ({ totalCigars, totalValue, humidors, theme }) => {
    return (
        <div id="my-collection-stats" className="grid grid-cols-3 sm:grid-cols-3 gap-2 mb-6">
            <StatCard icon={Cigarette} value={totalCigars} label="Cigars" theme={theme} />
            <StatCard icon={DollarSign} value={`$${totalValue.toFixed(0)}`} label="Value" theme={theme} />
            <StatCard icon={Box} value={humidors.length} label="Humidors" theme={theme} />
        </div>
    );
};

export default MyCollectionStatsCards;