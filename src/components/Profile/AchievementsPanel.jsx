import React, { useMemo, useState } from 'react';
import { ChevronDown, Box, MapPin, Database, Star, DollarSign } from 'lucide-react';

const AchievementsPanel = ({ cigars, humidors, theme }) => {
    const [isAchievementsCollapsed, setIsAchievementsCollapsed] = useState(true);
    
    const totalCigars = cigars.reduce((sum, c) => sum + c.quantity, 0);
    const totalValue = cigars.reduce((acc, cigar) => acc + ((cigar.price || 0) * cigar.quantity), 0);
    const uniqueCountries = useMemo(() => [...new Set(cigars.map(c => c.country).filter(Boolean))], [cigars]);

    const achievementsList = useMemo(() => [
        { id: 'collector_bronze', name: 'Bronze Collector', description: 'Collect 10+ cigars', icon: Box, check: (stats) => stats.totalCigars >= 10 },
        { id: 'collector_silver', name: 'Silver Collector', description: 'Collect 50+ cigars', icon: Box, check: (stats) => stats.totalCigars >= 50 },
        { id: 'collector_gold', name: 'Gold Collector', description: 'Collect 100+ cigars', icon: Box, check: (stats) => stats.totalCigars >= 100 },
        { id: 'globetrotter_bronze', name: 'Globetrotter', description: 'Cigars from 3+ countries', icon: MapPin, check: (stats) => stats.uniqueCountries.length >= 3 },
        { id: 'globetrotter_silver', name: 'World Traveler', description: 'Cigars from 5+ countries', icon: MapPin, check: (stats) => stats.uniqueCountries.length >= 5 },
        { id: 'humidor_enthusiast', name: 'Humidor Enthusiast', description: 'Own 2+ humidors', icon: Database, check: (stats) => stats.humidors.length >= 2 },
        { id: 'aficionado', name: 'Aficionado', description: 'Rate 10+ cigars', icon: Star, check: (stats) => stats.cigars.filter(c => c.userRating > 0).length >= 10 },
        { id: 'high_roller', name: 'High Roller', description: 'Collection value over $500', icon: DollarSign, check: (stats) => stats.totalValue > 500 },
    ], []);

    const earnedAchievements = useMemo(() => {
        const stats = { totalCigars, totalValue, uniqueCountries, humidors, cigars };
        return achievementsList.map(ach => ({ ...ach, earned: ach.check(stats) }));
    }, [cigars, humidors, totalCigars, totalValue, uniqueCountries, achievementsList]);

    const BadgeIcon = ({ achievement }) => (
        <div className="flex flex-col items-center group relative">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${achievement.earned ? 'bg-amber-500/20 border-amber-400' : 'bg-gray-700/50 border-gray-600 opacity-60'}`}>
                <achievement.icon className={`w-8 h-8 ${achievement.earned ? 'text-amber-400' : 'text-gray-400'}`} />
            </div>
            <p className={`mt-2 text-xs text-center font-semibold ${achievement.earned ? 'text-white' : 'text-gray-500'}`}>{achievement.name}</p>
            <div className="absolute bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {achievement.description}
                {!achievement.earned && <span className="block text-gray-400">(Not earned yet)</span>}
            </div>
        </div>
    );

    return (
        <div id="pnlAchievements" className="bg-gray-800/50 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsAchievementsCollapsed(!isAchievementsCollapsed)}
                className="w-full p-4 flex justify-between items-center"
            >
                <h3 className="font-bold text-amber-300 text-lg flex items-center">
                    <Star className="w-5 h-5 mr-2" /> Achievements
                </h3>
                <ChevronDown className={`w-5 h-5 text-amber-300 transition-transform duration-300 ${isAchievementsCollapsed ? '' : 'rotate-180'}`} />
            </button>
            {!isAchievementsCollapsed && (
                <div className="px-4 pb-4">
                    <div className="grid grid-cols-4 gap-4">
                        {earnedAchievements.map(ach => (
                            <BadgeIcon key={ach.id} achievement={ach} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementsPanel;