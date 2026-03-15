import React, { useState, useEffect, useCallback } from 'react';
import {
    getChatSessions, createChatSession, getSessionMessages,
    sendMessage as sendMessageApi, deleteChatSession, clearChatHistory,
    toggleSessionPin as apiTogglePin
} from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { ChatContext } from './ChatContext.js';
import { getTargetOwnerId } from '../utils/chatHelpers.js';
import { useSocket } from '../hooks/useSocket.js';
import { useTranslation } from 'react-i18next';

export const ChatProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatMode, setChatMode] = useState('SHOP'); // 'SHOP' or 'GENERAL'
    const [isLoading, setIsLoading] = useState(false);
    const [isSessionsLoading, setIsSessionsLoading] = useState(false);
    const { socket } = useSocket();
    const { i18n } = useTranslation();

    const fetchSessions = useCallback(async (excludeStaffChats = false) => {
        if (!isAuthenticated) return;
        const ownerId = getTargetOwnerId(user);
        setIsSessionsLoading(true);
        try {
            const res = await getChatSessions(ownerId, excludeStaffChats);
            if (res.status === 'success') {
                setSessions(res.data);
                // ONLY select if no current session OR if current session isn't in the new list (stale)
                const currentExists = res.data.some(s => s.id === currentSessionId);
                if (res.data.length > 0 && (!currentSessionId || !currentExists)) {
                    selectSession(res.data[0].id, excludeStaffChats);
                }
            }
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        } finally {
            setIsSessionsLoading(false);
        }
    }, [isAuthenticated, user, currentSessionId]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const selectSession = async (sessionId, excludeStaffChats = false) => {
        setCurrentSessionId(sessionId);
        setIsLoading(true);
        try {
            const res = await getSessionMessages(sessionId, excludeStaffChats);
            if (res.status === 'success') {
                setMessages(res.history.map(m => ({
                    id: m.id, // Include ID
                    role: m.role,
                    content: m.message,
                    status: m.status,
                    timestamp: m.timestamp,
                    products: m.metadata?.products || [],
                    nearbyStores: m.metadata?.nearbyStores || [],
                    userLocation: m.metadata?.userLocation || null,
                    autoAdded: m.metadata?.autoAdded || null,
                    reminderAdded: m.metadata?.reminderAdded || null
                })));
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = async () => {
        const ownerId = getTargetOwnerId(user);
        setIsLoading(true);
        try {
            const res = await createChatSession(ownerId);
            if (res.status === 'success') {
                setSessions(prev => [res.data, ...prev]);
                setCurrentSessionId(res.data.id);
                setMessages([]);
                return res.data;
            }
        } catch (err) {
            console.error('Failed to create session:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Listen for AI streaming chunks
    useEffect(() => {
        if (!socket) return;

        const handleAiChunk = (data) => {
            const { sessionId, chunk } = data;
            if (sessionId && currentSessionId && sessionId !== currentSessionId) return;

            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.role === 'ai' && !lastMsg.isComplete) {
                    // Safety: If chunk is already the full message or identical to current content, skip
                    if (lastMsg.content === chunk) return prev;

                    // Specific fix for rule-based intents that send the full string as a single chunk:
                    // If content is just the placeholder, REPLACE it.
                    // If content already has data and chunk starts with the same tag, it's likely a duplicate broadcast.
                    const isNewResponse = chunk.startsWith('[SOP]') || chunk.startsWith('[FOUND]') || chunk.startsWith('[NOT_FOUND]') || chunk.startsWith('[GENERAL]');
                    const alreadyHasData = lastMsg.content !== '...';

                    if (alreadyHasData && isNewResponse && lastMsg.content.includes(chunk.substring(0, 10))) {
                        // Likely a duplicate chunk of the full message
                        return prev;
                    }

                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                        ...lastMsg,
                        content: (lastMsg.content === '...' ? '' : lastMsg.content) + chunk
                    };
                    return newMessages;
                }

                // Start a new AI message if we don't have one to append to
                const newAiMsg = {
                    id: `ai_${sessionId || Date.now()}`,
                    role: 'ai',
                    content: chunk,
                    isComplete: false,
                    timestamp: new Date().toISOString()
                };
                return [...prev, newAiMsg];
            });
        };

        socket.on('ai_chunk', handleAiChunk);
        return () => socket.off('ai_chunk', handleAiChunk);
    }, [socket, currentSessionId]);

    const sendMessage = useCallback(async (input, isBackground = false, latitude = null, longitude = null, guestOwnerId = null, overrideLanguage = null) => {
        if (!input.trim() || isLoading) return;
        const userMessage = input.trim();
        const targetOwnerId = guestOwnerId || getTargetOwnerId(user);

        if (!targetOwnerId) {
            console.error('No owner ID provided for chat');
            return;
        }

        const optimisticId = `user_opt_${Date.now()}`;
        if (!isBackground) {
            setMessages(prev => [
                ...prev,
                {
                    id: optimisticId,
                    role: 'user',
                    content: userMessage,
                    timestamp: new Date().toISOString(),
                    isOptimistic: true
                }
            ]);
            setIsLoading(true);
        }

        try {
            // guestId persistence
            let guestId = localStorage.getItem('chat_guest_id');
            if (!guestId) {
                guestId = `guest_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('chat_guest_id', guestId);
            }

            const startTime = Date.now();
            const data = await sendMessageApi(
                userMessage,
                targetOwnerId,
                user?.id || null,
                currentSessionId,
                latitude,
                longitude,
                user?.id ? null : guestId,
                undefined,
                overrideLanguage || i18n.language,
                isBackground,
                chatMode === 'GENERAL'
            );

            console.log('[ChatContext] SendMessage Success:', data);

            if (isBackground) {
                return data; // Exit early for background messages
            }

            const aiMessage = {
                id: data.id,
                role: 'ai',
                content: data.message,
                status: data.status,
                timestamp: data.timestamp || new Date().toISOString(),
                products: data.metadata?.products || [],
                nearbyStores: data.metadata?.nearbyStores || [],
                userLocation: data.metadata?.userLocation || null,
                limitReached: data.limitReached,
                autoAdded: data.metadata?.autoAdded || null,
                reminderAdded: data.metadata?.reminderAdded || null,
                isFresh: true,
                isComplete: true
            };

            // Calculate remaining delay to achieve at least 2 seconds total (1s backend + 1s frontend)
            const elapsed = Date.now() - startTime;
            const remainingDelay = Math.max(0, 2000 - elapsed);

            if (remainingDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingDelay));
            }

            setMessages(prev => {
                const newMessages = [...prev];

                // 1. Find and replace/remove the optimistic user message
                const optIndex = newMessages.findIndex(m => m.id === optimisticId);
                const definitiveUser = {
                    id: data.userChatId || `user_${Date.now()}`,
                    role: 'user',
                    content: userMessage,
                    timestamp: data.userTimestamp || new Date().toISOString()
                };

                if (optIndex !== -1) {
                    newMessages[optIndex] = definitiveUser;
                } else {
                    newMessages.push(definitiveUser);
                }

                // 2. Find and replace/add the AI message
                // Priority 1: Match by ID from data
                let aiIndex = newMessages.findIndex(m => m.id === data.id);

                // Priority 2: Match by session-based ID
                if (aiIndex === -1 && data.id) {
                    aiIndex = newMessages.findIndex(m => m.id === `ai_${data.sessionId}`);
                }

                // Priority 3: Match the LAST incomplete AI message (most reliable for streaming)
                if (aiIndex === -1) {
                    aiIndex = newMessages.findLastIndex(m => m.role === 'ai' && !m.isComplete);
                }

                if (aiIndex !== -1) {
                    console.log('[ChatContext] Replacing AI message at index:', aiIndex);
                    newMessages[aiIndex] = aiMessage;
                } else {
                    console.log('[ChatContext] Appending new AI message');
                    newMessages.push(aiMessage);
                }

                return newMessages;
            });

            if (!currentSessionId || sessions.find(s => s.id === currentSessionId)?.title === 'New Chat') {
                if (!currentSessionId) setCurrentSessionId(data.sessionId);
                // REMOVED: fetchSessions() to avoid race condition. sessions state will update naturally or via switch.
            }
            return data;
        } catch (error) {
            console.error('Send error:', error);
            if (!isBackground) {
                setMessages(prev => {
                    const filtered = prev.filter(m => !(!m.isComplete && m.role === 'ai'));
                    return [...filtered, {
                        role: 'ai',
                        content: 'Maaf, lagi ada gangguan teknis bre. Coba lagi ya!',
                        status: 'ERROR'
                    }];
                });
            }
            error.processedByContext = true;
            throw error;
        } finally {
            if (!isBackground) {
                setIsLoading(false);
            }
        }
    }, [user, isAuthenticated, isLoading, currentSessionId, fetchSessions, sessions, i18n.language, chatMode]);

    const deleteSession = async (sessionId) => {
        try {
            await deleteChatSession(sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (currentSessionId === sessionId) {
                setCurrentSessionId(null);
                setMessages([]);
            }
        } catch (err) {
            console.error('Failed to delete session:', err);
        }
    };

    const clearHistory = async () => {
        const ownerId = getTargetOwnerId(user);
        try {
            await clearChatHistory(ownerId);
            setSessions([]);
            setCurrentSessionId(null);
            setMessages([]);
        } catch (err) {
            console.error('Failed to clear history:', err);
        }
    };

    const togglePin = async (sessionId) => {
        try {
            const res = await apiTogglePin(sessionId);
            if (res.status === 'success') {
                setSessions(prev =>
                    prev.map(s => s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s)
                );
            }
        } catch (err) {
            console.error('Failed to toggle pin:', err);
        }
    };

    return (
        <ChatContext.Provider value={{
            sessions,
            currentSessionId,
            messages,
            setMessages,
            isLoading,
            setIsLoading,
            isSessionsLoading,
            fetchSessions,
            selectSession,
            startNewChat,
            sendMessage,
            chatMode,
            setChatMode,
            deleteSession,
            clearHistory,
            togglePin,
            getTargetOwnerId: () => getTargetOwnerId(user)
        }}>
            {children}
        </ChatContext.Provider>
    );
};

