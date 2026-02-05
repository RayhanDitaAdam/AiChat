import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getLiveSupportSessions, respondToLiveChat, getOwnerLiveChatHistory, acceptCall, declineCall } from '../../services/api.js';
import { User, Send, Clock, MessageSquare, ShieldCheck, Search, Loader2, MapPin, Phone, X } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const OwnerLiveSupport = () => {
    const [sessions, setSessions] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const messagesEndRef = useRef(null);
    const pollingRef = useRef(null);
    const timerRef = useRef(null);
    const prevPendingUsersRef = useRef([]);
    const prevSessionsCount = useRef(0);
    const activeUserRef = useRef(null);

    // Sync ref with state
    useEffect(() => {
        activeUserRef.current = activeUser;
    }, [activeUser]);

    // Timer logic for call duration
    useEffect(() => {
        if (activeUser?.callStatus === 'CALL_ACCEPTED') {
            if (!timerRef.current) {
                timerRef.current = setInterval(() => {
                    setCallDuration(prev => prev + 1);
                }, 1000);
            }
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (!activeUser) setCallDuration(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [activeUser, activeUser?.callStatus]);

    // Helper to format duration (MM:SS)
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
    const [notification, setNotification] = useState(null); // { message: string }

    // Clear notification after 3s
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

                // Get the current active user from Ref to avoid dependency loops
                const currentActiveUser = activeUserRef.current;

                // Only show users with an active call status OR if they are the currently activeUser
                const filteredSessions = currentSessions.filter(s =>
                    s.status === 'CALL_PENDING' ||
                    s.status === 'CALL_ACCEPTED' ||
                    s.user.id === currentActiveUser?.id
                );

                setSessions(filteredSessions);

                // Sync activeUser status and location
                if (currentActiveUser) {
                    const currentSession = currentSessions.find(s => s.user.id === currentActiveUser.id);
                    if (currentSession) {
                        const statusChanged = currentActiveUser.callStatus !== currentSession.status;
                        const latChanged = currentActiveUser.location?.lat !== currentSession.latitude;
                        const lngChanged = currentActiveUser.location?.lng !== currentSession.longitude;

                        if (statusChanged || latChanged || lngChanged) {
                            if (statusChanged && currentActiveUser.callStatus === 'CALL_ACCEPTED' && currentSession.status !== 'CALL_ACCEPTED') {
                                setCallDuration(0);
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
                        // User disappeared from list or call ended/expired -> Set to general
                        setCallDuration(0);
                        setActiveUser(prev => {
                            if (!prev) return null;
                            return { ...prev, callStatus: 'GENERAL' };
                        });
                    }
                }

                // Notification logic: Only notify if there's a NEW pending call
                const currentPending = currentSessions.filter(s => s.status === 'CALL_PENDING').map(s => s.user.id);
                const hasNewCall = currentPending.some(id => !prevPendingUsersRef.current.includes(id));

                if (hasNewCall) {
                    try {
                        const playPromise = audioRef.current?.play();
                        if (playPromise) playPromise.catch(() => { });
                    } catch (e) { console.warn(e); }
                    setNotification("New Customer Calling! 🔔");
                }
                prevPendingUsersRef.current = currentPending;
                prevSessionsCount.current = currentSessions.length;
            }
        } catch (err) {
            console.error('Failed to fetch sessions', err);
        }
    }, []); // 100% stable now, uses refs for all variable data

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 5000);
        return () => clearInterval(interval);
    }, [fetchSessions]);

    const fetchUserHistory = async (userId) => {
        try {
            const data = await getOwnerLiveChatHistory(userId);
            if (data.status === 'success') {
                setMessages(data.chats.map(m => ({
                    role: m.role,
                    content: m.message,
                    timestamp: m.timestamp
                })));
            }
        } catch (err) {
            console.error('Failed to fetch user history', err);
        }
    };

    // Polling for active chat
    useEffect(() => {
        if (activeUser) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = setInterval(async () => {
                const latestTime = messages.length > 0 ? messages[messages.length - 1].timestamp : '';
                const data = await getOwnerLiveChatHistory(activeUser.id, latestTime);
                if (data.status === 'success' && data.chats.length > 0) {
                    setMessages(prev => [...prev, ...data.chats.map(m => ({
                        role: m.role,
                        content: m.message,
                        timestamp: m.timestamp
                    }))]);
                }
            }, 3000);
        }
        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, [activeUser, messages]);

    const handleSelectUser = (session) => {
        // Enriched user object with location from session
        setActiveUser({
            ...session.user,
            callStatus: session.status,
            location: (session.latitude && session.longitude) ? { lat: session.latitude, lng: session.longitude } : null
        });
        setMessages([]); // Clear while loading
        fetchUserHistory(session.user.id);
    };

    const handleAcceptCall = async (userId) => {
        try {
            // Request microphone access
            await navigator.mediaDevices.getUserMedia({ audio: true });
            const res = await acceptCall(userId);
            if (res.status === 'success') {
                setActiveUser(prev => ({ ...prev, callStatus: 'CALL_ACCEPTED' }));
                fetchSessions();
            }
        } catch (err) {
            console.error('Failed to accept call', err);
            alert('Could not access microphone or accept call.');
        }
    };

    const handleDeclineCall = async (userId) => {
        try {
            const res = await declineCall(userId);
            if (res.status === 'success') {
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
            alert('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
            <div className="flex flex-1 gap-6 antialiased relative min-h-0">
                {/* Notification Toast */}
                <AnimatePresence>
                    {notification && (
                        <Motion.div
                            initial={{ opacity: 0, y: -20, right: 0 }}
                            animate={{ opacity: 1, y: 0, right: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-4 right-4 z-50 bg-indigo-600 text-white px-6 py-4 rounded-2xl shadow-xl shadow-indigo-200 flex items-center gap-3"
                        >
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                            <span className="font-bold">{notification}</span>
                        </Motion.div>
                    )}
                </AnimatePresence>

                {/* User List Side */}
                <div className="w-80 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                            Live Sessions
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {sessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                                <ShieldCheck className="w-12 h-12 mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">No Active Calls</p>
                            </div>
                        ) : (
                            sessions.map((s) => (
                                <button
                                    key={s.user.id}
                                    onClick={() => handleSelectUser(s)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all border ${activeUser?.id === s.user.id
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-100 scale-[1.02]'
                                        : 'bg-white text-slate-700 border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${activeUser?.id === s.user.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                                            {s.user.name?.[0] || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-black text-sm truncate">{s.user.name}</p>
                                                {(s.latitude && s.longitude) && (
                                                    <MapPin className={`w-3 h-3 ${activeUser?.id === s.user.id ? 'text-white/80' : 'text-indigo-500'}`} />
                                                )}
                                            </div>
                                            <p className={`text-[10px] truncate ${activeUser?.id === s.user.id ? 'text-white/60' : 'text-slate-400'}`}>
                                                {s.message.substring(0, 30)}...
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Area Side */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                {activeUser ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg">
                                    {activeUser.name?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900">{activeUser.name}</h3>
                                    <p className="text-xs text-slate-400 font-medium">{activeUser.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {activeUser.callStatus === 'CALL_PENDING' ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleAcceptCall(activeUser.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                        >
                                            <Phone className="w-4 h-4 fill-current" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Accept Call</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeclineCall(activeUser.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
                                        >
                                            <X className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Decline</span>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {activeUser.location && (
                                            <a
                                                href={`https://www.google.com/maps?q=${activeUser.location.lat},${activeUser.location.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                            >
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">View Location</span>
                                            </a>
                                        )}
                                        {activeUser.callStatus === 'CALL_ACCEPTED' ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full border border-emerald-500 shadow-lg shadow-emerald-100 animate-pulse">
                                                <Phone className="w-3 h-3 fill-current" />
                                                <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">
                                                    In Call ({formatDuration(callDuration)})
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 rounded-full border border-slate-100">
                                                <MessageSquare className="w-3 h-3" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    Active Chat
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Location Map Section */}
                        {activeUser.location && (
                            <div className="shrink-0 border-b border-slate-100 bg-slate-50">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5 text-indigo-600" />
                                            <h4 className="font-black text-slate-900">Customer Location</h4>
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps?q=${activeUser.location.lat},${activeUser.location.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold"
                                        >
                                            Open in Maps →
                                        </a>
                                    </div>
                                    <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            style={{ border: 0 }}
                                            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${activeUser.location.lat},${activeUser.location.lng}&zoom=16`}
                                            allowFullScreen
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        🎯 Coordinates: {activeUser.location.lat.toFixed(6)}, {activeUser.location.lng.toFixed(6)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/30">
                            <AnimatePresence>
                                {messages.map((m, idx) => (
                                    <Motion.div
                                        initial={{ opacity: 0, x: m.role === 'staff' ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={idx}
                                        className={`flex w-full ${m.role === 'staff' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] ${m.role === 'staff' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 rounded-3xl rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-3xl rounded-tl-none'} p-5`}>
                                            <p className="text-sm font-bold leading-relaxed">{m.content}</p>
                                            <div className={`mt-2 text-[9px] font-black uppercase tracking-widest ${m.role === 'staff' ? 'text-white/50' : 'text-slate-300'}`}>
                                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </Motion.div>
                                ))}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-6 bg-white border-t border-slate-100">
                            <div className="relative flex items-center gap-4">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your response as staff..."
                                    className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isSending || !input.trim()}
                                    className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                                >
                                    {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-30">
                        <MessageSquare className="w-16 h-16 mb-4 text-slate-300" />
                        <h3 className="text-xl font-black text-slate-900">Select a session to start supporting</h3>
                        <p className="text-slate-400 font-bold max-w-xs">Customers are waiting for your expertise bre! 🔥</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerLiveSupport;
