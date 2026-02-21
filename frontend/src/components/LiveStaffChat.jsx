import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, X, Headset, Loader2, Sparkles, MessageSquare, ShieldCheck, User, Search, ChevronLeft } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { requestStaff, sendMessage, stopStaffSupport, getStoreStaff } from '../services/api.js';
import { getTargetOwnerId } from '../utils/chatHelpers.js';
import { PATHS } from '../routes/paths.js';
import ReactMarkdown from 'react-markdown';
import { useSocket } from '../hooks/useSocket.js';

const LiveStaffChat = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket, onlineUsers } = useSocket();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('READY'); // READY, SEARCHING, CONNECTED, ENDED, NO_STAFF
    const [staffList, setStaffList] = useState([]);
    const [activeStaffId, setActiveStaffId] = useState(null);
    const [mobileView, setMobileView] = useState('LIST'); // 'LIST' or 'CHAT'

    const messagesEndRef = useRef(null);
    const timeoutRef = useRef(null);
    const userRef = useRef(null);
    const statusRef = useRef(null);
    const activeStaffIdRef = useRef(null);
    const chatsCache = useRef({}); // Cache for chat history per staffId

    // Keep refs in sync
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    useEffect(() => {
        activeStaffIdRef.current = activeStaffId;
    }, [activeStaffId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const [_tick, setTick] = useState(0);

    // Relative Time Formatter
    const formatRelativeTime = (dateString) => {
        if (!dateString) return 'Offline';
        const now = new Date();
        const past = new Date(dateString);
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 5) return 'Just now';
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        return past.toLocaleDateString();
    };

    // Update tick every 30s to refresh relative labels
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch Staff List
    useEffect(() => {
        const fetchStaff = async () => {
            const ownerId = getTargetOwnerId(user);
            if (!ownerId) return;
            try {
                const data = await getStoreStaff(ownerId);
                if (data.status === 'success') {
                    setStaffList(data.staff);
                }
            } catch (error) {
                console.error("Failed to fetch staff", error);
            }
        };

        fetchStaff();
        const interval = setInterval(fetchStaff, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user]);

    // const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Initial Load of Chat History
    useEffect(() => {
        const loadHistory = async () => {
            const ownerId = getTargetOwnerId(user);
            if (!ownerId) return;

            try {
                // Import getChatPolling dynamically or use from import
                const api = await import('../services/api.js');
                // We use 'since=0' to get all history for now, or a reasonable timeframe
                const historyData = await api.getChatPolling(0, ownerId);

                if (historyData.status === 'success' && historyData.history) {
                    historyData.history.forEach(msg => {
                        // Check if message belongs to a specific staff conversation
                        let staffId = null;

                        if (msg.role === 'staff' && msg.metadata?.staffId) {
                            staffId = msg.metadata.staffId;
                        } else if (msg.role === 'user' && msg.metadata?.staffId) {
                            staffId = msg.metadata.staffId;
                        } else if (msg.role === 'staff' && msg.staffId) {
                            staffId = msg.staffId;
                        }

                        if (staffId) {
                            const newMsg = {
                                role: msg.role,
                                content: msg.message,
                                timestamp: msg.timestamp,
                                staffId: staffId
                            };

                            const cached = chatsCache.current[staffId] || [];
                            if (!cached.some(m => m.timestamp === newMsg.timestamp && m.content === newMsg.content)) {
                                chatsCache.current[staffId] = [...cached, newMsg].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                            }
                        }
                    });

                    // Update current messages if we have an active staff conversation
                    if (activeStaffId && chatsCache.current[activeStaffId]) {
                        setMessages(chatsCache.current[activeStaffId]);
                    }
                }
            } catch (error) {
                console.error("Failed to load chat history", error);
            }
        };

        if (user) {
            loadHistory();
        }
    }, [user, activeStaffId]);

    // Socket Events
    useEffect(() => {
        if (!socket) return;

        const handleMessage = (data) => {
            // Use refs to get current values, not closure
            const currentUser = userRef.current;
            const currentStatus = statusRef.current;
            const currentActiveStaffId = activeStaffIdRef.current;

            // Check if message belongs to this store
            const ownerId = getTargetOwnerId(currentUser);
            if (data.ownerId !== ownerId && data.ownerId !== currentUser?.memberOfId) return; // Basic check

            const newMsg = {
                role: data.role,
                content: data.message,
                timestamp: data.timestamp,
                staffId: data.staffId || data.metadata?.staffId // Handle metadata
            };

            // 1. If message has a staffId (from staff reply)
            if (newMsg.staffId) {
                // Update Cache
                const cached = chatsCache.current[newMsg.staffId] || [];
                // Deduplicate
                if (!cached.some(m => m.timestamp === newMsg.timestamp && m.content === newMsg.content)) {
                    chatsCache.current[newMsg.staffId] = [...cached, newMsg];
                }

                // If visible, update state
                if (currentActiveStaffId === newMsg.staffId) {
                    setMessages(prev => {
                        if (prev.some(m => m.timestamp === newMsg.timestamp && m.content === newMsg.content)) return prev;
                        return [...prev, newMsg];
                    });
                    if (currentStatus !== 'CONNECTED') {
                        setStatus('CONNECTED');
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    }
                }
            } else {
                // 2. Message from User (us) or AI or System
                if (data.role === 'user') {
                    // For user messages, we try to guess context or just ignore if handled by optimistic update?
                    // BUT, if we receive it from socket (echo), we should update cache if not already there.
                    // IMPORTANT: We need to know which staff this message was sent to.
                    // The echo event might not have staffId if backend doesn't echo it back?
                    // Backend echo DOES include metadata now!

                    const probableStaffId = data.metadata?.staffId || currentActiveStaffId;

                    if (probableStaffId) {
                        const cached = chatsCache.current[probableStaffId] || [];
                        if (!cached.some(m => m.timestamp === newMsg.timestamp && m.content === newMsg.content)) {
                            chatsCache.current[probableStaffId] = [...cached, newMsg];
                        }

                        if (currentActiveStaffId === probableStaffId) {
                            setMessages(prev => {
                                if (prev.some(m => m.timestamp === newMsg.timestamp && m.content === newMsg.content)) return prev;
                                return [...prev, newMsg];
                            });
                        }
                    }
                }
            }
        };

        const handleChatAccepted = () => {
            setStatus('CONNECTED');
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };

        socket.on('chat_message', handleMessage);
        socket.on('chat_accepted', handleChatAccepted);

        return () => {
            socket.off('chat_message', handleMessage);
            socket.off('chat_accepted', handleChatAccepted);
        };
    }, [socket]); // Remove user and status from dependencies


    const handleStartSupport = async (targetStaffId = null, force = false) => {
        const ownerId = getTargetOwnerId(user);
        if (!ownerId) return;

        // If already connected or searching, don't re-trigger unless forced
        if (!force && status === 'CONNECTED') return;

        setStatus('SEARCHING');

        try {
            await requestStaff(ownerId, null, null, targetStaffId);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setStatus((prev) => {
                    if (prev !== 'CONNECTED') {
                        // In "Telegram" mode, maybe we don't need NO_STAFF blocker? 
                        // Just keep it as READY but maybe show a small toast.
                        return 'READY';
                    }
                    return prev;
                });
            }, 30000);

        } catch (error) {
            console.error("Failed to notify staff:", error);
            setStatus('READY');
        }
    };

    const handleStaffClick = (staffId) => {
        if (activeStaffId === staffId) return;

        // Save current messages to cache for the OLD staffId
        if (activeStaffId) {
            // Already updated via effects/handlers, but double check?
            // Actually, `messages` state is the source of truth for view.
            // We should ensure cache is sync'd. 
            // But simpler: We relied on `handleMessage` to update cache. 
            // However, `handleSend` updates `messages` optimistically. We need to sync that.
            chatsCache.current[activeStaffId] = messages;
        }

        setActiveStaffId(staffId);

        // Load from cache or empty
        const cachedMessages = chatsCache.current[staffId] || [];
        setMessages(cachedMessages);

        setStatus('READY');
        handleStartSupport(staffId, true);
        setMobileView('CHAT'); // Switch to chat view on mobile
    };

    const handleSend = async () => {
        if (!input.trim() || !activeStaffId) return;

        const msgText = input;
        setInput('');

        // Optimistic UI Update
        const optimisticMsg = {
            role: 'user',
            content: msgText,
            timestamp: new Date().toISOString(),
            staffId: activeStaffId
        };

        // Update local state (cache and visible)
        const cached = chatsCache.current[activeStaffId] || [];
        chatsCache.current[activeStaffId] = [...cached, optimisticMsg];
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const ownerId = getTargetOwnerId(user);
            if (!ownerId) {
                console.error("No ownerId found, cannot send message.");
                return;
            }
            // Or typically `sendMessage` is for AI. 
            // Wait, `sendMessage` in `api.js` calls `/chat`. 
            // `ChatService` processes it. If `isStaffCallActive`, it emits to owner.
            await sendMessage(msgText, ownerId, user?.id || undefined, undefined, undefined, undefined, undefined, { staffId: activeStaffId });
        } catch (error) {
            console.error("Send failed", error);
        }
    };

    const handleEndChat = async () => {
        if (confirm(t('common.delete_session_confirm') || "End this session?")) {
            const ownerId = getTargetOwnerId(user);
            try {
                await stopStaffSupport(ownerId, "00:00");
                // Clear messages before navigating
                setMessages([]);
                setStatus('READY');
            } catch (e) { console.error(e); }
            navigate(PATHS.CHAT_ASSISTANT);
        }
    };

    return (
        <div className="flex h-full w-full bg-[#f9fafb] overflow-hidden relative">
            {/* Sidebar - Staff List */}
            <div className={`
                ${mobileView === 'LIST' ? 'flex' : 'hidden lg:flex'} 
                w-full lg:w-80 border-r border-slate-200 bg-white flex flex-col h-full
            `}>
                <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900">Direct Support</h2>
                        <div className="flex gap-1">
                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                <Sparkles className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                <MessageSquare className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for staff"
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="py-2">
                        {staffList.length === 0 ? (
                            <p className="text-sm text-center text-slate-400 py-8">No staff members found.</p>
                        ) : (
                            staffList.map(staff => {
                                const isOnline = onlineUsers.has(staff.id);
                                const isActive = activeStaffId === staff.id;

                                return (
                                    <button
                                        key={staff.id}
                                        onClick={() => handleStaffClick(staff.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-slate-50 ${isActive ? 'bg-indigo-50/50 border-r-2 border-indigo-600' : ''}`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 ${isActive ? 'border-indigo-200' : 'border-transparent'}`}>
                                                {staff.image ? (
                                                    <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                        <User className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <p className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-900' : 'text-slate-900'}`}>{staff.name}</p>
                                                <span className="text-[10px] text-slate-400">18:05</span>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">{staff.position || staff.role || 'Staff Support'}</p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Main Chat Area (Right) */}
            <div className={`
                ${mobileView === 'CHAT' ? 'flex' : 'hidden lg:flex'} 
                flex-1 flex flex-col bg-white overflow-hidden h-full
            `}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20 shrink-0">
                    <div className="flex items-center gap-4">
                        {/* Mobile Back Button */}
                        <button
                            onClick={() => setMobileView('LIST')}
                            className="lg:hidden p-2 -ml-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        {activeStaffId ? (
                            (() => {
                                const staff = staffList.find(s => s.id === activeStaffId);
                                const isOnline = onlineUsers.has(activeStaffId);
                                return (
                                    <>
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                                                {staff?.image ? (
                                                    <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                                        <User className="w-6 h-6 text-slate-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 leading-tight">{staff?.name || 'Staff Support'}</h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-xs text-slate-500 font-medium">
                                                    {isOnline ? 'Online' : (
                                                        staff?.updatedAt
                                                            ? `Last seen ${formatRelativeTime(staff.updatedAt)}`
                                                            : 'Offline'
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                    <Headset className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Direct Live Support</h3>
                                    <span className="text-xs text-slate-500 font-medium italic">Connecting you with our local team</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all border border-transparent hover:border-slate-100">
                            <Headset className="w-5 h-5" />
                        </button>
                        <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all border border-transparent hover:border-slate-100">
                            <User className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleEndChat}
                            className="ml-2 p-2.5 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
                            title="End Session"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    <AnimatePresence mode="popLayout">
                        {messages.length === 0 ? (
                            <Motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center opacity-60"
                            >
                                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                                    <MessageSquare className="w-10 h-10 text-indigo-200" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">No messages yet</h3>
                                <p className="text-sm text-slate-500 max-w-[240px]">
                                    Start a conversation by selecting a staff member from the left or sending a direct message.
                                </p>
                            </Motion.div>
                        ) : (
                            messages.map((m, idx) => {
                                const isUser = m.role === 'user';
                                const showHeader = idx === 0 || messages[idx - 1]?.role !== m.role;
                                const staff = staffList.find(s => s.id === m.staffId);

                                return (
                                    <Motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        {/* Avatar */}
                                        <div className="w-10 h-10 shrink-0">
                                            {showHeader ? (
                                                <div className={`w-full h-full rounded-2xl overflow-hidden border shadow-sm ${isUser ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                                    {isUser ? (
                                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-bold text-sm">
                                                            {user?.name?.[0]?.toUpperCase() || 'U'}
                                                        </div>
                                                    ) : (
                                                        staff?.image ? (
                                                            <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                                                                <User className="w-5 h-5 text-indigo-400" />
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : <div className="w-10" />}
                                        </div>

                                        {/* Content */}
                                        <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                                            {showHeader && (
                                                <div className={`flex items-center gap-2 px-1 mb-0.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <span className="text-[11px] font-bold text-slate-900">
                                                        {isUser ? user?.name : (staff?.name || 'Staff')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`px-5 py-3 shadow-sm ${isUser
                                                ? 'bg-slate-800 text-white rounded-2xl rounded-tr-none'
                                                : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-none'
                                                }`}>
                                                <div className="text-sm leading-relaxed prose prose-sm prose-slate max-w-none prose-p:my-0 prose-pre:my-2 prose-pre:bg-slate-900 prose-pre:text-indigo-300">
                                                    <ReactMarkdown>{m.content}</ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    </Motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Input Section */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 transition-all focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/5 group/input">
                        <div className="flex items-end gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Write a reply..."
                                rows={1}
                                className="flex-1 bg-transparent border-none resize-none py-2 px-3 text-sm focus:ring-0 placeholder:text-slate-400 min-h-[44px] max-h-32"
                                style={{ height: 'auto' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="mb-1 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:pointer-events-none shadow-lg shadow-indigo-200"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 px-1">
                        <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">Markdown Supported</button>
                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                        <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">Encryption: End-to-End</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveStaffChat;
