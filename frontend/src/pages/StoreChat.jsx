import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicOwner } from '../services/api.js';
import ChatView from '../components/ChatView.jsx';
import { Store, AlertTriangle, ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';

const StoreChat = () => {
    const { ownerDomain } = useParams();
    const { isAuthenticated } = useAuth();
    const [owner, setOwner] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOwner = async () => {
            try {
                const res = await getPublicOwner(ownerDomain);
                if (res.status === 'success') {
                    setOwner(res.owner);
                }
            } catch (err) {
                console.error('Failed to load store:', err);
                setError('Store not found or unavailable.');
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

    if (error || !owner) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc] p-6 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6">
                    <AlertTriangle className="w-10 h-10 text-rose-500" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">Store Not Found</h1>
                <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                    The link you followed might be broken or the store domain doesn't exist in our system.
                </p>
                <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all">
                    <ArrowLeft className="w-5 h-5" /> Back to Home
                </Link>
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
                        <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Shopping Assistant</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            <Link
                                to={`/login?store=${ownerDomain}`}
                                className="flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                                <LogIn className="w-4 h-4" /> Sign In
                            </Link>
                            <Link
                                to={`/register?store=${ownerDomain}`}
                                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                            >
                                <UserPlus className="w-4 h-4" /> Register
                            </Link>
                        </div>
                    ) : (
                        <Link to="/" className="text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-indigo-600 transition-colors">
                            Power by Heart
                        </Link>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <ChatView ownerId={owner.id} storeSlug={ownerDomain} />
            </main>
        </div>
    );
};

export default StoreChat;
