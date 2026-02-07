import React, { useState, useEffect, useCallback } from 'react';
import {
    getChatSessions, createChatSession, getSessionMessages,
    sendMessage as sendMessageApi, deleteChatSession, clearChatHistory
} from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { ChatContext } from './ChatContext.js';
import { getTargetOwnerId } from '../utils/chatHelpers.js';

export const ChatProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSessionsLoading, setIsSessionsLoading] = useState(false);

    const fetchSessions = useCallback(async () => {
        if (!isAuthenticated) return;
        const ownerId = getTargetOwnerId(user);
        setIsSessionsLoading(true);
        try {
            const res = await getChatSessions(ownerId);
            if (res.status === 'success') {
                setSessions(res.data);
                if (res.data.length > 0 && !currentSessionId) {
                    selectSession(res.data[0].id);
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

    const selectSession = async (sessionId) => {
        setCurrentSessionId(sessionId);
        setIsLoading(true);
        try {
            const res = await getSessionMessages(sessionId);
            if (res.status === 'success') {
                setMessages(res.history.map(m => ({
                    role: m.role,
                    content: m.message,
                    status: m.status,
                    timestamp: m.timestamp,
                    products: m.metadata?.products || [],
                    nearbyStores: m.metadata?.nearbyStores || [],
                    userLocation: m.metadata?.userLocation || null
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

    const sendMessage = useCallback(async (input, isBackground = false, latitude = null, longitude = null, guestOwnerId = null) => {
        if (!input.trim() || isLoading) return;
        const userMessage = input.trim();
        const targetOwnerId = guestOwnerId || getTargetOwnerId(user);

        if (!targetOwnerId) {
            console.error('No owner ID provided for chat');
            return;
        }

        if (!isBackground) {
            setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
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
                user?.id ? null : guestId
            );

            const aiMessage = {
                role: 'ai',
                content: data.message,
                status: data.status,
                timestamp: new Date().toISOString(),
                products: data.products || [],
                nearbyStores: data.nearbyStores || [],
                userLocation: data.userLocation || null,
                limitReached: data.limitReached
            };

            setMessages(prev => [...prev, aiMessage]);

            if (!currentSessionId || sessions.find(s => s.id === currentSessionId)?.title === 'New Chat') {
                if (!currentSessionId) setCurrentSessionId(data.sessionId);
                if (isAuthenticated) fetchSessions();
            }
            return data;
        } catch (error) {
            console.error('Send error:', error);
            if (!isBackground) {
                setMessages(prev => [...prev, {
                    role: 'ai',
                    content: 'Maaf, lagi ada gangguan teknis bre. Coba lagi ya!',
                    status: 'ERROR'
                }]);
            }
            throw error;
        } finally {
            if (!isBackground) {
                setIsLoading(false);
            }
        }
    }, [user, isAuthenticated, isLoading, currentSessionId, fetchSessions, sessions]);

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
            getTargetOwnerId: () => getTargetOwnerId(user)
        }}>
            {children}
        </ChatContext.Provider>
    );
};

