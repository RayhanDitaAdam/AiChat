import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MessageSquare, Trash2, Plus, Search } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../context/ChatContext.js';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { id, enUS } from 'date-fns/locale';

const ChatHistoryDrawer = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const { sessions, currentSessionId, selectSession, deleteSession, startNewChat } = useChat();

    // Group sessions by date
    const groupedSessions = useMemo(() => {
        if (!sessions) return {};

        const groups = {
            today: [],
            yesterday: [],
            thisWeek: [],
            thisMonth: [],
            older: []
        };

        sessions.forEach(session => {
            const date = new Date(session.updatedAt || session.createdAt);
            if (isToday(date)) {
                groups.today.push(session);
            } else if (isYesterday(date)) {
                groups.yesterday.push(session);
            } else if (isThisWeek(date)) {
                groups.thisWeek.push(session);
            } else if (isThisMonth(date)) {
                groups.thisMonth.push(session);
            } else {
                groups.older.push(session);
            }
        });

        return groups;
    }, [sessions]);

    const handleSelectSession = (sessionId) => {
        selectSession(sessionId);
        onClose();
    };

    const handleDeleteSession = (e, sessionId) => {
        e.stopPropagation();
        if (window.confirm(t('common.confirm_delete_chat'))) {
            deleteSession(sessionId);
        }
    };

    const handleNewChat = async () => {
        await startNewChat();
        onClose();
    };

    const dateLocale = i18n.language === 'id' ? id : enUS;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <Motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl border-l border-zinc-100 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
                            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">{t('common.chat_history')}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search & New Chat */}
                        <div className="p-4 space-y-3 shrink-0">
                            <button
                                onClick={handleNewChat}
                                className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-zinc-200"
                            >
                                <Plus className="w-4 h-4" />
                                {t('common.new_chat')}
                            </button>

                            {/* Search Placeholder - Functional in future */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder={t('common.search_chats')}
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border-none rounded-xl text-sm font-medium text-zinc-700 focus:ring-2 focus:ring-indigo-100 placeholder:text-zinc-400"
                                />
                            </div>
                        </div>

                        {/* Session List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-6">
                            {Object.entries(groupedSessions).map(([key, group]) => {
                                if (group.length === 0) return null;

                                let label = '';
                                switch (key) {
                                    case 'today': label = t('common.today'); break;
                                    case 'yesterday': label = t('common.yesterday'); break;
                                    case 'thisWeek': label = t('common.this_week'); break;
                                    case 'thisMonth': label = t('common.this_month'); break;
                                    case 'older': label = t('common.older'); break;
                                    default: label = key;
                                }

                                return (
                                    <div key={key}>
                                        <h3 className="px-3 mb-2 text-xs font-bold text-zinc-400 uppercase tracking-widest sticky top-0 bg-white/90 backdrop-blur-sm py-1 z-10">
                                            {label}
                                        </h3>
                                        <div className="space-y-1">
                                            {group.map(session => (
                                                <button
                                                    key={session.id}
                                                    onClick={() => handleSelectSession(session.id)}
                                                    className={`w-full p-3 rounded-xl flex items-start text-left gap-3 transition-all group ${currentSessionId === session.id
                                                        ? 'bg-indigo-50 text-indigo-900'
                                                        : 'hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900'
                                                        }`}
                                                >
                                                    <MessageSquare className={`w-4 h-4 mt-0.5 shrink-0 ${currentSessionId === session.id ? 'text-indigo-600' : 'text-zinc-300 group-hover:text-zinc-500'
                                                        }`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${currentSessionId === session.id ? 'font-bold' : ''
                                                            }`}>
                                                            {session.title || t('common.untitled_chat')}
                                                        </p>
                                                        <p className="text-[10px] opacity-60 font-medium truncate mt-0.5">
                                                            {format(new Date(session.updatedAt || session.createdAt), 'HH:mm', { locale: dateLocale })}
                                                        </p>
                                                    </div>
                                                    {currentSessionId === session.id && (
                                                        <div
                                                            onClick={(e) => handleDeleteSession(e, session.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-100 hover:text-rose-500 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {sessions.length === 0 && (
                                <div className="text-center py-10 opacity-50">
                                    <p className="text-sm font-medium">{t('common.no_history')}</p>
                                </div>
                            )}
                        </div>
                    </Motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChatHistoryDrawer;
