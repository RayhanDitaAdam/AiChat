import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth.js';
import { SocketContext } from './SocketContext.js';

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const { user } = useAuth();

    useEffect(() => {
        const guestId = localStorage.getItem('chat_guest_id');
        if (!user && !guestId) {
            queueMicrotask(() => {
                setSocket(null);
                setIsConnected(false);
                setOnlineUsers(new Set());
            });
            return;
        }

        const getBaseUrl = () => {
            const rawUrl = import.meta.env.VITE_API_URL || 'https://panggaleh.com';
            return rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
        };
        const apiUrl = getBaseUrl();
        console.log(`[Socket] Connecting to ${apiUrl} (User: ${user?.id || 'GUEST'}, Guest: ${guestId})...`);

        const newSocket = io(apiUrl, {
            withCredentials: true,
            query: {
                userId: user?.id || '',
                guestId: guestId || ''
            },
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('[Socket] Connected!', newSocket.id);
            setIsConnected(true);

            if (user?.memberOfId) {
                newSocket.emit('join_store', user.memberOfId);
            }
        });

        newSocket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
            setIsConnected(false);
            setOnlineUsers(new Set());
        });

        newSocket.on('connect_error', (err) => {
            console.error('[Socket] Connection Error:', err.message);
        });

        newSocket.on('user_status_change', ({ userId, status }) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (status === 'online') newSet.add(userId);
                else newSet.delete(userId);
                return newSet;
            });
        });

        queueMicrotask(() => {
            setSocket(newSocket);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
