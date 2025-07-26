/**
 * ProfileScreen.jsx
 * 
 * User profile screen component that displays user information, achievements, 
 * subscription details, and logout functionality. Part of the settings flow
 * in the cigar inventory management application.
 * 
 * Features:
 * - User avatar, name, and email display
 * - Achievements panel showing user statistics
 * - Subscription status and usage information
 * - Logout functionality with Firebase auth integration
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.navigate - Navigation function
 * @param {Array} props.cigars - User's cigar collection
 * @param {Array} props.humidors - User's humidor collection
 * @param {string} props.theme - Current theme setting
 * @param {string} props.userId - Current user ID
 * @param {Object} props.auth - Firebase auth instance
 */

import React, { useMemo, useState } from 'react';
import { ChevronLeft, LogOut } from 'lucide-react';
import AchievementsPanel from '../Profile/AchievementsPanel';
import SubscriptionPanel from '../Profile/SubscriptionPanel';
import GeminiKeySection from '../../services/GeminiKeySection';

const ProfileScreen = ({ navigate, cigars, humidors, theme, userId, auth }) => {
    console.log('ProfileScreen rendered with props:', {
        navigate: typeof navigate,
        cigarsCount: cigars?.length,
        humidorsCount: humidors?.length,
        theme,
        userId
    });

    // --- MOCK SUBSCRIPTION DATA ---
    const subscription = {
        plan: 'Premium',
        status: 'Active',
        renewsOn: 'August 14, 2025',
        aiLookupsUsed: 27,
        aiLookupsLimit: 100,
    };
    console.log('Mock subscription data:', subscription);
    // --- END OF MOCK DATA ---

    const user = auth?.currentUser;
    console.log('Current user from auth:', user ? {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        creationTime: user.metadata?.creationTime
    } : 'No user found');

    const displayName = user?.displayName || "Cigar Aficionado";
    const email = user?.email || "Anonymous";
    const photoURL = user?.photoURL || "https://placehold.co/100x100/3a2d27/ffffff?text=User";
    const memberSince = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).getFullYear()
        : "2024";

    console.log('Processed user data:', { displayName, email, photoURL, memberSince });

    const handleLogout = async () => {
        console.log('Logout button clicked');
        if (auth) {
            console.log('Attempting to sign out user');
            try {
                await auth.signOut();
                console.log('User signed out successfully, reloading page');
                window.location.reload();
            } catch (error) {
                console.error('Error during logout:', error);
            }
        } else {
            console.warn('No auth instance available for logout');
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

                <GeminiKeySection></GeminiKeySection>
                
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