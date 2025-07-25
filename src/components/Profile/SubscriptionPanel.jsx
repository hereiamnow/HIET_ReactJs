import React from 'react';
import { Zap } from 'lucide-react';

const SubscriptionPanel = ({ subscription }) => {
    return (
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
            for a direct link to your app's subscription:
            https://play.google.com/store/account/subscriptions?sku=YOUR_SUBSCRIPTION_ID&package=YOUR_APP_PACKAGE 
            */}
            <button
                className="mt-4 w-full bg-amber-500 text-white font-bold py-2 rounded-lg hover:bg-amber-600 transition-colors"
                onClick={() => window.open('https://play.google.com/store/account/subscriptions', '_blank')}
            >
                Manage Subscription
            </button>
        </div>
    );
};

export default SubscriptionPanel;