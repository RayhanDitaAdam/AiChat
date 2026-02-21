import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserAvatar from './UserAvatar.jsx';
import {
    Bot, User, Star, BadgeCheck,
    ArrowUp, Headset, X, Package, Layers, Tag, Info,
    Languages,
    Printer, Globe, Plus,
    MessageSquare, Settings, Share2, MoreHorizontal,
    Copy, ThumbsUp, ThumbsDown, RotateCcw, PenSquare,
    History
} from 'lucide-react';
import {
    addRating,
    getChatPolling,
    stopStaffSupport, analyzeFood
} from '../services/api.js';
import api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../context/ChatContext.js';
import { useDisability } from '../context/DisabilityContext.js';
import { useToast } from '../context/ToastContext.js';
import { useTranslation } from 'react-i18next';
import { PATHS } from '../routes/paths.js';
import StoreMap from './StoreMap.jsx';
import ChatHistoryDrawer from './ChatHistoryDrawer.jsx';

const ChatView = ({ ownerId: propOwnerId, storeSlug, excludeStaffChats = false }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const {
        messages, setMessages, sendMessage: sendMessageCtx, isLoading: isChatLoading, fetchSessions, currentSessionId, startNewChat
    } = useChat();
    const { isDisabilityMode, speak } = useDisability();
    const { showToast } = useToast();
    const { t, i18n } = useTranslation();

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    useEffect(() => {
        if (isAuthenticated) {
            fetchSessions(excludeStaffChats);
        }
    }, [isAuthenticated, excludeStaffChats, fetchSessions]);

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLiveSupport, setIsLiveSupport] = useState(false);
    const [callStatus, setCallStatus] = useState(null);
    const [callDuration, setCallDuration] = useState(0);

    const [attachment, setAttachment] = useState(null); // File object

    // Rating Modal State
    const [ratingModal, setRatingModal] = useState(null); // { idx, score }
    const [ratingFeedback, setRatingFeedback] = useState('');
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [shoppingListItems, setShoppingListItems] = useState([]);

    const messagesEndRef = useRef(null);
    const pollingRef = useRef(null);
    const callPollingRef = useRef(null);
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);
    const coordsRef = useRef({ lat: null, lng: null });

    // Background location update
    useEffect(() => {
        if (navigator.geolocation && isAuthenticated) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    coordsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                },
                null,
                { timeout: 10000 }
            );
        }
    }, [isAuthenticated]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Handle Auto-Add Notification
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'ai' && lastMsg.isFresh) {
                if (lastMsg.autoAdded) {
                    showToast(t('added_to_list'), 'success');
                }
                if (lastMsg.reminderAdded) {
                    showToast(t('reminder_set') || 'Pengingat berhasil dipasang! ⏰', 'success');
                }
            }
        }
    }, [messages, t, showToast]);

    const getTargetOwnerId = useCallback(() => {
        return propOwnerId || user?.memberOf?.id || (user?.role === 'OWNER' ? user.ownerId : "e0449386-8bfb-4b3f-be75-6d67bd81a825");
    }, [propOwnerId, user]);



    const handleRating = async (idx, score) => {
        // Now allowed for guests too!

        // If score is 1 or 2, prompt for feedback
        if (score <= 2) {
            setRatingModal({ idx, score });
            setRatingFeedback('');
            return;
        }

        // Otherwise submit immediately
        await submitRating(idx, score);
    };

    const submitRating = async (idx, score, feedback = '') => {
        const targetOwnerId = getTargetOwnerId();
        setMessages(prev => prev.map((m, i) => i === idx ? { ...m, selectedRating: score } : m));
        try {
            const guestId = !isAuthenticated ? localStorage.getItem('chat_guest_id') : undefined;
            const sessionId = !isAuthenticated ? currentSessionId : undefined;

            await addRating({
                ownerId: targetOwnerId,
                score,
                feedback: feedback || 'User rated via quick buttons',
                guestId,
                sessionId
            });
            showToast(t('rating_submitted') || 'Rating submitted', 'success');
        } catch {
            console.error('Rating failed');
            showToast('Failed to submit rating', 'error');
        }
    };

    const handleSubmitLowRating = async () => {
        if (!ratingModal) return;
        await submitRating(ratingModal.idx, ratingModal.score, ratingFeedback);
        setRatingModal(null);
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

    // Live Staff Chat Mode Detection
    // Live Staff Chat Mode Detection
    // Live Staff Chat Mode Detection - REMOVED
    // Handle Yes/No for Live Staff - REMOVED

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

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleRemoveAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async () => {
        if ((!input.trim() && !attachment) || isLoading) return;

        // Block if limit reached for guests
        const lastMsg = messages[messages.length - 1];
        if (!isAuthenticated && lastMsg?.limitReached) {
            navigate(`/register?store=${storeSlug}`);
            return;
        }

        const msg = input.trim();
        const currentAttachment = attachment; // Capture current attachment

        setInput('');
        setAttachment(null); // Clear immediately for UI

        // Intercept /print command
        if (msg.toLowerCase().startsWith('/print')) {
            handleOpenPrintModal();
            return;
        }

        // 1. Optimistic Update: Show user message immediately
        const optimisticMsg = {
            role: 'user',
            content: msg,
            timestamp: new Date().toISOString(),
            // Store attachment URL for local preview if needed, though we cleared state
            attachmentUrl: currentAttachment ? URL.createObjectURL(currentAttachment) : null
        };
        setMessages(prev => [...prev, optimisticMsg]);

        const currentCoords = coordsRef.current;

        try {
            setIsLoading(true);
            // SPECIAL HANDLING FOR HEALTH / IMAGE ANALYSIS
            if (currentAttachment) {
                if (!user.memberOf?.id) {
                    throw new Error("You must be a member of a store to use Health AI.");
                }

                const formData = new FormData();
                formData.append('memberId', user.memberOf.id);
                formData.append('text', msg || "Analyze this image");
                formData.append('file', currentAttachment);

                const res = await analyzeFood(formData);

                if (res.status === 'success') {
                    setMessages(prev => [...prev, {
                        role: 'ai',
                        content: res.data.aiResponse,
                        timestamp: new Date().toISOString()
                    }]);
                    if (isDisabilityMode) {
                        speak(res.data.aiResponse);
                    }
                }
                return; // Exit function after handling attachment
            }

            // NORMAL CHAT FLOW
            const data = await sendMessageCtx(msg, true, currentCoords.lat, currentCoords.lng, propOwnerId);

            if (!isLiveSupport && data && isDisabilityMode) {
                speak(data.message.replace(/\[\w+\]/g, '')); // Strip tags for speech
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, { role: 'ai', content: err.message || 'Koneksi lagi bermasalah nih bre. Coba lagi ya! 🙏' }]);
        } finally {
            setIsLoading(false);
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

    const handleOpenPrintModal = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/user/shopping-list');
            if (res.data.status === 'success') {
                setShoppingListItems(res.data.list || []);
                setIsPrintModalOpen(true);
            }
        } catch (err) {
            console.error('Failed to fetch shopping list:', err);
            showToast('Gagal memuat daftar belanja bre.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrintIP = async () => {
        setIsPrinting(true);
        try {
            const targetOwnerId = getTargetOwnerId();
            const res = await api.post('/user/shopping-list/print', { ownerId: targetOwnerId });
            if (res.data.status === 'success') {
                showToast('Printing to store printer... 🖨️', 'success');
                setIsPrintModalOpen(false);
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Print failed', 'error');
        } finally {
            setIsPrinting(false);
        }
    };

    const handleBrowserPrint = () => {
        window.print();
        setIsPrintModalOpen(false);
    };


    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast(t('copied_to_clipboard') || 'Copied!', 'success');
    };

    return (
        <div className="flex flex-col h-full relative bg-white text-zinc-800 overflow-hidden">
            <ChatHistoryDrawer
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />
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

            {/* Rating Feedback Modal */}
            {ratingModal && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4"
                    >
                        <div className="text-center">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">
                                {t('feedback_title') || 'Tell us why?'}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium">
                                {t('feedback_desc') || 'We want to improve. What went wrong?'}
                            </p>
                        </div>

                        <textarea
                            className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-100 resize-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
                            placeholder={t('feedback_placeholder') || 'Your feedback...'}
                            value={ratingFeedback}
                            onChange={(e) => setRatingFeedback(e.target.value)}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setRatingModal(null)}
                                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm tracking-wide hover:bg-slate-200 transition-colors"
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                            <button
                                onClick={handleSubmitLowRating}
                                disabled={!ratingFeedback.trim()}
                                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                            >
                                {t('submit') || 'Submit'}
                            </button>
                        </div>
                    </Motion.div>
                </div>
            )}

            {/* Print Modal */}
            <AnimatePresence>
                {isPrintModalOpen && (
                    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-lg border border-slate-100 relative overflow-hidden"
                        >
                            <button
                                onClick={() => setIsPrintModalOpen(false)}
                                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-50 rounded-xl">
                                        <Printer className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    Print Shopping List
                                </h3>
                                <p className="text-slate-500 font-medium mt-1">Ready to hit the store? Print your list now.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handlePrintIP}
                                    disabled={isPrinting}
                                    className="p-8 rounded-[2rem] bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex flex-col items-center justify-center gap-4 group"
                                >
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Printer className="w-7 h-7" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-black text-sm">Store Printer</p>
                                        <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest mt-0.5">IP Printing</p>
                                    </div>
                                </button>

                                <button
                                    onClick={handleBrowserPrint}
                                    disabled={isPrinting}
                                    className="p-8 rounded-[2rem] bg-white border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center gap-4 group"
                                >
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Globe className="w-7 h-7 text-indigo-600" />
                                    </div>
                                    <div className="text-center text-slate-900">
                                        <p className="font-black text-sm">Browser Print</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">PDF / Local</p>
                                    </div>
                                </button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Info className="w-4 h-4 text-amber-500" />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                    IP Printing requires you to be near the checkout area for auto-pickup.
                                </p>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col h-full bg-white relative overflow-hidden transition-all ${isLiveSupport ? 'blur-sm pointer-events-none' : ''}`}>

                {/* Header */}
                {isAuthenticated && (
                    <header className="h-16 flex items-center justify-between px-6 shrink-0 bg-white z-10 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900">AI Heart</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => startNewChat()}
                                className="h-9 px-4 flex items-center gap-2 rounded-xl bg-zinc-900 text-white hover:bg-indigo-600 transition-all shadow-lg shadow-zinc-200 hover:shadow-indigo-100 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">{t('new_chat')}</span>
                            </button>
                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className="p-2.5 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-xl transition-colors relative"
                            >
                                <History className="w-5 h-5" />
                                {messages.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />}
                            </button>
                            {user?.role === 'USER' && (
                                <button
                                    onClick={() => navigate(PATHS.CHAT_WITH_STAFF)}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                    title="Chat with Staff"
                                >
                                    <Headset className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={toggleLanguage}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-colors"
                            >
                                <Languages className="w-4 h-4" />
                            </button>
                        </div>
                    </header>
                )}

                <main className="flex-1 overflow-y-auto w-full custom-scrollbar pb-6 px-4">
                    <div className="max-w-3xl mx-auto py-6 space-y-8">
                        {messages.length === 0 && !isChatLoading && (
                            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                                <Motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-20 h-20 bg-white border border-zinc-100 shadow-xl rounded-full flex items-center justify-center mb-8"
                                >
                                    <Bot className="w-10 h-10 text-indigo-600" />
                                </Motion.div>
                                <h2 className="text-3xl font-black mb-3 text-zinc-900 tracking-tight">{t('welcome')}</h2>
                                <p className="text-zinc-500 font-medium max-w-md mx-auto leading-relaxed">
                                    {t('assistant_desc')}
                                </p>
                            </div>
                        )}

                        {messages.map((m, idx) => (
                            <Motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={idx}
                                className={`flex w-full gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {/* AI Avatar (Left) */}
                                {m.role !== 'user' && (
                                    <div className="shrink-0 w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center bg-white shadow-sm mt-1">
                                        <Bot className="w-4 h-4 text-indigo-600" />
                                    </div>
                                )}

                                <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {/* Name + Timestamp Label */}
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 px-1 flex items-center gap-2">
                                        {m.role === 'user' ? 'You' : 'AI Assistant'}
                                        {m.timestamp && (
                                            <span className="normal-case font-medium tracking-normal text-zinc-300">
                                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </span>

                                    {/* Message Bubble */}
                                    <div className={`p-4 rounded-2xl shadow-sm border text-sm leading-relaxed font-medium markdown-content relative group ${m.role === 'user'
                                        ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-sm'
                                        : 'bg-white border-zinc-100 text-zinc-800 rounded-tl-sm'
                                        }`}>
                                        <ReactMarkdown>{m.content}</ReactMarkdown>

                                        {/* Action Buttons for AI */}
                                        {m.role !== 'user' && (
                                            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-zinc-50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => copyToClipboard(m.content)} className="p-1.5 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors" title="Copy">
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="p-1.5 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors" title="Good response">
                                                    <ThumbsUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="p-1.5 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors" title="Bad response">
                                                    <ThumbsDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Metadata / Location Map */}
                                    {m.nearbyStores && m.nearbyStores.length > 0 && (
                                        <div className="mt-3 w-full">
                                            <StoreMap stores={m.nearbyStores} userLocation={m.userLocation} />
                                        </div>
                                    )}

                                    {/* Rating Prompt */}
                                    {m.ratingPrompt && (
                                        <div className="mt-2 flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-100">
                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-2">
                                                {m.limitReached ? "Limit Reached" : "Rate"}
                                            </span>
                                            {isAuthenticated && (
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <button key={s} onClick={() => handleRating(idx, s)} className={`p-1 transition-colors ${(m.selectedRating || 0) >= s ? 'text-amber-500' : 'text-amber-200 hover:text-amber-400'}`}>
                                                            <Star className={`w-3 h-3 ${(m.selectedRating || 0) >= s ? 'fill-current' : ''}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* User Avatar (Right) */}
                                {m.role === 'user' && (
                                    <div className="shrink-0 w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center bg-zinc-50 mt-1 overflow-hidden">
                                        <UserAvatar user={user} size={32} square={false} />
                                    </div>
                                )}
                            </Motion.div>
                        ))}

                        {(isLoading || isChatLoading) && (
                            <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex w-full gap-4 justify-start">
                                <div className="shrink-0 w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center bg-white shadow-sm mt-1">
                                    <Bot className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-zinc-100 shadow-sm flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </Motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </main>

                <footer className="w-full px-4 py-6 bg-white shrink-0 relative z-20">
                    <div className="max-w-3xl mx-auto">
                        <div className="relative bg-zinc-50 rounded-[2rem] border border-zinc-200 focus-within:bg-white focus-within:border-zinc-300 focus-within:shadow-lg focus-within:shadow-indigo-500/10 transition-all flex items-end p-2 pl-4">

                            {/* Attachment Preview (Floating above) */}
                            {attachment && (
                                <div className="absolute bottom-full mb-3 left-0 bg-white p-2 rounded-2xl shadow-xl border border-zinc-100 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden">
                                        <img src={URL.createObjectURL(attachment)} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="pr-2">
                                        <p className="text-xs font-bold text-zinc-900 truncate max-w-[120px]">{attachment.name}</p>
                                        <button onClick={handleRemoveAttachment} className="text-[10px] text-rose-500 font-bold hover:underline mt-0.5">Remove</button>
                                    </div>
                                </div>
                            )}

                            {/* Left Actions */}
                            <div className="pb-2 flex gap-1.5">
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`p-2 rounded-full transition-colors ${attachment ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-200/50 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'}`}
                                >
                                    <Plus className={`w-5 h-5 ${attachment ? 'rotate-45' : ''} transition-transform`} />
                                </button>
                            </div>

                            <textarea
                                rows="1"
                                className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-800 py-3 px-3 resize-none max-h-40 custom-scrollbar outline-none font-medium placeholder:text-zinc-400 min-h-[48px]"
                                placeholder={attachment ? "Ask about this image..." : "Message AI..."}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                disabled={isLoading}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                            />

                            {/* Right Actions (Send) */}
                            <div className="pb-1">
                                <button
                                    onClick={handleSend}
                                    disabled={(!input.trim() && !attachment) || isLoading || isChatLoading}
                                    className={`p-2.5 rounded-full transition-all active:scale-95 ${(!input.trim() && !attachment) || isLoading
                                        ? 'bg-zinc-100 text-zinc-300'
                                        : 'bg-zinc-900 text-white hover:bg-indigo-600 shadow-md shadow-indigo-200'
                                        }`}
                                >
                                    <ArrowUp className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-zinc-400 font-medium mt-3">
                            AI can make mistakes. Check important info.
                        </p>
                    </div>
                </footer>
            </div >

            {/* Hidden Printable Area */}
            <div className="hidden print:block p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black tracking-tight">{storeSlug?.toUpperCase() || 'MY STORE'} SHOPPING LIST</h1>
                    <p className="text-sm text-slate-500">Generated on: {new Date().toLocaleString()}</p>
                </div>
                <div className="space-y-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900">
                                <th className="py-2 font-black">Item</th>
                                <th className="py-2 font-black">Loc</th>
                                <th className="py-2 text-right font-black">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shoppingListItems.map((item, i) => (
                                <tr key={i} className="border-b border-slate-100">
                                    <td className="py-4">
                                        <p className="font-bold text-slate-900">{item.product.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.product.category}</p>
                                    </td>
                                    <td className="py-4">
                                        <p className="text-xs font-bold">L{item.product.aisle} R{item.product.rak}</p>
                                    </td>
                                    <td className="py-4 text-right font-black">
                                        Rp {item.product.price?.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-900">
                                <td colSpan="2" className="py-4 font-black">TOTAL ESTIMASI</td>
                                <td className="py-4 text-right font-black text-lg">
                                    Rp {shoppingListItems.reduce((acc, item) => acc + item.product.price, 0).toLocaleString('id-ID')}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="mt-12 text-center border-t border-slate-100 pt-8 opacity-50">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em]">Thank you for shopping with Heart Assistant</p>
                </div>
            </div>
        </div >
    );
};

export default ChatView;
