import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserAvatar from './UserAvatar.jsx';
import {
    Bot, User, Star, BadgeCheck,
    ArrowUp, Headset, X, Package, Layers, Tag, Info,
    Languages,
    Printer, Globe, Plus, ShieldCheck, ArrowUpRight, FileText,
    MessageSquare, Settings, Share2, MoreHorizontal,
    Copy, ThumbsUp, ThumbsDown, RotateCcw, PenSquare,
    History,
    Paperclip, StopCircle, RefreshCw, HandHeart, Sparkles, ChevronDown, Check, LayoutPanelLeft, MoreVertical, Search, Zap, Loader2
} from 'lucide-react';
import {
    addRating,
    getChatPolling,
    stopStaffSupport, analyzeFood,
    getSystemConfig
} from '../services/api.js';
import api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useChat } from '../context/ChatContext.js';
import { useDisability } from '../context/DisabilityContext.js';
import { useToast } from '../context/ToastContext.js';
import { useTranslation } from 'react-i18next';
import { useSystemContext } from '../context/SystemContext.jsx';
import { cleanMessage } from '../utils/chatHelpers.js';
import { PATHS } from '../routes/paths.js';
import StoreMap from './StoreMap.jsx';
import ChatHistoryDrawer from './ChatHistoryDrawer.jsx';

const ChatView = ({ ownerId: propOwnerId, storeSlug, excludeStaffChats = false, hideSidebarTools = false }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const {
        messages, setMessages, sendMessage: sendMessageCtx, isLoading: isChatLoading, fetchSessions, currentSessionId, startNewChat,
        chatMode, setChatMode,
        isOutOfTopic, setIsOutOfTopic
    } = useChat();
    const { isDisabilityMode, speak } = useDisability();
    const { showToast } = useToast();
    const { t, i18n } = useTranslation();
    const { companyName } = useSystemContext();
    const shortName = companyName?.replace(/ai$/i, '').toUpperCase() || 'HEART';

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
    const [activeModel, setActiveModel] = useState('gemini-3-flash-preview');

    useEffect(() => {
        getSystemConfig().then(res => {
            if (res?.status === 'success') setActiveModel(res.data?.aiModel || 'gemini-1.5-flash');
        }).catch(() => { });
    }, []);

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

    // Read from localStorage to know if user dismissed the banner previously
    const [showReviewBanner, setShowReviewBanner] = useState(() => {
        return localStorage.getItem('hideAiReviewBanner') !== 'true';
    });

    const handleDismissBanner = () => {
        setShowReviewBanner(false);
        localStorage.setItem('hideAiReviewBanner', 'true');
    };

    // Session Rating State
    const [sessionRatingModal, setSessionRatingModal] = useState(false);
    const [sessionRatingScore, setSessionRatingScore] = useState(4); // Default 4 stars
    const [sessionRatingFeedback, setSessionRatingFeedback] = useState('');
    const [hasShownSessionRating, setHasShownSessionRating] = useState(false);

    const messagesEndRef = useRef(null);
    const pollingRef = useRef(null);
    const callPollingRef = useRef(null);
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);
    const coordsRef = useRef({ lat: null, lng: null });

    // Background location update - REMOVED AS REQUESTED (Using hardcoded Southampton on backend)
    /*
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
    */

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

    // Handle Session Rating Trigger
    useEffect(() => {
        setHasShownSessionRating(false);
    }, [currentSessionId]);

    useEffect(() => {
        const aiMessagesCount = messages.filter(m => m.role === 'ai').length;
        if (aiMessagesCount >= 5 && !hasShownSessionRating && !isChatLoading) {
            setSessionRatingModal(true);
            setHasShownSessionRating(true);
        }
    }, [messages, hasShownSessionRating, isChatLoading]);

    const getTargetOwnerId = useCallback(() => {
        return propOwnerId || user?.memberOf?.id || (user?.role === 'OWNER' ? user.ownerId : "11343cf4-07cd-4d2c-b91b-7f04c8ee0e7c");
    }, [propOwnerId, user]);



    const handleRating = async (idx, score) => {
        // Now allowed for guests too!
        // Show feedback modal for all stars (optional reason)
        setRatingModal({ idx, score });
        setRatingFeedback('');
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

    const handleSessionRatingSubmit = async () => {
        setIsLoading(true);
        try {
            const targetOwnerId = getTargetOwnerId();
            const guestId = !isAuthenticated ? localStorage.getItem('chat_guest_id') : undefined;
            const sessionId = !isAuthenticated ? currentSessionId : undefined;

            await addRating({
                ownerId: targetOwnerId,
                score: sessionRatingScore,
                feedback: sessionRatingFeedback || 'User rated session via auto popup',
                guestId,
                sessionId
            });
            showToast(t('rating_submitted') || 'Terima kasih atas rating-nya bre! 🙏', 'success');
        } catch (err) {
            console.error('Session rating failed', err);
            showToast('Gagal mengirim rating.', 'error');
        } finally {
            setIsLoading(false);
            setSessionRatingModal(false);
        }
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
                    const newMessages = data.history.filter(m => {
                        // Deduplicate by ID
                        const isExisting = messages.some(existing => (existing.id && existing.id === m.id) || (existing.content === m.message && Math.abs(new Date(existing.timestamp) - new Date(m.timestamp)) < 5000));
                        return !isExisting;
                    });

                    if (newMessages.length > 0) {
                        setMessages(prev => [
                            ...prev,
                            ...newMessages.map(m => ({
                                id: m.id,
                                role: m.role,
                                content: m.message,
                                timestamp: m.timestamp
                            }))
                        ]);
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
            await sendMessageCtx(prompt, true, null, null, null, nextLng);
        } catch (err) {
            console.error('Failed to send language prompt:', err);
        }
    };

    const handleOutOfTopicExit = () => {
        setIsOutOfTopic(false);
        startNewChat();
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
        const currentAttachment = attachment;

        // PREVENT DOUBLE SUBMISSION
        setIsLoading(true);
        setInput('');
        setAttachment(null);

        // Intercept /print command
        if (msg.toLowerCase().startsWith('/print')) {
            handleOpenPrintModal();
            return;
        }

        const currentCoords = coordsRef.current;

        try {
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
                return;
            }

            // NORMAL CHAT FLOW: use isBackground: false to show placeholders
            const data = await sendMessageCtx(msg, false, currentCoords.lat, currentCoords.lng, propOwnerId);

            if (!isLiveSupport && data && isDisabilityMode) {
                speak(cleanMessage(data.message));
            }

            // AUTO-REDIRECT FOR SOP
            if (data?.status === 'SOP_NAVIGATE') {
                const targetPath = user?.role === 'OWNER' ? PATHS.OWNER_SOP : user?.role === 'STAFF' ? PATHS.STAFF_SOP : null;
                if (targetPath) {
                    showToast('Otomatis mengarahkan ke halaman SOP... 📄', 'success');
                    setTimeout(() => {
                        navigate(targetPath);
                    }, 2000);
                }
            }
        } catch (err) {
            console.error('Chat error:', err);
            // Don't add duplicate error message if ChatContext already handled it
            if (!err.processedByContext) {
                setMessages(prev => [...prev, { role: 'ai', content: err.message || 'Koneksi lagi bermasalah nih bre. Coba lagi ya! 🙏' }]);
            }
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


    const fallbackCopyTextToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Ensure textarea is not visible but part of DOM
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            showToast(t('copied_to_clipboard') || 'Copied!', 'success');
        } catch (err) {
            console.error('Fallback copy failed', err);
            showToast('Failed to copy', 'error');
        }

        document.body.removeChild(textArea);
    };

    const copyToClipboard = (text) => {
        const cleaned = cleanMessage(text);
        if (!navigator.clipboard) {
            fallbackCopyTextToClipboard(cleaned);
            return;
        }
        navigator.clipboard.writeText(cleaned)
            .then(() => {
                showToast(t('copied_to_clipboard') || 'Copied!', 'success');
            })
            .catch(err => {
                console.error('Async clipboard copy failed', err);
                fallbackCopyTextToClipboard(cleaned);
            });
    };

    const renderInputArea = (isCentered = false) => {
        const Wrapper = isCentered ? 'div' : 'footer';
        return (
            <Wrapper className={isCentered ? 'w-full px-2 mt-4 mb-2 relative z-20' : 'w-full px-4 pt-2 pb-5 shrink-0 relative z-20'} style={{ background: 'transparent' }}>
                <div className="max-w-2xl mx-auto">
                    <div className="relative rounded-3xl border transition-all focus-within:shadow-lg"
                        style={{
                            background: 'rgba(255,255,255,0.88)',
                            border: '1px solid rgba(200,210,230,0.6)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 1px 6px rgba(60,64,67,0.06), 0 2px 12px rgba(60,64,67,0.06)'
                        }}
                    >
                        {/* Attachment preview */}
                        {attachment && (
                            <div className="absolute bottom-full mb-3 left-0 p-2 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
                                style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(200,210,230,0.5)' }}>
                                <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden">
                                    <img src={URL.createObjectURL(attachment)} alt="preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="pr-2">
                                    <p className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">{attachment.name}</p>
                                    <button onClick={handleRemoveAttachment} className="text-[10px] text-rose-500 font-bold hover:underline mt-0.5">Remove</button>
                                </div>
                            </div>
                        )}

                        <div className={`flex items-end gap-2 ${isCentered ? 'px-4 py-3' : 'px-3 py-2'}`}>
                            {/* Attach */}
                            <div className={`pb-1.5 ${isCentered ? 'mb-1' : ''}`}>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`flex items-center justify-center rounded-full transition-colors ${isCentered ? 'w-10 h-10' : 'w-8 h-8'}`}
                                    style={{ background: attachment ? 'rgba(66,133,244,0.12)' : 'transparent', color: attachment ? '#4285F4' : '#80868b' }}
                                    onMouseEnter={e => { if (!attachment) e.currentTarget.style.background = 'rgba(0,0,0,0.06)' }}
                                    onMouseLeave={e => { if (!attachment) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <Plus className={`${isCentered ? 'w-6 h-6' : 'w-5 h-5'} ${attachment ? 'rotate-45' : ''} transition-transform`} />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col gap-2">
                                {/* Model Switcher Pill (Gemini Premium Style) */}
                                <div className="relative group/mode select-none">
                                    <Motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsModeMenuOpen(!isModeMenuOpen);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border shadow-sm backdrop-blur-md z-10 ${chatMode === 'SHOP'
                                            ? 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100'
                                            : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100 text-purple-600 hover:from-purple-100 hover:to-blue-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {chatMode === 'SHOP' ? (
                                                <Package className="w-3.5 h-3.5" />
                                            ) : (
                                                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                            )}
                                            <span className="tracking-tight">{chatMode === 'SHOP' ? 'AI SHOP' : 'HEART GENERAL'}</span>
                                        </div>
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isModeMenuOpen ? 'rotate-180' : ''}`} />
                                    </Motion.button>

                                    <AnimatePresence>
                                        {isModeMenuOpen && (
                                            <Motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                className="absolute bottom-full left-0 mb-3 w-56 bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-white/20 overflow-hidden z-[100] p-1.5 ring-1 ring-black/5"
                                            >
                                                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pilih Mode AI</div>

                                                <button
                                                    onClick={() => { setChatMode('SHOP'); setIsModeMenuOpen(false); }}
                                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-[1rem] transition-all text-left group ${chatMode === 'SHOP' ? 'bg-indigo-50/80 text-indigo-700 shadow-inner' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    <div className={`p-2 rounded-xl transition-colors ${chatMode === 'SHOP' ? 'bg-white shadow-sm' : 'bg-gray-100 group-hover:bg-white'}`}>
                                                        <Package className="w-4 h-4 text-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[12px] font-bold tracking-tight">AI SHOP</div>
                                                        <div className="text-[10px] text-gray-400 font-medium">Asisten Belanja Pintar</div>
                                                    </div>
                                                    {chatMode === 'SHOP' && <Check className="w-4 h-4 ml-auto text-indigo-500" />}
                                                </button>

                                                <button
                                                    onClick={() => { setChatMode('GENERAL'); setIsModeMenuOpen(false); }}
                                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-[1rem] transition-all text-left group ${chatMode === 'GENERAL' ? 'bg-purple-50/80 text-purple-700 shadow-inner' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    <div className={`p-2 rounded-xl transition-colors ${chatMode === 'GENERAL' ? 'bg-white shadow-sm' : 'bg-gray-100 group-hover:bg-white'}`}>
                                                        <Sparkles className="w-4 h-4 text-purple-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[12px] font-bold tracking-tight">HEART GENERAL</div>
                                                        <div className="text-[10px] text-gray-400 font-medium">Chat Bebas & Kreatif</div>
                                                    </div>
                                                    {chatMode === 'GENERAL' && <Check className="w-4 h-4 ml-auto text-purple-500" />}
                                                </button>
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <textarea
                                    rows="1"
                                    className={`flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-48 custom-scrollbar outline-none px-1 ${isCentered ? 'py-3.5 text-lg min-h-[56px]' : 'py-2.5 text-[0.9375rem] min-h-[44px]'}`}
                                    style={{ color: '#3c4043', lineHeight: '1.6', fontWeight: 400 }}
                                    placeholder={attachment ? "Tanya tentang gambar ini..." : `Minta AI ${shortName}...`}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                    disabled={isLoading || messages.filter(m => m.role === 'ai').length >= 10}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            if (messages.filter(m => m.role === 'ai').length < 10) handleSend();
                                        }
                                    }}
                                />
                            </div>

                            {/* Send */}
                            <div className={`pb-1.5 ${isCentered ? 'mb-1' : ''}`}>
                                <button
                                    onClick={handleSend}
                                    disabled={(!input.trim() && !attachment) || isLoading || isChatLoading || messages.filter(m => m.role === 'ai').length >= 10}
                                    className={`flex items-center justify-center rounded-full transition-all active:scale-90 ${isCentered ? 'w-11 h-11' : 'w-9 h-9'}`}
                                    style={{
                                        background: (!input.trim() && !attachment) || isLoading || messages.filter(m => m.role === 'ai').length >= 10
                                            ? 'rgba(0,0,0,0.06)'
                                            : 'linear-gradient(135deg, #4285F4 0%, #9C4DCC 100%)',
                                        color: (!input.trim() && !attachment) || isLoading || messages.filter(m => m.role === 'ai').length >= 10
                                            ? '#bdc1c6'
                                            : '#fff',
                                        boxShadow: (!input.trim() && !attachment) || isLoading ? 'none' : '0 2px 8px rgba(66,133,244,0.35)'
                                    }}
                                >
                                    <ArrowUp className={isCentered ? 'w-5 h-5' : 'w-4.5 h-4.5'} style={isCentered ? {} : { width: 18, height: 18 }} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {messages.filter(m => m.role === 'ai').length >= 10 ? (
                        <p className="text-center text-xs font-medium mt-3 py-1.5 rounded-xl" style={{ color: '#ea4335', background: 'rgba(234,67,53,0.08)' }}>
                            Sesi habis. Mulai chat baru.
                        </p>
                    ) : (
                        <p className="text-center text-[11px] mt-2.5" style={{ color: '#9aa0a6' }}>
                            AI {shortName} {new Date().getFullYear()} · Hasil AI mungkin tidak selalu akurat.
                        </p>
                    )}
                </div>
            </Wrapper>
        );
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
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
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
                                    className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <X className="w-5 h-5 bg-white text-rose-500 rounded-full p-0.5" />
                                    {t('end_call')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rating Feedback Modal (Inline) */}
            {ratingModal && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4"
                    >
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-1">
                                {ratingModal.score >= 4
                                    ? (t('feedback_title_good') || 'Terima Kasih! 😊')
                                    : (t('feedback_title') || 'Tell us why?')}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium">
                                {ratingModal.score >= 4
                                    ? (t('feedback_desc_good') || 'Kasih tau dong apa yang bikin jawaban ini ngebantu banget!')
                                    : (t('feedback_desc') || 'We want to improve. What went wrong?')}
                            </p>
                        </div>

                        <div className="flex justify-center mb-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`w-8 h-8 ${ratingModal.score >= s ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} />
                                ))}
                            </div>
                        </div>

                        <textarea
                            className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-100 resize-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
                            placeholder={t('feedback_placeholder') || 'Your feedback (optional)...'}
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
                                className="flex-[2] py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm tracking-wide hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                            >
                                {t('submit') || (ratingFeedback.trim() ? 'Kirim Review' : 'Kirim Rating Saja')}
                            </button>
                        </div>
                    </Motion.div>
                </div>
            )}

            {/* Session Rating Modal (Popup after 5 AI responses) */}
            {sessionRatingModal && (
                <div className="absolute inset-0 z-[65] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl space-y-6 border border-slate-100 relative overflow-hidden"
                    >
                        <button
                            onClick={() => setSessionRatingModal(false)}
                            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-3 pt-4">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-inner">
                                <Star className="w-8 h-8 text-amber-500 fill-current" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                                {t('session_rating_title') || 'Gimana obrolan kita sejauh ini?'}
                            </h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed px-2">
                                {t('session_rating_desc') || 'Bantu kami jadi lebih baik! Berikan rating 5 bintang biar makin semangat ngasih layanan terbaik buat kamu ya, bre! ⭐⭐⭐⭐⭐'}
                            </p>
                        </div>

                        <div className="flex justify-center gap-2 py-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSessionRatingScore(s)}
                                    className={`p-2 transition-all hover:scale-110 active:scale-95 ${sessionRatingScore >= s ? 'text-amber-500' : 'text-slate-200'}`}
                                >
                                    <Star className={`w-10 h-10 ${sessionRatingScore >= s ? 'fill-current drop-shadow-md' : ''}`} />
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                                {t('reason_optional') || 'Alasan (Opsional)'}
                            </label>
                            <textarea
                                className="w-full h-24 p-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-200 resize-none text-sm font-medium text-slate-700 placeholder:text-slate-300 custom-scrollbar shadow-inner"
                                placeholder={t('session_feedback_placeholder') || 'Kasih tau alasannya di sini...'}
                                value={sessionRatingFeedback}
                                onChange={(e) => setSessionRatingFeedback(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleSessionRatingSubmit}
                                disabled={isLoading}
                                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 shadow-xl shadow-slate-300 transition-all active:scale-95"
                            >
                                {isLoading ? 'Sending...' : (t('send_rating') || 'Kirim Rating')}
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
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
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
                                        <p className="font-bold text-sm">Store Printer</p>
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
                                        <p className="font-bold text-sm">Browser Print</p>
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
            <div className={`flex-1 flex flex-col h-full relative overflow-hidden transition-all bg-white ${isLiveSupport ? 'blur-sm pointer-events-none' : ''}`}
            >

                {/* Header */}
                {isAuthenticated && (
                    <header className="h-16 flex items-center justify-between px-6 shrink-0 z-10 mt-2" style={{ background: 'rgba(238,241,248,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(200,210,230,0.4)' }}>
                        <div className="flex items-center gap-2.5">
                            <Bot className="w-6 h-6 text-indigo-600 shrink-0" />
                            <span className="text-base font-bold text-slate-900" style={{ letterSpacing: '-0.01em' }}>AI {shortName}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest ${isOutOfTopic ? 'bg-amber-100 text-amber-600' : activeModel?.includes('pro') ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {isOutOfTopic ? 'Out of Topic' : activeModel?.includes('pro') ? '2.5 Pro' : 'Flash'}
                            </span>
                            {isOutOfTopic && (
                                <button
                                    onClick={handleOutOfTopicExit}
                                    className="p-1 hover:bg-slate-200 rounded-full transition-colors ml-1"
                                    title="Exit Out of Topic"
                                >
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {isAuthenticated && (
                                <button
                                    onClick={() => {
                                        const role = user?.role;
                                        if (role === 'OWNER') navigate(PATHS.OWNER_DASHBOARD);
                                        else if (role === 'STAFF') navigate(PATHS.STAFF_DASHBOARD);
                                        else if (role === 'CONTRIBUTOR') navigate(PATHS.CONTRIBUTOR_DASHBOARD);
                                        else if (role === 'ADMIN') navigate(PATHS.ADMIN_DASHBOARD);
                                        else if (role === 'SUPER_ADMIN') navigate(PATHS.SUPER_ADMIN_DASHBOARD);
                                        else navigate(PATHS.USER_DASHBOARD);
                                    }}
                                    className="h-9 px-4 flex items-center gap-1.5 rounded-full text-xs font-bold transition-all hover:shadow-md active:scale-95 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                                >
                                    <LayoutPanelLeft className="w-4 h-4 text-indigo-600" />
                                    <span className="hidden md:inline">Dashboard</span>
                                </button>
                            )}
                            {!hideSidebarTools && (
                                <button
                                    onClick={() => startNewChat()}
                                    className="h-9 px-4 flex items-center gap-1.5 rounded-full text-xs font-semibold transition-all hover:shadow-md active:scale-95"
                                    style={{ background: 'rgba(66,133,244,0.1)', color: '#4285F4', border: '1px solid rgba(66,133,244,0.2)' }}
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Chat Baru</span>
                                </button>
                            )}
                            {!hideSidebarTools && (
                                <button
                                    onClick={() => setIsHistoryOpen(true)}
                                    className="p-2.5 rounded-full transition-colors relative"
                                    style={{ color: '#5f6368' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <History className="w-5 h-5" />
                                    {messages.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />}
                                </button>
                            )}
                            {user?.role === 'USER' && (
                                <button
                                    onClick={() => navigate(PATHS.CHAT_WITH_STAFF)}
                                    className="p-2.5 rounded-full transition-colors"
                                    style={{ color: '#5f6368' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    title="Chat with Staff"
                                >
                                    <Headset className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={toggleLanguage}
                                className="p-2.5 rounded-full transition-colors"
                                style={{ color: '#5f6368' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <Languages className="w-5 h-5" />
                            </button>
                        </div>
                    </header>
                )}

                <main className="flex-1 overflow-y-auto w-full custom-scrollbar pb-4">
                    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
                        {messages.length === 0 && !isChatLoading && (
                            <div className="flex flex-col items-center justify-center min-h-[55vh] text-center">
                                <Motion.div
                                    initial={{ scale: 0.85, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.4, ease: 'easeOut' }}
                                    className="mb-8 w-full text-left max-w-2xl px-2"
                                >
                                    <h1 className="text-[44px] sm:text-[48px] font-medium tracking-tight leading-tight mb-3 text-slate-800">
                                        {t('greeting_halo')} <span className="bg-blue-600 text-white underline decoration-blue-300 underline-offset-4 px-4 py-1.5 text-[32px] sm:text-[36px] inline-block align-middle -translate-y-1">{user?.name ? user.name.split(' ')[0] : 'Guest'}</span>
                                    </h1>
                                    <h2 className="text-[44px] sm:text-[48px] font-medium tracking-tight leading-tight" style={{ color: '#8fa1b3' }}>
                                        {t('greeting_help')}
                                    </h2>
                                </Motion.div>

                                {/* Input bar centered on empty state */}
                                {/* renderInputArea(true) removed as it's redundant with the bottom input */}

                                {/* Suggestion chips */}
                                <Motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-wrap justify-center gap-2 max-w-lg mt-2 mx-auto"
                                >
                                    {[
                                        { emoji: '🛒', text: t('suggest_search'), key: 'search' },
                                        { emoji: '📍', text: t('suggest_stores'), key: 'stores' },
                                        { emoji: '💡', text: t('suggest_recommend'), key: 'recommend' },
                                        { emoji: '🏷️', text: t('suggest_price'), key: 'price' },
                                        { emoji: '✨', text: t('suggest_oot'), key: 'oot', special: 'oot' },
                                    ].map((chip) => (
                                        <button
                                            key={chip.key}
                                            onClick={() => {
                                                if (chip.special === 'oot') {
                                                    setIsOutOfTopic(true);
                                                    startNewChat();
                                                } else {
                                                    setInput(chip.text + ' ');
                                                }
                                            }}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-sm active:scale-95 ${chip.special === 'oot' ? 'bg-amber-50 border-amber-200 text-amber-700' : ''}`}
                                            style={chip.special !== 'oot' ? { background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(200,210,230,0.6)', color: '#3c4043', backdropFilter: 'blur(6px)' } : {}}
                                            onMouseEnter={e => { if (chip.special !== 'oot') e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; }}
                                            onMouseLeave={e => { if (chip.special !== 'oot') e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; }}
                                        >
                                            <span>{chip.emoji}</span>
                                            <span>{chip.text}</span>
                                        </button>
                                    ))}
                                </Motion.div>

                                {isAuthenticated && user?.allowChatReview !== false && showReviewBanner && (
                                    <Motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                        className="relative mt-6 max-w-md w-full text-left p-4 rounded-2xl"
                                        style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(200,210,230,0.5)', backdropFilter: 'blur(8px)' }}
                                    >
                                        <button onClick={handleDismissBanner} className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="flex gap-3 pr-5">
                                            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                Humans review some saved chats to improve AI {shortName}. Stop in <Link to={user?.role === 'OWNER' ? PATHS.OWNER_PROFILE : user?.role === 'STAFF' ? PATHS.STAFF_PROFILE : user?.role === 'CONTRIBUTOR' ? PATHS.CONTRIBUTOR_PROFILE : PATHS.USER_PROFILE} className="text-blue-500 hover:underline font-semibold">Profile</Link>.
                                            </p>
                                        </div>
                                    </Motion.div>
                                )}
                            </div>
                        )}

                        {messages.map((m, idx) => (
                            <Motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={idx}
                                className={`flex w-full gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {/* AI: Bot icon */}
                                {m.role !== 'user' && (
                                    <div className={`shrink-0 w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] mt-1 ${m.status?.includes('SOP') ? 'border-indigo-200' : ''}`}>
                                        {m.status?.includes('SOP') ? <ShieldCheck className="w-4 h-4 text-indigo-700" title="Heart-MGMT" /> : <Bot className="w-4 h-4 text-indigo-600" />}
                                    </div>
                                )}

                                <div className={`flex flex-col ${m.role === 'user' ? 'items-end max-w-[75%]' : 'items-start max-w-[88%]'}`}>
                                    {m.role === 'user' ? (
                                        <div className="px-4 py-2.5 rounded-[1.2rem] rounded-tr-md text-sm leading-relaxed font-medium"
                                            style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(200,210,230,0.6)', color: '#3c4043', backdropFilter: 'blur(8px)' }}>
                                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{cleanMessage(m.content)}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        /* AI response — plain text, Gemini style */
                                        <div className="text-sm leading-7 font-normal markdown-content group relative" style={{ color: '#1a1a2e' }}>
                                            {m.status?.includes('SOP') && (
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <span className="text-[10px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-md uppercase tracking-widest shadow-sm">Heart-MGMT</span>
                                                    {m.status === 'SOP_NAVIGATE' && (
                                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1">
                                                            <ArrowUpRight className="w-3 h-3" /> Navigation Ready
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{cleanMessage(m.content)}</ReactMarkdown>

                                            {/* Action row */}
                                            <div className="flex items-center gap-1 mt-2">
                                                {m.status === 'SOP_NAVIGATE' && (
                                                    <button
                                                        onClick={() => navigate(user?.role === 'OWNER' ? PATHS.OWNER_SOP : user?.role === 'STAFF' ? PATHS.STAFF_SOP : '#')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors mr-2 mb-2"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        Buka Dokumen SOP
                                                    </button>
                                                )}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => copyToClipboard(m.content)} className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors" title="Copy">
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors" title="Good">
                                                        <ThumbsUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors" title="Bad">
                                                        <ThumbsDown className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Product Video Thumbnails */}
                                    {m.products && m.products.some(p => p.videoUrl) && (
                                        <div className="mt-3 flex flex-wrap gap-3">
                                            {m.products.filter(p => p.videoUrl).map((p, pIdx) => {
                                                const videoId = p.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^?&]+)/)?.[1];
                                                if (!videoId) return null;
                                                return (
                                                    <Motion.div
                                                        key={pIdx}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="relative group cursor-pointer rounded-2xl overflow-hidden border border-slate-100 shadow-sm w-40"
                                                        onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                                                    >
                                                        <div className="aspect-video relative">
                                                            <img
                                                                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                                                alt={p.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                                                    <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-2 bg-white/90 backdrop-blur-sm border-t border-slate-50">
                                                            <p className="text-[10px] font-bold text-slate-800 truncate leading-tight">{p.name}</p>
                                                            <p className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                                                <ArrowUpRight className="w-2 h-2" /> Route Video
                                                            </p>
                                                        </div>
                                                    </Motion.div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Nearby stores map */}
                                    {m.nearbyStores && m.nearbyStores.length > 0 && (
                                        <div className="mt-3 w-full">
                                            <StoreMap stores={m.nearbyStores} userLocation={m.userLocation} />
                                        </div>
                                    )}

                                    {/* Rating */}
                                    {m.ratingPrompt && (
                                        <div className="mt-2 flex items-center gap-2 p-2 rounded-xl" style={{ background: 'rgba(251,188,4,0.1)', border: '1px solid rgba(251,188,4,0.2)' }}>
                                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest px-1">{m.limitReached ? "Limit" : "Rate"}</span>
                                            {isAuthenticated && (
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <button key={s} onClick={() => handleRating(idx, s)} className={`p-1 transition-colors ${(m.selectedRating || 0) >= s ? 'text-amber-400' : 'text-amber-200 hover:text-amber-400'}`}>
                                                            <Star className={`w-3 h-3 ${(m.selectedRating || 0) >= s ? 'fill-current' : ''}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* User avatar */}
                                {m.role === 'user' && (
                                    <div className="shrink-0 w-7 h-7 rounded-full overflow-hidden mt-0.5 border border-blue-100">
                                        <UserAvatar user={user} size={28} square={false} />
                                    </div>
                                )}
                            </Motion.div>
                        ))}

                        {(isLoading || isChatLoading) && (
                            <Motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex w-full gap-3 justify-start">
                                <div className="shrink-0 w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] mt-1">
                                    <Bot className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-indigo-400"></div>
                                    <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.15s] bg-indigo-400"></div>
                                    <div className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.3s] bg-indigo-400"></div>
                                </div>
                            </Motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </main>

                {/* Input Area */}
                {renderInputArea(false)}
            </div>

            {/* Hidden Printable Area */}
            <div className="hidden print:block p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">{storeSlug?.toUpperCase() || 'MY STORE'} SHOPPING LIST</h1>
                    <p className="text-sm text-slate-500">Generated on: {new Date().toLocaleString()}</p>
                </div>
                <div className="space-y-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900">
                                <th className="py-2 font-bold">Item</th>
                                <th className="py-2 font-bold">Loc</th>
                                <th className="py-2 text-right font-bold">Price</th>
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
                                    <td className="py-4 text-right font-bold">
                                        Rp {item.product.price?.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-slate-900">
                                <td colSpan="2" className="py-4 font-bold">TOTAL ESTIMASI</td>
                                <td className="py-4 text-right font-bold text-lg">
                                    Rp {shoppingListItems.reduce((acc, item) => acc + item.product.price, 0).toLocaleString('id-ID')}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="mt-12 text-center border-t border-slate-100 pt-8 opacity-50">
                    <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Thank you for shopping with {companyName} Assistant</p>
                </div>
            </div>
        </div>

    );
};

export default ChatView;
