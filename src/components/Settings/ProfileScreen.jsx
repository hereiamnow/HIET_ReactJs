import React, { useMemo, useState } from 'react';
import {    ChevronDown,ChevronLeft, Box, MapPin, Database, Star, DollarSign, Zap, LogOut, Wind
} from 'lucide-react';


const ProfileScreen = ({ navigate, cigars, humidors, theme, userId, auth }) => {
    const totalCigars = cigars.reduce((sum, c) => sum + c.quantity, 0);
    const totalValue = cigars.reduce((acc, cigar) => acc + ((cigar.price || 0) * cigar.quantity), 0);
    const uniqueCountries = useMemo(() => [...new Set(cigars.map(c => c.country).filter(Boolean))], [cigars]);
    const [isAchievementsCollapsed, setIsAchievementsCollapsed] = useState(true);

    // --- MOCK SUBSCRIPTION DATA ---
    const subscription = {
        plan: 'Premium',
        status: 'Active',
        renewsOn: 'August 14, 2025',
        aiLookupsUsed: 27,
        aiLookupsLimit: 100,
    };
    // --- END OF MOCK DATA ---

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

    const user = auth?.currentUser;
    const displayName = user?.displayName || "Cigar Aficionado";
    const email = user?.email || "Anonymous";
    const photoURL = user?.photoURL || "https://placehold.co/100x100/3a2d27/ffffff?text=User";
    const memberSince = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).getFullYear()
        : "2024";

    const handleLogout = async () => {
        if (auth) {
            await auth.signOut();
            window.location.reload();
        }
    };

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

    const DollarSignIcon = (props) => (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    );

    return (
        <div className="p-4 pb-24">
            <div id="pnlProfileHeader" className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className="w-7 h-7 text-white" /></button>
                <h1 className="text-3xl font-bold text-white">Profile</h1>
            </div>
            <div className="space-y-6">
                {/* --- Profile Info Panel --- */}
                <div id="pnlProfileInfo" className="flex flex-col items-center p-6 bg-gray-800/50 rounded-xl">
                    <img src={photoURL} alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-amber-400" />
                    <h2 className="text-2xl font-bold text-white mt-4">{displayName}</h2>
                    <p className="text-gray-400">{email}</p>
                </div>
                {/* --- Achievements Panel --- */}
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
                {/* --- Subscription Panel --- */}
                <div id="pnlSubscription" className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 p-4 rounded-xl border border-amber-400/50 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-amber-200 text-lg flex items-center">
                            <Zap className="w-5 h-5 mr-2" /> Subscription
                        </h3>
                        <span className="px-3 py-1 text-xs font-bold text-black bg-amber-400 rounded-full uppercase">{subscription.plan}</span>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-300">Status:</span>
                            <span className="font-semibold text-green-400">{subscription.status}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-300">Renews on:</span>
                            <span className="font-semibold text-white">{subscription.renewsOn}</span>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-gray-300">AI Lookups this month:</span>
                                <span className="font-semibold text-white">{subscription.aiLookupsUsed} / {subscription.aiLookupsLimit}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(subscription.aiLookupsUsed / subscription.aiLookupsLimit) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                    {/* 
                    for a direct link to your app’s subscription:
                    https://play.google.com/store/account/subscriptions?sku=YOUR_SUBSCRIPTION_ID&package=YOUR_APP_PACKAGE 
                    */}
                    <button
                        className="mt-4 w-full bg-amber-500 text-white font-bold py-2 rounded-lg hover:bg-amber-600 transition-colors"
                        onClick={() => window.open('https://play.google.com/store/account/subscriptions', '_blank')}
                    >
                        Manage Subscription
                    </button>
                </div>
                <button
                    className="w-full flex items-center justify-center gap-2 bg-red-800/80 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5" />Log Out
                </button>
            </div>
        </div>
    );
};

export default ProfileScreen;
