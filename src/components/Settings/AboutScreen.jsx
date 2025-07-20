import React, { useState } from 'react';
import { ChevronLeft, Box, Github, Bug, X } from 'lucide-react';

const AboutScreen = ({ navigate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', text: '' });
    const privacyPolicyText = "Your data is stored securely in your private Firestore database and is not shared. We respect your privacy.\n\nEffective Date: July 4, 2025";
    const termsOfServiceText = "By using Humidor Hub, you agree to track your cigars responsibly. This app is for informational purposes only. Enjoy your collection!\n\nLast Updated: July 4, 2025";

    // Read the version from environment variables, with a fallback for development
    const appVersion = process.env.REACT_APP_VERSION || '1.1.0-dev';

    const showModal = (type) => {
        setModalContent({ title: type === 'privacy' ? 'Privacy Policy' : 'Terms of Service', text: type === 'privacy' ? privacyPolicyText : termsOfServiceText });
        setIsModalOpen(true);
    };

    const LinkItem = ({ icon: Icon, text, href }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-amber-400 hover:underline text-sm">
            <Icon className="w-4 h-4" />
            <span>{text}</span>
        </a>
    );

    return (
        <div className="p-4 pb-24">
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100]" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-amber-400">{modalContent.title}</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X /></button></div>
                        <p className="text-gray-300 whitespace-pre-wrap">{modalContent.text}</p>
                    </div>
                </div>
            )}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('Settings')} className="p-2 -ml-2 mr-2"><ChevronLeft className="w-7 h-7 text-white" /></button>
                <h1 className="text-3xl font-bold text-white">About Humidor Hub</h1>
            </div>
            <div className="space-y-6">
                <div className="bg-gray-800/50 p-6 rounded-xl text-center">
                    <div className="flex flex-col items-center">
                        <Box className="w-16 h-16 text-amber-400 mb-4" />
                        <h2 className="text-2xl font-bold text-white">Humidor Hub</h2>
                        <p className="text-gray-400">Version {appVersion}</p>
                    </div>
                    <p className="text-gray-300 text-center mt-4">Your personal assistant for managing and enjoying your cigar collection.</p>
                    <div className="border-t border-gray-700 pt-4 mt-4 space-y-2">
                        <p className="text-sm text-gray-400">Developed with passion by Shawn Miller.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => showModal('privacy')} className="text-amber-400 hover:underline text-sm">Privacy Policy</button>
                            <button onClick={() => showModal('terms')} className="text-amber-400 hover:underline text-sm">Terms of Service</button>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 p-6 rounded-xl">
                    <h3 className="font-bold text-amber-300 text-lg mb-4">Acknowledgements & Links</h3>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-400">This app is built with amazing open-source technology.</p>
                        <div className="flex flex-col items-start gap-3 pt-2">
                            <LinkItem icon={Github} text="View Source on GitHub" href="https://github.com/hereiamnow/HIET_ReactJs" />
                            <LinkItem icon={Bug} text="Report an Issue" href="mailto:hereiamnow@gmail.com?subject=Humidor Hub Feedback" />
                        </div>
                        <div className="border-t border-gray-700 pt-3 mt-3">
                            <p className="text-xs text-gray-500">Powered by React, Firebase, Lucide Icons, and the Google Gemini API.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutScreen;