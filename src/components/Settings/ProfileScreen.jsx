import React, { useMemo, useState } from 'react';
import { ChevronLeft, LogOut } from 'lucide-react';
import AchievementsPanel from '../Profile/AchievementsPanel';
import SubscriptionPanel from '../Profile/SubscriptionPanel';

const ProfileScreen = ({ navigate, cigars, humidors, theme, userId, auth }) => {
    // --- MOCK SUBSCRIPTION DATA ---
    const subscription = {
        plan: 'Premium',
        status: 'Active',
        renewsOn: 'August 14, 2025',
        aiLookupsUsed: 27,
        aiLookupsLimit: 100,
    };
    // --- END OF MOCK DATA ---

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

    return (
        <div className="p-4 pb-24">
            <div id="pnlProfileHeader" className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2">
                    <ChevronLeft className="w-7 h-7 text-white" />
                </button>
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
                <AchievementsPanel cigars={cigars} humidors={humidors} theme={theme} />

                {/* --- Subscription Panel --- */}
                <SubscriptionPanel subscription={subscription} />

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