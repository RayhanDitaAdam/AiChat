import React, { useState, useEffect } from 'react';
import { getMe, login as loginApi } from '../services/api';
import { AuthContext } from './AuthContext.js';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('aipos_token');
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await getMe();
                if (res.status === 'success') {
                    setUser(res.data.user);
                }
            } catch {
                localStorage.removeItem('aipos_token');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await loginApi({ email, password });
            if (res.status === 'success') {
                localStorage.setItem('aipos_token', res.data.token);
                setUser(res.data.user);
                return { success: true };
            }
        } catch (err) {
            return { success: false, message: err.message || 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('aipos_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
