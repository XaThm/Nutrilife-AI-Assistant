import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { AlertTriangleIcon, UserIcon, LockClosedIcon, GoogleIcon } from './common/Icon';
import { motion } from 'framer-motion';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [emailField, setEmailField] = useState('');
    const [passwordField, setPasswordField] = useState('');
    const [confirmPasswordField, setConfirmPasswordField] = useState('');
    const { login, signup, loginWithGoogle, isLoading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted");
        if (isLogin) {
            await login(emailField, passwordField);
        } else {
            await signup(emailField, passwordField, confirmPasswordField);
        }
    };

    const handleGoogleSignIn = async () => {
        await loginWithGoogle();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
             <div className="flex items-center space-x-3 mb-6">
                 <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center shadow-lg shadow-sky-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                 <h1 className="text-3xl font-bold text-slate-800 font-manrope">
                    NutriLife <span className="text-sky-500">AI</span>
                </h1>
            </div>
            <div className="w-full max-w-md">
                <Card className="!p-8">
                    <h2 className="text-2xl font-bold text-center text-slate-800 font-manrope">
                        {isLogin ? 'Welcome Back!' : 'Create Your Account'}
                    </h2>
                    <p className="text-center text-slate-500 mt-1 mb-8">
                        {isLogin ? 'Sign in to access your dashboard.' : 'Get started with your wellness journey.'}
                    </p>
                    
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-base font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                    >
                        <GoogleIcon />
                        Sign in with Google
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-slate-400">OR</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <UserIcon className="h-5 w-5 text-slate-400" />
                            </span>
                            <input
                                type="email"
                                id="email"
                                value={emailField}
                                onChange={(e) => setEmailField(e.target.value)}
                                className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                placeholder="Email address"
                                required
                                aria-label="Email address"
                            />
                        </div>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <LockClosedIcon className="h-5 w-5 text-slate-400" />
                            </span>
                            <input
                                type="password"
                                id="password"
                                value={passwordField}
                                onChange={(e) => setPasswordField(e.target.value)}
                                className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                placeholder="Password"
                                required
                                aria-label="Password"
                            />
                        </div>

                        {!isLogin && (
                             <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <LockClosedIcon className="h-5 w-5 text-slate-400" />
                                </span>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPasswordField}
                                    onChange={(e) => setConfirmPasswordField(e.target.value)}
                                    className="w-full p-3 pl-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                    placeholder="Confirm Password"
                                    required
                                    aria-label="Confirm Password"
                                />
                            </div>
                        )}
                        
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="flex items-center bg-red-50 text-red-700 text-sm font-medium p-3 rounded-lg border border-red-200">
                                    <AlertTriangleIcon className="h-5 w-5 mr-2" />
                                    <span className="capitalize">{error}</span>
                                </div>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
                        >
                            {isLoading ? <Spinner /> : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-sky-600 hover:text-sky-500">
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default Auth;