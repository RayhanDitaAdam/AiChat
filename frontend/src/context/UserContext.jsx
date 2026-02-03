import React, { useState, useEffect, useCallback } from 'react';
import { loginWithGoogle as apiLoginWithGoogle, loginWithEmail as apiLoginWithEmail, register as apiRegister, updateProfile as apiUpdateProfile, fetchProfile } from '../services/api.js';
import { UserContext } from './UserContext.js';

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
    const [isLoading, setIsLoading] = useState(true);

    const loginWithGoogle = useCallback(async (googleToken) => {
        setIsLoading(true);
        try {
            const data = await apiLoginWithGoogle(googleToken);
            setUser(data.user);
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            return data;
        } catch (error) {
            console.error('Google Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const data = await apiLoginWithEmail(email, password);
            setUser(data.user);
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (formData) => {
        setIsLoading(true);
        try {
            const data = await apiRegister(formData);
            setUser(data.user);
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            return data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    }, []);

    const updateLanguage = useCallback(async (newLang) => {
        if (!user) return;
        try {
            const data = await apiUpdateProfile({ language: newLang });
            setUser(prev => ({ ...prev, language: newLang }));
            return data;
        } catch (error) {
            console.error('Update language failed:', error);
            throw error;
        }
    }, [user]);

    // Fetch profile on initial load
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const data = await fetchProfile();
                    setUser(data.user);
                } catch (err) {
                    console.error('Session expired:', err);
                    logout();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, [token, logout]);

    return (
        <UserContext.Provider value={{ user, setUser, token, refreshToken, isLoading, login, loginWithGoogle, register, logout, updateLanguage }}>
            {children}
        </UserContext.Provider>
    );
};
