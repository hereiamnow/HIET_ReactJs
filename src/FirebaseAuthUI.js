import React, { useState } from 'react';
import {
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    GoogleAuthProvider, signInWithPopup
} from 'firebase/auth';
import { Box } from 'lucide-react'; // Optional: Replace with your logo/icon

export default function CustomAuth({ onSignIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');

    const auth = getAuth();

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            let userCredential;
            if (isRegister) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }
            if (onSignIn) onSignIn(userCredential.user.uid);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            if (onSignIn) onSignIn(result.user.uid);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-900 via-gray-900 to-gray-800">
            <div className="bg-gray-800/90 rounded-2xl shadow-2xl p-8 w-full max-w-sm flex flex-col items-center">
                <Box className="w-14 h-14 text-amber-400 mb-4" />
                <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Humidor Hub</h1>
                <p className="text-gray-400 mb-6 text-center">Your personal cigar collection companion</p>
                <h2 className="text-xl font-bold text-white mb-4">{isRegister ? 'Create Account' : 'Sign In'}</h2>
                <form onSubmit={handleEmailAuth} className="flex flex-col gap-3 w-full">
                    <input
                        className="p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                    <input
                        className="p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg shadow transition-colors" type="submit">
                        {isRegister ? 'Register' : 'Sign In'}
                    </button>
                </form>
                <div className="my-4 flex items-center w-full">
                    <div className="flex-grow border-t border-gray-700"></div>
                    <span className="mx-3 text-gray-500 text-sm">or</span>
                    <div className="flex-grow border-t border-gray-700"></div>
                </div>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 shadow transition-colors"
                    onClick={handleGoogleSignIn}
                    type="button"
                >
                    <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 19.5-7.6 21-17.5.1-.8.1-1.6.1-2.5 0-1.4-.1-2.7-.3-4z" /><path fill="#34A853" d="M6.3 14.7l7 5.1C15.2 16.1 19.2 13 24 13c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.7 0-14.3 4.4-17.7 10.7z" /><path fill="#FBBC05" d="M24 45c5.8 0 10.7-1.9 14.6-5.2l-6.7-5.5C29.9 36.7 27.1 38 24 38c-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.7 41.6 15.3 45 24 45z" /><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.7 41.6 15.3 45 24 45c10.5 0 19.5-7.6 21-17.5.1-.8.1-1.6.1-2.5 0-1.4-.1-2.7-.3-4z" /></g></svg>
                    Sign in with Google
                </button>
                <button
                    className="mt-4 text-amber-400 underline text-sm"
                    onClick={() => setIsRegister(!isRegister)}
                    type="button"
                >
                    {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                </button>
                {error && <div className="mt-3 text-red-400 text-center">{error}</div>}
            </div>
            <div className="mt-8 text-gray-500 text-xs text-center">
                &copy; {new Date().getFullYear()} Humidor Hub &mdash; Secure, private, and for aficionados only.
            </div>
        </div>
    );
}