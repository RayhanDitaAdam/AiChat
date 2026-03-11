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
                if (res.data.length > 0 && !currentSessionId) {
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
                    // Update the last "thinking" message with the new chunk
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                        ...lastMsg,
                        content: (lastMsg.content === '...' ? '' : lastMsg.content) + chunk
                    };
                    return newMessages;
                }
                return prev;
            });
        };

        socket.on('ai_chunk', handleAiChunk);
        return () => socket.off('ai_chunk', handleAiChunk);
    }, [socket, currentSessionId]);

    const sendMessage = useCallback(async (input, isBackground = false, latitude = null, longitude = null, guestOwnerId = null) => {
        if (!input.trim() || isLoading) return;
        const userMessage = input.trim();
        const targetOwnerId = guestOwnerId || getTargetOwnerId(user);

        if (!targetOwnerId) {
            console.error('No owner ID provided for chat');
            return;
        }

        if (!isBackground) {
            const optimisticId = `opt_${Date.now()}`;
            setMessages(prev => [...prev, {
                id: optimisticId,
                role: 'user',
                content: userMessage,
                timestamp: new Date().toISOString(),
                isOptimistic: true
            }]);
            // Add a placeholder for AI response
            setMessages(prev => [...prev, {
                id: `ai_${optimisticId}`,
                role: 'ai',
                content: '...',
                isComplete: false,
                timestamp: new Date().toISOString()
            }]);
            setIsLoading(true);
        }

        try {
            // guestId persistence
            let guestId = localStorage.getItem('chat_guest_id');
            if (!guestId) {
                guestId = `guest_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('chat_guest_id', guestId);
            }

            const data = await sendMessageApi(
                userMessage,
                targetOwnerId,
                user?.id || null,
                currentSessionId,
                latitude,
                longitude,
                user?.id ? null : guestId,
                undefined,
                i18n.language
            );

            const aiMessage = {
                id: data.id,
                role: 'ai',
                content: data.message,
                status: data.status,
                timestamp: data.timestamp || new Date().toISOString(),
                products: data.products || [],
                nearbyStores: data.nearbyStores || [],
                userLocation: data.userLocation || null,
                limitReached: data.limitReached,
                autoAdded: data.autoAdded || null,
                reminderAdded: data.reminderAdded || null,
                isFresh: true,
                isComplete: true
            };

            setMessages(prev => {
                // Filter out optimistic/thinking messages and any duplicates by ID
                const filtered = prev.filter(m =>
                    !(!m.isComplete && m.role === 'ai') &&
                    !(m.isOptimistic && m.content === userMessage) &&
                    !(m.id === data.id)
                );

                // Add the confirmed user message if it doesn't exist in filtered yet (via SSE)
                const hasUserMessage = filtered.some(m => m.id === data.userChatId || (m.role === 'user' && m.content === userMessage));
                if (!hasUserMessage) {
                    const aiTime = new Date(aiMessage.timestamp);
                    const userTime = new Date(aiTime.getTime() - 1); // Ensure user message is exactly 1ms older so it sorts first
                    filtered.push({
                        id: data.userChatId || `user_${Date.now()}`,
                        role: 'user',
                        content: userMessage,
                        timestamp: userTime.toISOString()
                    });
                }

                return [...filtered, aiMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            });

            if (!currentSessionId || sessions.find(s => s.id === currentSessionId)?.title === 'New Chat') {
                if (!currentSessionId) setCurrentSessionId(data.sessionId);
                if (isAuthenticated) fetchSessions();
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
            throw error;
        } finally {
            if (!isBackground) {
                setIsLoading(false);
            }
        }
    }, [user, isAuthenticated, isLoading, currentSessionId, fetchSessions, sessions, i18n.language]);

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
            deleteSession,
            clearHistory,
            togglePin,
            getTargetOwnerId: () => getTargetOwnerId(user)
        }}>
            {children}
        </ChatContext.Provider>
    );
};

