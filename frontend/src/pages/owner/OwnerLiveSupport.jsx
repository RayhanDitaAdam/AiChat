import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getLiveSupportSessions, respondToLiveChat, getOwnerLiveChatHistory, acceptCall, declineCall } from '../../services/api.js';
import { User, Send, Clock, MessageSquare, ShieldCheck, Search, Loader2, MapPin, Phone, X, MoreVertical, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket.js';
import { useAuth } from '../../hooks/useAuth.js';
import UserAvatar from '../../components/UserAvatar.jsx';
import { showError } from '../../utils/swal.js';

const OwnerLiveSupport = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileView, setMobileView] = useState('LIST'); // 'LIST' | 'CHAT'
    const messagesEndRef = useRef(null);
    const pollingRef = useRef(null);
    const prevPendingUsersRef = useRef([]);
    const prevSessionsCount = useRef(0);
    const activeUserRef = useRef(null);
    const messagesRef = useRef([]);

    useEffect(() => {
        activeUserRef.current = activeUser;
    }, [activeUser]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Removed call timer logic

    // Removed call timer logic

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const audioRef = useRef(null);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        // Initialize audio with looping
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audioRef.current.loop = true;
        // Make it loud
        audioRef.current.volume = 1.0;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const fetchSessions = useCallback(async () => {
        try {
            const data = await getLiveSupportSessions();
            if (data.status === 'success') {
                const currentSessions = data.sessions;
                const currentActiveUser = activeUserRef.current;

                const filteredSessions = currentSessions.filter(s =>
                    s.status === 'CALL_PENDING' ||
                    s.status === 'CALL_ACCEPTED' ||
                    (s.user && s.user.id === currentActiveUser?.id)
                );

                setSessions(filteredSessions);

                if (currentActiveUser) {
                    const currentSession = currentSessions.find(s => s.user?.id === currentActiveUser.id);
                    if (currentSession) {
                        const statusChanged = currentActiveUser.callStatus !== currentSession.status;
                        const latChanged = currentActiveUser.location?.lat !== currentSession.latitude;
                        const lngChanged = currentActiveUser.location?.lng !== currentSession.longitude;

                        if (statusChanged || latChanged || lngChanged) {
                            if (statusChanged && currentActiveUser.callStatus === 'CALL_ACCEPTED' && currentSession.status !== 'CALL_ACCEPTED') {
                                // Timer cleanup logic removed
                            }
                            setActiveUser(prev => {
                                if (!prev) return null;
                                return {
                                    ...prev,
                                    callStatus: currentSession.status,
                                    location: (currentSession.latitude && currentSession.longitude)
                                        ? { lat: currentSession.latitude, lng: currentSession.longitude }
                                        : prev.location
                                };
                            });
                        }
                    } else if (currentActiveUser.callStatus && currentActiveUser.callStatus !== 'GENERAL') {
                        setActiveUser(prev => {
                            if (!prev) return null;
                            return { ...prev, callStatus: 'GENERAL' };
                        });
                    }
                }

                const currentPending = currentSessions.filter(s => s.status === 'CALL_PENDING').map(s => s.user?.id).filter(Boolean);
                const hasNewCall = currentPending.some(id => !prevPendingUsersRef.current.includes(id));
                const isStillPending = currentPending.length > 0;

                if (hasNewCall || isStillPending) {
                    try {
                        // Play if not already playing
                        if (audioRef.current && audioRef.current.paused) {
                            const playPromise = audioRef.current.play();
                            if (playPromise) playPromise.catch((e) => {
                                console.warn("Audio play blocked by browser. User must interact first.", e);
                            });
                        }
                    } catch (e) { console.warn(e); }

                    if (hasNewCall) {
                        setNotification("Permintaan Chat Baru");
                    }
                } else {
                    // Stop if no more pending calls
                    if (audioRef.current && !audioRef.current.paused) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                    }
                }
                prevPendingUsersRef.current = currentPending;
                prevSessionsCount.current = currentSessions.length;
            }
        } catch (err) {
            console.error('Failed to fetch sessions', err);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 5000);
        return () => clearInterval(interval);
    }, [fetchSessions]);

    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data) => {
            const currentActiveUser = activeUserRef.current;

            // Check if this is a message from a user to staff
            // Backend sends 'staff_message' for incoming user messages
            const userId = data.user_id || data.userId || (data.user?.id);

            if (currentActiveUser && userId === currentActiveUser.id) {
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, {
                        id: data.id,
                        role: data.role || 'user',
                        content: data.message,
                        timestamp: data.timestamp
                    }];
                });
            } else {
                // If not for active user, still fetch sessions to update sidebar preview/counts
                fetchSessions();
            }
        };

        const handleChatRequest = () => {
            fetchSessions();
        };

        socket.on('staff_message', handleNewMessage);
        socket.on('chat_requested', handleChatRequest);

        return () => {
            socket.off('staff_message', handleNewMessage);
            socket.off('chat_requested', handleChatRequest);
        };
    }, [socket, fetchSessions]);

    useEffect(() => {
        if (activeUser) {
            const currentUserId = activeUser.id;
            if (pollingRef.current) clearInterval(pollingRef.current);

            pollingRef.current = setInterval(async () => {
                try {
                    const currentMessages = messagesRef.current;
                    const latestTime = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1].timestamp : '';
                    const data = await getOwnerLiveChatHistory(currentUserId, latestTime);

                    // Verify if we are still looking at the same user
                    if (data.status === 'success' && data.chats.length > 0 && activeUserRef.current?.id === currentUserId) {
                        setMessages(prev => {
                            const newMessages = data.chats.filter(m => !prev.some(pm => pm.id === m.id));
                            if (newMessages.length === 0) return prev;
                            return [...prev, ...newMessages.map(m => ({
                                id: m.id,
                                role: m.role,
                                content: m.message,
                                timestamp: m.timestamp
                            }))];
                        });
                    }
                } catch (err) {
                    console.warn('Polling error:', err);
                }
            }, 5000);
        }
        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, [activeUser]);

    const fetchUserHistory = async (userId) => {
        try {
            const data = await getOwnerLiveChatHistory(userId);
            // Double check that this user is still the active one
            if (data.status === 'success' && activeUserRef.current?.id === userId) {
                const historyMessages = data.chats.map(m => ({
                    id: m.id,
                    role: m.role,
                    content: m.message,
                    timestamp: m.timestamp
                }));
                setMessages(historyMessages);
                messagesRef.current = historyMessages;
            }
        } catch (err) {
            console.error('Failed to fetch user history', err);
        }
    };

    const handleSelectUser = (session) => {
        if (!session.user) return;
        setMessages([]);
        messagesRef.current = [];
        setActiveUser({
            ...session.user,
            callStatus: session.status,
            location: (session.latitude && session.longitude) ? { lat: session.latitude, lng: session.longitude } : null
        });
        fetchUserHistory(session.user.id);
        setMobileView('CHAT');
    };

    const handleAcceptCall = async (userId) => {
        try {
            const res = await acceptCall(userId);
            if (res.status === 'success') {
                // Stop alarm on accept
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }
                setActiveUser(prev => ({ ...prev, callStatus: 'CALL_ACCEPTED' }));
                fetchSessions();
            }
        } catch (err) {
            console.error('Failed to join chat', err);
            showError('Join Failed', 'Gagal bergabung ke chat.');
        }
    };

    const handleDeclineCall = async (userId) => {
        try {
            const res = await declineCall(userId);
            if (res.status === 'success') {
                // Stop alarm potentially if this was the only pending one
                // fetchSessions will handle it but can do it here too
                setActiveUser(null);
                fetchSessions();
            }
        } catch (err) {
            console.error('Failed to decline call', err);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !activeUser || isSending) return;

        const responseMsg = input.trim();
        setInput('');
        setIsSending(true);

        try {
            const data = await respondToLiveChat(activeUser.id, responseMsg);
            if (data.status === 'success') {
                setMessages(prev => [...prev, {
                    role: 'staff',
                    content: responseMsg,
                    timestamp: new Date().toISOString()
                }]);
            }
        } catch {
            showError('Send Failed', 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const filteredSessions = sessions.filter(s =>
        s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'Now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex h-full w-full bg-white overflow-hidden">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] bg-rose-600 text-white px-8 py-5 rounded-2xl shadow-[0_20px_50px_rgba(225,29,72,0.3)] flex flex-col items-center gap-4 min-w-[320px] border-2 border-rose-400"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-ping">
                                <MessageSquare className="w-6 h-6 text-white fill-current" />
                            </div>
                            <div className="text-center">
                                <span className="text-lg font-bold tracking-tight block ml-2">{notification}</span>
                                <span className="text-xs font-medium text-rose-100 uppercase tracking-widest">{t('support.new_call')}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full mt-2">
                            <button
                                onClick={() => {
                                    if (audioRef.current) {
                                        audioRef.current.pause();
                                        audioRef.current.currentTime = 0;
                                    }
                                    setNotification(null);
                                }}
                                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium transition-all uppercase tracking-wider"
                            >
                                Silent for now
                            </button>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar - Contact List */}
            <div className={`
                ${mobileView === 'LIST' ? 'flex' : 'hidden lg:flex'}
                w-full lg:w-80 border-r border-slate-200 flex-col bg-white shrink-0 overflow-hidden h-full
            `}>
                {/* Tabs */}
                <div className="px-4 pt-4 border-b border-slate-100 bg-white">
                    <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
                        <li className="mr-2" role="presentation">
                            <button
                                className="inline-flex items-center justify-center p-4 border-b-2 border-indigo-600 rounded-t-lg active text-indigo-600 group gap-2 transition-all hover:text-indigo-700 hover:border-indigo-300"
                                id="chats-tab"
                                type="button"
                                role="tab"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Chats</span>
                            </button>
                        </li>
                        <li className="mr-2" role="presentation">
                            <button
                                className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-slate-600 hover:border-slate-300 group gap-2 text-slate-500 transition-all"
                                id="calls-tab"
                                type="button"
                                role="tab"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Calls</span>
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Sidebar Header & Search */}
                <div className="p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Latest chats</h2>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search messages or contacts"
                            className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Session List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                                <ShieldCheck className="w-6 h-6 text-slate-200" />
                            </div>
                            <p className="text-sm font-semibold text-slate-400">{t('support.no_sessions')}</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-50">
                            {filteredSessions.map((s) => {
                                if (!s.user) return null;
                                const isActive = activeUser?.id === s.user.id;
                                const isPending = s.status === 'CALL_PENDING';
                                const isInCall = s.status === 'CALL_ACCEPTED';
                                const isOnline = true; // Placeholder for online status

                                return (
                                    <li key={s.user.id}>
                                        <button
                                            onClick={() => handleSelectUser(s)}
                                            className={`w-full text-left px-4 py-4 flex items-center gap-3 transition-all hover:bg-slate-50 group relative ${isActive ? 'bg-indigo-50/50' : ''}`}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full" />
                                            )}

                                            {/* Avatar with Status */}
                                            <div className="relative shrink-0">
                                                <div className={`w-12 h-12 rounded-full overflow-hidden shadow-sm transition-transform group-hover:scale-105 ${isActive ? 'ring-2 ring-indigo-600' : ''}`}>
                                                    <UserAvatar user={s.user} size={48} />
                                                </div>
                                                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className={`text-sm truncate font-semibold ${isActive ? 'text-indigo-900' : 'text-slate-900'}`}>
                                                        {s.user?.name || 'Guest User'}
                                                    </p>
                                                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
                                                        {formatTime(s.updatedAt || s.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 overflow-hidden">
                                                    {isPending && <Clock className="w-3 h-3 text-amber-500 shrink-0" />}
                                                    {isInCall && <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 animate-pulse" />}
                                                    <p className={`text-xs truncate ${isActive ? 'text-indigo-600 font-medium' : 'text-slate-500'}`}>
                                                        {isPending ? 'Waiting for response...' : (s.message?.includes('System:') ? 'System Message' : s.message?.substring(0, 40))}
                                                    </p>
                                                </div>
                                            </div>

                                            {isPending && (
                                                <div className="shrink-0">
                                                    <div className="w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                                        1
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`
                ${mobileView === 'CHAT' ? 'flex' : 'hidden lg:flex'}
                flex-1 flex-col overflow-hidden h-full
            `}>
                {activeUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                {/* Mobile Back Button */}
                                <button
                                    onClick={() => setMobileView('LIST')}
                                    className="lg:hidden p-2 -ml-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-inner">
                                        <UserAvatar user={activeUser} size={48} />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900 leading-tight">{activeUser.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                        <p className="text-xs font-medium text-emerald-600">Online</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {activeUser.callStatus === 'CALL_PENDING' ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleAcceptCall(activeUser.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-semibold shadow-md shadow-indigo-200 group"
                                        >
                                            <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            Accept Chat
                                        </button>
                                        <button
                                            onClick={() => handleDeclineCall(activeUser.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-sm font-medium"
                                        >
                                            <X className="w-4 h-4" />
                                            Decline
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors" title="Voice Call">
                                            <Phone className="w-5 h-5" />
                                        </button>
                                        <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors" title="Video Call">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                        </button>
                                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                        <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors" title="More Info">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Map */}
                        {activeUser.location && (
                            <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-5 py-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-indigo-600" />
                                        <span className="text-xs font-medium text-slate-700">{t('support.customer_location')}</span>
                                    </div>
                                    <a
                                        href={`https://www.google.com/maps?q=${activeUser.location.lat},${activeUser.location.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        {t('support.open_maps')} →
                                    </a>
                                </div>
                                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${activeUser.location.lat},${activeUser.location.lng}&zoom=16`}
                                        allowFullScreen
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1.5">
                                    📍 {activeUser.location.lat.toFixed(6)}, {activeUser.location.lng.toFixed(6)}
                                </p>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                            <AnimatePresence>
                                {messages.map((m, idx) => {
                                    const isStaff = m.role === 'staff';
                                    const showHeader = idx === 0 || messages[idx - 1]?.role !== m.role;

                                    return (
                                        <Motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={idx}
                                            className={`flex gap-3 ${isStaff ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            {/* Avatar */}
                                            <div className="w-10 h-10 shrink-0">
                                                {showHeader ? (
                                                    <div className={`w-full h-full rounded-full overflow-hidden border shadow-sm ${isStaff ? 'ring-2 ring-slate-800' : 'border-slate-200'}`}>
                                                        <UserAvatar user={isStaff ? user : activeUser} size={40} />
                                                    </div>
                                                ) : <div className="w-10" />}
                                            </div>

                                            {/* Content */}
                                            <div className={`flex flex-col gap-1 max-w-[75%] ${isStaff ? 'items-end' : 'items-start'}`}>
                                                {showHeader && (
                                                    <div className={`flex items-center gap-2 px-1 mb-0.5 ${isStaff ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <span className="text-[11px] font-medium text-slate-900">
                                                            {isStaff ? 'You (Support)' : activeUser.name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`px-5 py-3 shadow-sm ${isStaff
                                                    ? 'bg-slate-800 text-white rounded-2xl rounded-tr-none'
                                                    : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none'
                                                    }`}>
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                                </div>
                                                {idx === messages.length - 1 && isStaff && (
                                                    <div className="flex items-center gap-1 px-1">
                                                        <span className="text-[10px] font-medium text-slate-400">Delivered</span>
                                                        <ShieldCheck className="w-3 h-3 text-indigo-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </Motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        {/* Input Area */}
                        <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0">
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 transition-all focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/5">
                                <div className="flex items-end gap-2">
                                    <textarea
                                        rows={1}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Write a reply..."
                                        className="flex-1 bg-transparent border-none resize-none py-2 px-3 text-sm focus:ring-0 placeholder:text-slate-400 min-h-[44px] max-h-32"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={isSending || !input.trim()}
                                        className="mb-1 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-indigo-200"
                                    >
                                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{t('support.select_prompt')}</h3>
                        <p className="text-sm text-slate-400 max-w-xs">{t('support.expert_prompt')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerLiveSupport;
