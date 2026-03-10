import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import axios from 'axios';
import { SSEContext } from './SSEContext.js';

export const SSEProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [clientId, setClientId] = useState(null);
    const { user } = useAuth();
    const eventSourceRef = useRef(null);
    const listenersRef = useRef({});

    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000';

    const subscribe = useCallback((event, callback) => {
        if (!listenersRef.current[event]) {
            listenersRef.current[event] = new Set();
        }
        listenersRef.current[event].add(callback);
        return () => listenersRef.current[event].delete(callback);
    }, []);

    const joinRoom = useCallback(async (roomName) => {
        if (!clientId) return;
        try {
            await axios.post(`${apiUrl}/api/join-room`, { clientId, roomName }, { withCredentials: true });
            console.log(`[SSE] Joined room: ${roomName}`);
        } catch (error) {
            console.error(`[SSE] Failed to join room ${roomName}:`, error);
        }
    }, [clientId, apiUrl]);

    useEffect(() => {
        const guestId = localStorage.getItem('chat_guest_id');
        if (!user && !guestId) {
            queueMicrotask(() => {
                setIsConnected(false);
                setOnlineUsers(new Set());
            });
            return;
        }

        console.log(`[SSE] Connecting to ${apiUrl}/api/events...`);

        const url = new URL(`${apiUrl}/api/events`);
        if (user?.id) url.searchParams.append('userId', user.id);
        if (guestId) url.searchParams.append('guestId', guestId);

        const es = new EventSource(url.toString(), { withCredentials: true });
        eventSourceRef.current = es;

        es.onopen = () => {
            console.log('[SSE] Connected!');
            setIsConnected(true);
        };

        es.onerror = (err) => {
            console.error('[SSE] Connection Error:', err);
            setIsConnected(false);
            // EventSource automatically reconnects
        };

        es.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);

                // Handle internal "connected" event to get clientId
                if (data.status === 'connected') {
                    setClientId(data.clientId);
                    return;
                }

                const { event, data: eventData } = data;

                // Handle user status changes (presence)
                if (event === 'user_status_change') {
                    setOnlineUsers(prev => {
                        const newSet = new Set(prev);
                        if (eventData.status === 'online') newSet.add(eventData.userId);
                        else newSet.delete(eventData.userId);
                        return newSet;
                    });
                }

                // Notify listeners
                if (listenersRef.current[event]) {
                    listenersRef.current[event].forEach(cb => cb(eventData));
                }
            } catch (err) {
                console.error('[SSE] Failed to parse message:', err);
            }
        };

        return () => {
            es.close();
        };
    }, [user, apiUrl]);

    // Automatically join member store room
    useEffect(() => {
        if (isConnected && clientId && user?.memberOfId) {
            joinRoom(`store_${user.memberOfId}`);
        }
    }, [isConnected, clientId, user, joinRoom]);

    return (
        <SSEContext.Provider value={{ isConnected, onlineUsers, clientId, subscribe, joinRoom }}>
            {children}
        </SSEContext.Provider>
    );
};
