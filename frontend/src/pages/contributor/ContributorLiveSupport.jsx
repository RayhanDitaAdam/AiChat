import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getLiveSupportSessions, respondToLiveChat, getOwnerLiveChatHistory } from '../../services/api.js';
import { User, Send, MessageSquare, Loader2, Search, ChevronLeft, X } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket.js';
import ReactMarkdown from 'react-markdown';

const ContributorLiveSupport = () => {
    const [sessions, setSessions] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileView, setMobileView] = useState('LIST'); // 'LIST' or 'CHAT'
    const messagesEndRef = useRef(null);
    const pollingRef = useRef(null);
    const activeUserRef = useRef(null);
    const messagesRef = useRef([]);

    useEffect(() => { activeUserRef.current = activeUser; }, [activeUser]);
    useEffect(() => { messagesRef.current = messages; }, [messages]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);

    const fetchSessions = useCallback(async () => {
        try {
            const data = await getLiveSupportSessions();
            if (data.status === 'success') setSessions(data.sessions || []);
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
            const userId = data.user_id || data.userId || (data.user?.id);
            if (currentActiveUser && userId === currentActiveUser.id) {
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, { id: data.id, role: data.role || 'user', content: data.message, timestamp: data.timestamp }];
                });
            } else {
                fetchSessions();
            }
        };
        socket.on('staff_message', handleNewMessage);
        return () => socket.off('staff_message', handleNewMessage);
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
                    if (data.status === 'success' && data.chats.length > 0 && activeUserRef.current?.id === currentUserId) {
                        setMessages(prev => {
                            const newMessages = data.chats.filter(m => !prev.some(pm => pm.id === m.id));
                            if (newMessages.length === 0) return prev;
                            return [...prev, ...newMessages.map(m => ({ id: m.id, role: m.role, content: m.message, timestamp: m.timestamp }))];
                        });
                    }
                } catch (err) { console.warn('Polling error:', err); }
            }, 5000);
        }
        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, [activeUser]);

    const handleSelectUser = async (session) => {
        if (!session.user) return;
        setMessages([]);
        messagesRef.current = [];
        setActiveUser({ ...session.user, callStatus: session.status });
        setMobileView('CHAT');
        try {
            const data = await getOwnerLiveChatHistory(session.user.id);
            if (data.status === 'success' && activeUserRef.current?.id === session.user.id) {
                setMessages(data.chats.map(m => ({ id: m.id, role: m.role, content: m.message, timestamp: m.timestamp })));
            }
        } catch (err) { console.error('Failed to fetch user history', err); }
    };

    const handleSend = async () => {
        if (!input.trim() || !activeUser || isSending) return;
        const responseMsg = input.trim();
        setInput('');
        setIsSending(true);
        try {
            const data = await respondToLiveChat(activeUser.id, responseMsg);
            if (data.status === 'success') {
                setMessages(prev => [...prev, { role: 'staff', content: responseMsg, timestamp: new Date().toISOString() }]);
            }
        } catch {
            alert('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const filteredSessions = sessions.filter(s =>
        s.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-full w-full bg-[#f9fafb] overflow-hidden relative">
            {/* Sidebar - User List */}
            <div className={`
                ${mobileView === 'LIST' ? 'flex' : 'hidden lg:flex'}
                w-full lg:w-80 border-r border-slate-200 bg-white flex-col h-full
            `}>
                <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900">Live Support</h2>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                            {sessions.length} Active
                        </span>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="py-2">
                        {filteredSessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                                <MessageSquare className="w-10 h-10 text-slate-300 mb-4" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">No active inquiries</p>
                            </div>
                        ) : (
                            filteredSessions.map((s) => {
                                if (!s.user) return null;
                                const isActive = activeUser?.id === s.user.id;
                                return (
                                    <button
                                        key={s.user.id}
                                        onClick={() => handleSelectUser(s)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-slate-50 ${isActive ? 'bg-emerald-50/60 border-r-2 border-emerald-600' : ''}`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 overflow-hidden ${isActive ? 'border-emerald-200 bg-emerald-600 text-white' : 'border-transparent bg-slate-100 text-slate-500'}`}>
                                                <span className="text-sm font-bold">{s.user?.name?.[0]?.toUpperCase()}</span>
                                            </div>
                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500" />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <p className={`text-sm font-semibold truncate ${isActive ? 'text-emerald-900' : 'text-slate-900'}`}>{s.user?.name}</p>
                                                {s.timestamp && (
                                                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                                        {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">{s.message || 'Waiting for response...'}</p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`
                ${mobileView === 'CHAT' ? 'flex' : 'hidden lg:flex'}
                flex-1 flex-col bg-white overflow-hidden h-full
            `}>
                {activeUser ? (
                    <>
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20 shrink-0">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setMobileView('LIST')}
                                    className="lg:hidden p-2 -ml-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm border border-emerald-200 shadow-sm shadow-emerald-100">
                                        {activeUser.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white bg-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 leading-tight">{activeUser.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-xs text-emerald-600 font-medium">Active participant</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { setActiveUser(null); setMessages([]); setMobileView('LIST'); }}
                                className="p-2.5 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                            <AnimatePresence mode="popLayout">
                                {messages.length === 0 ? (
                                    <Motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center opacity-60"
                                    >
                                        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                                            <MessageSquare className="w-10 h-10 text-emerald-200" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">No messages yet</h3>
                                        <p className="text-sm text-slate-500 max-w-[240px]">
                                            Messages from this user will appear here.
                                        </p>
                                    </Motion.div>
                                ) : (
                                    messages.map((m, idx) => {
                                        const isStaff = m.role === 'staff' || m.role === 'OWNER' || m.role === 'CONTRIBUTOR';
                                        const showHeader = idx === 0 || messages[idx - 1]?.role !== m.role;
                                        return (
                                            <Motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex gap-3 ${isStaff ? 'flex-row-reverse' : 'flex-row'}`}
                                            >
                                                {/* Avatar */}
                                                <div className="w-10 h-10 shrink-0">
                                                    {showHeader ? (
                                                        <div className={`w-full h-full rounded-2xl overflow-hidden border shadow-sm flex items-center justify-center font-bold text-sm ${isStaff ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>
                                                            {isStaff ? 'Me' : activeUser.name?.[0]?.toUpperCase()}
                                                        </div>
                                                    ) : <div className="w-10" />}
                                                </div>

                                                {/* Content */}
                                                <div className={`flex flex-col gap-1 max-w-[75%] ${isStaff ? 'items-end' : 'items-start'}`}>
                                                    {showHeader && (
                                                        <div className={`flex items-center gap-2 px-1 mb-0.5 ${isStaff ? 'flex-row-reverse' : 'flex-row'}`}>
                                                            <span className="text-[11px] font-bold text-slate-900">
                                                                {isStaff ? 'You (Staff)' : activeUser.name}
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
                                                        <div className="text-sm leading-relaxed prose prose-sm prose-slate max-w-none prose-p:my-0">
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

                        {/* Input */}
                        <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0">
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 transition-all focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/5">
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
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={isSending || !input.trim()}
                                        className="mb-1 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-emerald-200"
                                    >
                                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-40">
                        <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
                            <MessageSquare className="w-12 h-12 text-slate-300" strokeWidth={1} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Live Support</h3>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest max-w-xs">
                            Select a user from the list to start responding.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContributorLiveSupport;
