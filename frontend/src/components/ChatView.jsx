import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bot, User, Star, BadgeCheck,
    ArrowUp, Headset, X, Package, Layers, Tag, Info,
    ShoppingCart, AlarmClock, MapPin, Grid, Languages
} from 'lucide-react';
import {
    addRating, addReminder,
    addToShoppingList, callStaff, getChatPolling,
    stopStaffSupport, getProductsByOwner
} from '../services/api.js';
import api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { motion as Motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../context/ChatContext.js';
import { useDisability } from '../context/DisabilityContext.js';
import { useToast } from '../context/ToastContext.js';
import { useTranslation } from 'react-i18next';
import StoreMap from './StoreMap.jsx';

const ChatView = ({ ownerId: propOwnerId, storeSlug }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const {
        messages, setMessages, sendMessage: sendMessageCtx, isLoading: isChatLoading
    } = useChat();
    const { isDisabilityMode, speak } = useDisability();
    const { showToast } = useToast();
    const { t, i18n } = useTranslation();

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLiveSupport, setIsLiveSupport] = useState(false);
    const [callStatus, setCallStatus] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [catalogProducts, setCatalogProducts] = useState([]);
    const messagesEndRef = useRef(null);
    const pollingRef = useRef(null);
    const callPollingRef = useRef(null);
    const timerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const getTargetOwnerId = useCallback(() => {
        return propOwnerId || user?.memberOf?.id || (user?.role === 'OWNER' ? user.ownerId : "e0449386-8bfb-4b3f-be75-6d67bd81a825");
    }, [propOwnerId, user]);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const ownerId = getTargetOwnerId();
                if (ownerId) {
                    const data = await getProductsByOwner(ownerId);
                    setCatalogProducts(data || []);
                }
            } catch (err) {
                console.error('Failed to fetch catalog:', err);
            }
        };
        fetchCatalog();
    }, [getTargetOwnerId]);

    const handleRating = async (idx, score) => {
        if (!isAuthenticated) {
            navigate(`/login?store=${storeSlug}`);
            return;
        }
        const targetOwnerId = getTargetOwnerId();
        setMessages(prev => prev.map((m, i) => i === idx ? { ...m, selectedRating: score } : m));
        try {
            await addRating({ ownerId: targetOwnerId, score, feedback: 'User rated via quick buttons' });
        } catch { console.error('Rating failed'); }
    };

    const handleSetReminder = async (productName) => {
        if (!isAuthenticated) {
            navigate(`/login?store=${storeSlug}`);
            return;
        }
        try {
            const remindDate = new Date(Date.now() + 86400000).toISOString();
            await addReminder({ product: productName, remindDate });
            setMessages(prev => [...prev, { role: 'ai', content: `Siap! Saya akan ingatkan kamu tentang ${productName} besok. ✅` }]);
        } catch { console.error('Reminder failed'); }
    };

    const handleAddToList = async (productId) => {
        if (!isAuthenticated) {
            navigate(`/login?store=${storeSlug}`);
            return;
        }
        try {
            await addToShoppingList(productId);
            showToast(t('added_to_list'), 'success');
        } catch { console.error('Failed to add to list'); }
    };

    // Timer logic for call duration
    useEffect(() => {
        if (callStatus === 'ACCEPTED') {
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            if (!isLiveSupport) setCallDuration(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [callStatus, isLiveSupport]);

    // Helper to format duration (MM:SS)
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Polling for call status
    useEffect(() => {
        if (isLiveSupport && callStatus === 'PENDING') {
            callPollingRef.current = setInterval(async () => {
                try {
                    const data = await getChatPolling(new Date(Date.now() - 30 * 1000).toISOString());
                    if (data.status === 'success' && data.history.length > 0) {
                        const lastCallMsg = [...data.history].reverse().find(m => m.status && m.status.startsWith('CALL_'));
                        if (lastCallMsg) {
                            if (lastCallMsg.status === 'CALL_ACCEPTED') {
                                setCallStatus('ACCEPTED');
                                await navigator.mediaDevices.getUserMedia({ audio: true });
                            } else if (lastCallMsg.status === 'CALL_DECLINED') {
                                setCallStatus('DECLINED');
                                setTimeout(() => {
                                    setIsLiveSupport(false);
                                    setCallStatus(null);
                                }, 3000);
                            }
                        }
                    }
                } catch (err) {
                    console.error('Call status polling error:', err);
                }
            }, 2000);
        } else {
            if (callPollingRef.current) clearInterval(callPollingRef.current);
        }
        return () => { if (callPollingRef.current) clearInterval(callPollingRef.current); };
    }, [isLiveSupport, callStatus]);

    // Polling logic for live support
    useEffect(() => {
        if (isLiveSupport) {
            pollingRef.current = setInterval(async () => {
                try {
                    const lastMessageTime = messages.length > 0 ? messages[messages.length - 1].timestamp : new Date(Date.now() - 30 * 1000).toISOString();
                    const data = await getChatPolling(lastMessageTime);
                    if (data.status === 'success' && data.history.length > 0) {
                        const newMessages = data.history.filter(m => {
                            return m.role === 'staff' || (m.role === 'user' && !messages.find(existing => existing.content === m.message));
                        });

                        if (newMessages.length > 0) {
                            setMessages(prev => [
                                ...prev,
                                ...newMessages.map(m => ({
                                    role: m.role,
                                    content: m.message,
                                    timestamp: m.timestamp
                                }))
                            ]);
                        }
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 3000);
        } else {
            if (pollingRef.current) clearInterval(pollingRef.current);
        }
        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, [isLiveSupport, messages, setMessages]);

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
            await sendMessageCtx(prompt, true);
        } catch (err) {
            console.error('Failed to send language prompt:', err);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        if (!isAuthenticated) {
            navigate(`/login?store=${storeSlug}`);
            return;
        }
        const msg = input.trim();
        setInput('');

        // 1. Optimistic Update: Show user message immediately
        setMessages(prev => [...prev, {
            role: 'user',
            content: msg,
            timestamp: new Date().toISOString()
        }]);

        setIsLoading(true);

        // Try to get geolocation
        const getCoords = () => {
            return new Promise((resolve) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                        () => resolve({ lat: null, lng: null }),
                        { timeout: 3000 }
                    );
                } else {
                    resolve({ lat: null, lng: null });
                }
            });
        };

        try {
            const coords = await getCoords();
            // Use isBackground = true to prevent ChatContext from adding the message again
            const data = await sendMessageCtx(msg, true, coords.lat, coords.lng);
            if (!isLiveSupport && data) {
                setMessages(prev => [...prev, {
                    role: 'ai',
                    content: data.message,
                    status: data.status,
                    products: data.products,
                    nearbyStores: data.nearbyStores,
                    userLocation: data.userLocation,
                    ratingPrompt: data.ratingPrompt,
                    timestamp: new Date().toISOString()
                }]);
                if (isDisabilityMode) {
                    speak(data.message.replace(/\[\w+\]/g, '')); // Strip tags for speech
                }
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, { role: 'ai', content: 'Koneksi lagi bermasalah nih bre. Coba lagi ya! 🙏' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCallStaff = async () => {
        if (!isAuthenticated) {
            navigate(`/login?store=${storeSlug}`);
            return;
        }
        const targetOwnerId = getTargetOwnerId();
        setIsLoading(true);
        const performCall = async (lat = null, lng = null) => {
            try {
                const res = await callStaff(targetOwnerId, lat, lng);
                if (res.status === 'success') {
                    setIsLiveSupport(true);
                    setCallStatus('PENDING');
                    setMessages(prev => [...prev, {
                        role: 'ai',
                        content: t('staff_connecting')
                    }]);
                }
            } catch {
                showToast(t('failed_call'), 'error');
            } finally {
                setIsLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => performCall(position.coords.latitude, position.coords.longitude),
                () => performCall(),
                { timeout: 5000, maximumAge: 60000, enableHighAccuracy: false }
            );
        } else {
            performCall();
        }
    };

    const handleStopStaff = async () => {
        const targetOwnerId = getTargetOwnerId();
        setIsLoading(true);
        try {
            const formattedTime = formatDuration(callDuration);
            const res = await stopStaffSupport(targetOwnerId, formattedTime);
            if (res.status === 'success') {
                setIsLiveSupport(false);
                setMessages(prev => [...prev, {
                    role: 'ai',
                    content: t('staff_ended')
                }]);
            }
        } catch {
            showToast(t('failed_end_call'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full relative bg-white text-zinc-800 overflow-hidden">
            {/* Live Support Overlay */}
            {isLiveSupport && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
                    <div className={`bg-white rounded-[3.5rem] shadow-2xl p-10 text-center border-2 w-[340px] relative overflow-hidden transition-all duration-500 ${callStatus === 'DECLINED' ? 'border-rose-200' :
                        callStatus === 'ACCEPTED' ? 'border-emerald-200' : 'border-white'
                        }`}>
                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${callStatus === 'ACCEPTED' ? 'bg-emerald-500 animate-pulse' :
                            callStatus === 'DECLINED' ? 'bg-rose-500' : 'bg-indigo-500 animate-pulse'
                            }`} />

                        <div className={`w-28 h-28 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-xl transition-colors duration-500 ${callStatus === 'DECLINED' ? 'bg-rose-50 text-rose-600' :
                            callStatus === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-indigo-600'
                            }`}>
                            {callStatus === 'DECLINED' ? <X className="w-12 h-12" /> : <Headset className="w-12 h-12" />}
                        </div>

                        <div className="space-y-1 mb-10">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {callStatus === 'ACCEPTED' ? t('voice_connected') :
                                    callStatus === 'DECLINED' ? t('call_declined') : t('calling_staff')}
                            </h2>
                            <p className="text-indigo-600 font-bold text-xl tabular-nums tracking-widest">
                                {formatDuration(callDuration)}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            {(callStatus === 'PENDING' || callStatus === 'ACCEPTED') && (
                                <button
                                    onClick={handleStopStaff}
                                    className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <X className="w-5 h-5 bg-white text-rose-500 rounded-full p-0.5" />
                                    {t('end_call')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col h-full bg-white relative transition-all ${isLiveSupport ? 'blur-sm pointer-events-none' : ''}`}>
                <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-zinc-900 tracking-tight">Heart<span className="text-indigo-600">.</span></span>
                    </div>
                    {user?.role === 'USER' && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleLanguage}
                                title={i18n.language === 'id' ? 'Ganti ke English' : 'Switch to Indonesia'}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-100 group"
                            >
                                <Languages className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            </button>
                            <button
                                onClick={handleCallStaff}
                                className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 text-white rounded-full text-xs font-bold transition-all shadow-md active:scale-95"
                            >
                                <Headset className="w-4 h-4" />
                                {t('call_staff')}
                            </button>
                        </div>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
                    <div className="max-w-3xl mx-auto px-4 py-8 space-y-12">
                        {messages.length === 0 && !isChatLoading && (
                            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                                <Motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8"
                                >
                                    <Bot className="w-10 h-10 text-indigo-600" />
                                </Motion.div>
                                <h2 className="text-4xl font-black mb-3 text-slate-900 tracking-tight">{t('welcome')}</h2>
                                <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                                    {t('assistant_desc')}
                                </p>
                            </div>
                        )}

                        {messages.map((m, idx) => (
                            <Motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={idx}
                                className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border ${m.role === 'user' ? 'bg-slate-50 border-slate-200' : 'bg-black border-black shadow-lg shadow-black/5'}`}>
                                        {m.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4 text-white" />}
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className={`p-5 rounded-[2rem] shadow-sm border ${m.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white border-zinc-100 text-zinc-900'}`}>
                                            <div className="text-sm leading-relaxed font-medium markdown-content">
                                                <ReactMarkdown>
                                                    {m.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>

                                        {m.products && m.products.length > 0 && (
                                            <div className="grid grid-cols-1 gap-4 mt-4 w-full max-w-sm">
                                                {m.products.map((p, pIdx) => (
                                                    <Motion.div
                                                        key={pIdx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: pIdx * 0.1 }}
                                                        className="card overflow-hidden group/card border-slate-100 bg-white/50 backdrop-blur-sm hover:border-indigo-200 transition-all duration-300 p-5 px-6"
                                                    >
                                                        <header className="flex justify-between items-start mb-0 pb-4">
                                                            <div>
                                                                <h4 className="text-lg font-black text-slate-900 leading-tight">{p.name}</h4>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                                    {p.category || 'Product'}
                                                                </p>
                                                            </div>
                                                            {p.halal && (
                                                                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full border border-green-100">
                                                                    <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
                                                                    <span className="text-[8px] font-black text-green-600">HALAL</span>
                                                                </div>
                                                            )}
                                                        </header>

                                                        <section className="px-0 relative aspect-video bg-slate-50 overflow-hidden rounded-xl">
                                                            {p.image ? (
                                                                <img
                                                                    src={`http://localhost:4000${p.image}`}
                                                                    alt={p.name}
                                                                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                                                                    <Package className="w-10 h-10 mb-1 opacity-20" />
                                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">No Image</span>
                                                                </div>
                                                            )}
                                                        </section>

                                                        <footer className="flex items-center gap-2 pt-5">
                                                            <div className="flex flex-wrap gap-1.5 grayscale opacity-50 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all">
                                                                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 border border-slate-100 px-2 py-1 rounded-lg bg-slate-50/50">
                                                                    <Grid className="w-3 h-3 text-indigo-400" /> {t('rak')} {p.rak}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 border border-slate-100 px-2 py-1 rounded-lg bg-slate-50/50">
                                                                    <MapPin className="w-3 h-3 text-emerald-400" /> {t('aisle')} {p.aisle}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 border border-slate-100 px-2 py-1 rounded-lg bg-slate-50/50">
                                                                    <Tag className="w-3 h-3 text-rose-400" /> {t('stock')} {p.stock}
                                                                </span>
                                                            </div>
                                                            <span className="ml-auto font-black text-slate-900 tracking-tight text-base whitespace-nowrap">
                                                                Rp {p.price?.toLocaleString('id-ID')}
                                                            </span>
                                                        </footer>

                                                        <div className="flex gap-4 mt-4 pt-4 border-t border-slate-50">
                                                            <button
                                                                onClick={() => handleSetReminder(p.name)}
                                                                className="flex-1 py-3 bg-slate-100/50 hover:bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <AlarmClock className="w-3.5 h-3.5" />
                                                                Remind
                                                            </button>
                                                            <button
                                                                onClick={() => handleAddToList(p.id)}
                                                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                            >
                                                                <ShoppingCart className="w-3.5 h-3.5" />
                                                                Add to List
                                                            </button>
                                                        </div>
                                                    </Motion.div>
                                                ))}
                                            </div>
                                        )}

                                        {m.nearbyStores && m.nearbyStores.length > 0 && (
                                            <StoreMap
                                                stores={m.nearbyStores}
                                                userLocation={m.userLocation}
                                            />
                                        )}

                                        {m.ratingPrompt && user?.role === 'USER' && (
                                            <div className="mt-2 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('rate_service')}</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => handleRating(idx, s)}
                                                            className={`transition-colors ${(m.selectedRating || 0) >= s ? 'text-amber-400' : 'text-slate-200 hover:text-amber-500'}`}
                                                        >
                                                            <Star className={`w-3 h-3 ${(m.selectedRating || 0) >= s ? 'fill-current' : ''}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Motion.div>
                        ))}

                        {(isLoading || isChatLoading) && (
                            <Motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start gap-4"
                            >
                                <div className="shrink-0 w-8 h-8 rounded-xl bg-black flex items-center justify-center border border-black shadow-lg shadow-black/5">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-[2rem] border border-slate-100 shadow-sm w-fit">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {t('ai_typing')}
                                    </span>
                                </div>
                            </Motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-20" />
                    </div>
                </main>

                <footer className="w-full shrink-0 p-4 pt-0">
                    <div className="max-w-3xl mx-auto">
                        {/* Product Catalog Shelf */}
                        {catalogProducts.length > 0 && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2 px-2">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('product_gallery')}</h3>
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                                        <div className="w-1 h-1 rounded-full bg-indigo-200"></div>
                                    </div>
                                </div>
                                <div className="flex overflow-x-auto pb-4 pt-1 gap-4 snap-x no-scrollbar">
                                    {catalogProducts.map((p, pIdx) => (
                                        <Motion.div
                                            key={p.id || pIdx}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="min-w-[240px] max-w-[240px] snap-start card overflow-hidden group/card border-slate-100 bg-white shadow-sm hover:border-indigo-200 transition-all duration-300 p-5"
                                        >
                                            <header className="flex justify-between items-start mb-3">
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-black text-slate-900 leading-tight truncate">{p.name}</h4>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                        {p.category || 'Product'}
                                                    </p>
                                                </div>
                                                {p.halal && (
                                                    <div className="p-0.5 bg-green-50 rounded-full shrink-0">
                                                        <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
                                                    </div>
                                                )}
                                            </header>

                                            <section className="relative aspect-video bg-slate-50/50 overflow-hidden rounded-xl border border-slate-50 mb-4">
                                                {p.image ? (
                                                    <img
                                                        src={`http://localhost:4000${p.image}`}
                                                        alt={p.name}
                                                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                                                        <Package className="w-8 h-8 mb-1 opacity-20" />
                                                    </div>
                                                )}
                                            </section>

                                            <div className="flex items-center justify-between mb-4 px-1">
                                                <span className="text-[11px] font-black text-slate-900 tracking-tight">Rp {p.price?.toLocaleString('id-ID')}</span>
                                                <div className="flex gap-1 grayscale opacity-50 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all">
                                                    <span className="flex items-center gap-0.5 text-[8px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100" title="Rak">
                                                        <Grid className="w-2.5 h-2.5 text-indigo-400" /> {p.rak}
                                                    </span>
                                                    <span className="flex items-center gap-0.5 text-[8px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100" title="Lorong">
                                                        <MapPin className="w-2.5 h-2.5 text-emerald-400" /> {p.aisle}
                                                    </span>
                                                    <span className="flex items-center gap-0.5 text-[8px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100" title="Stok">
                                                        <Tag className="w-2.5 h-2.5 text-rose-400" /> {p.stock}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleSetReminder(p.name)}
                                                    className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all flex items-center justify-center border border-slate-100"
                                                    title="Set Reminder"
                                                >
                                                    <AlarmClock className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAddToList(p.id)}
                                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <ShoppingCart className="w-3.5 h-3.5" />
                                                    Add
                                                </button>
                                            </div>
                                        </Motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="relative bg-[#f8f8f8] rounded-[2rem] border border-zinc-200/60 shadow-sm focus-within:border-indigo-400 focus-within:bg-white transition-all group p-2">
                            <textarea
                                rows="1"
                                className="w-full bg-transparent border-none focus:ring-0 text-zinc-800 py-3 px-4 resize-none max-h-52 custom-scrollbar outline-none font-medium placeholder:text-zinc-400"
                                placeholder={t('placeholder')}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />
                            <div className="flex items-center justify-end px-2 pb-1">
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading || isChatLoading}
                                    className={`p-2 rounded-xl transition-all ${!input.trim() || isLoading || isChatLoading ? 'bg-zinc-100 text-zinc-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'}`}
                                >
                                    <ArrowUp className="w-4 h-4 font-black" />
                                </button>
                            </div>
                        </div>
                    </div>
                </footer>
            </div >
        </div >
    );
};

export default ChatView;
