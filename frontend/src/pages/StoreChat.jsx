import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicOwner } from '../services/api.js';
import ChatView from '../components/ChatView.jsx';
import { Store, AlertTriangle, ArrowLeft, LogIn, UserPlus, Home, Lock, MessageSquareOff } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { useChat } from '../context/ChatContext.js';
import api from '../services/api.js';

const StoreChat = () => {
    const { t, i18n } = useTranslation();
    const { ownerDomain } = useParams();
    const { isAuthenticated } = useAuth();
    const [owner, setOwner] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { sendMessage } = useChat();

    const toggleLanguage = async () => {
        const nextLng = i18n.language === 'id' ? 'en' : 'id';
        i18n.changeLanguage(nextLng);

        if (isAuthenticated) {
            try {
                await api.patch('/auth/profile', { language: nextLng });
            } catch (err) {
                console.error('Failed to update language in profile:', err);
            }
        }

        const prompt = nextLng === 'en'
            ? "Switch to English mode now. Please respond in English."
            : "Ganti ke mode Bahasa Indonesia sekarang. Mohon respon dalam Bahasa Indonesia.";

        try {
            await sendMessage(prompt, true);
        } catch (err) {
            console.error('Failed to send language prompt:', err);
        }
    };

    useEffect(() => {
        const fetchOwner = async () => {
            try {
                const res = await getPublicOwner(ownerDomain);
                if (res.status === 'success') {
                    setOwner(res.owner);
                }
            } catch (err) {
                console.error('Failed to load store:', err);
                setError(err.response?.data?.message || 'Store not found or unavailable.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOwner();
    }, [ownerDomain]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !owner || owner.config?.showChat === false) {
        const isSuspended = error === 'This store is currently unavailable.';
        const isLocked = !isSuspended && owner?.config?.showChat === false;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8"
                >
                    <div className="flex justify-center">
                        <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center ${isSuspended ? 'bg-rose-50 text-rose-500' : isLocked ? 'bg-slate-100 text-slate-400' : 'bg-amber-50 text-amber-500'}`}>
                            {isSuspended ? <AlertTriangle className="w-10 h-10" /> : isLocked ? <Lock className="w-10 h-10" /> : <Store className="w-10 h-10" />}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight leading-tight uppercase italic text-center w-full">
                            {isSuspended ? 'Store Suspended' : isLocked ? 'Chat Locked' : t('store_not_found')}
                        </h1>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            {isSuspended
                                ? 'Oops! This store is currently under maintenance or has been suspended by the administrator.'
                                : isLocked
                                    ? 'Sorry, the chat feature for this store has been temporarily disabled by the administrator.'
                                    : t('store_not_found_desc')}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link
                            to="/"
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" /> {t('back_to_home')}
                        </Link>
                        {!isSuspended && !isLocked && (
                            <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest pt-2">
                                Please check the URL and try again
                            </p>
                        )}
                        {isLocked && (
                            <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest pt-2">
                                Please contact the store owner for more information
                            </p>
                        )}
                    </div>
                </Motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-white">
            <header className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <Store className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 uppercase tracking-tight leading-tight">{owner.name}</h2>
                        <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">{t('shopping_assistant')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-[10px] font-semibold uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                    >
                        <Languages className="w-3.5 h-3.5" />
                        {i18n.language === 'id' ? 'ID' : 'EN'}
                    </button>
                    {!isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            <Link
                                to={`/login?store=${ownerDomain}`}
                                className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                                <LogIn className="w-4 h-4" /> {t('sign_in')}
                            </Link>
                            <Link
                                to={`/register?store=${ownerDomain}`}
                                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-semibold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                            >
                                <UserPlus className="w-4 h-4" /> {t('register')}
                            </Link>
                        </div>
                    ) : (
                        <Link to="/" className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 hover:text-indigo-600 transition-colors">
                            Power by Heart
                        </Link>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <ChatView ownerId={owner.id} storeSlug={ownerDomain} excludeStaffChats={true} />
            </main>
        </div>
    );
};

export default StoreChat;
