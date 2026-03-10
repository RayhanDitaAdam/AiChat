import React, { useState, useEffect, useCallback } from 'react';
import {
    loginWithGoogle as apiLoginWithGoogle,
    loginWithGitHub as apiLoginWithGitHub,
    loginWithEmail as apiLoginWithEmail,
    register as apiRegister,
    updateProfile as apiUpdateProfile,
    fetchProfile,
    fetchCsrfToken,
    login2FA as apiLogin2FA,
    resend2FA as apiResend2FA,
    verifyKeyFile as apiVerifyKeyFile,
    linkWithGoogle as apiLinkWithGoogle,
} from '../services/api.js';
import { UserContext } from './UserContext.js';
import i18n from '../i18n';

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
    const [isLoading, setIsLoading] = useState(true);

    const loginWithGoogle = useCallback(async (googleToken) => {
        setIsLoading(true);
        try {
            const data = await apiLoginWithGoogle(googleToken);

            if (data.requires2FA) {
                return data;
            }

            setUser(data.user);
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            if (data?.user?.language) {
                i18n.changeLanguage(data.user.language);
            }
            await fetchCsrfToken();
            return data;
        } catch (error) {
            console.error('Google Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loginWithGitHub = useCallback(async (code) => {
        setIsLoading(true);
        try {
            const data = await apiLoginWithGitHub(code);

            if (data.requires2FA) {
                return data;
            }

            setUser(data.user);
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            if (data?.user?.language) {
                i18n.changeLanguage(data.user.language);
            }
            await fetchCsrfToken();
            return data;
        } catch (error) {
            console.error('GitHub Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const data = await apiLoginWithEmail(email, password);

            if (data.requires2FA || data.status === 'requires_key_file') {
                return data;
            }

            setUser(data.user);
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            if (data?.user?.language) {
                i18n.changeLanguage(data.user.language);
            }
            await fetchCsrfToken();
            return data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login2FA = useCallback(async (userId, otpToken) => {
        setIsLoading(true);
        try {
            const data = await apiLogin2FA(userId, otpToken);
            setUser(data.user);
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            if (data.user.language) {
                i18n.changeLanguage(data.user.language);
            }
            await fetchCsrfToken();
            return data;
        } catch (error) {
            console.error('2FA Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verifyKeyFile = useCallback(async (userId, keyContent) => {
        setIsLoading(true);
        try {
            const data = await apiVerifyKeyFile(userId, keyContent);
            setUser(data.user);
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            if (data.user?.language) {
                i18n.changeLanguage(data.user.language);
            }
            await fetchCsrfToken();
            return data;
        } catch (error) {
            console.error('Key File Verification failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const resend2FA = useCallback(async (userId) => {
        try {
            const data = await apiResend2FA(userId);
            return data;
        } catch (error) {
            console.error('Resend 2FA failed:', error);
            throw error;
        }
    }, []);



    const register = useCallback(async (formData) => {
        setIsLoading(true);
        try {
            const data = await apiRegister(formData);
            if (!data.requiresVerification) {
                setUser(data.user);
                setToken(data.token);
                setRefreshToken(data.refreshToken);
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                if (data.user.language) {
                    i18n.changeLanguage(data.user.language);
                }
                await fetchCsrfToken();
            }
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
            i18n.changeLanguage(newLang);
            return data;
        } catch (error) {
            console.error('Update language failed:', error);
            throw error;
        }
    }, [user]);

    const finalizeLogin = useCallback(async (data) => {
        setIsLoading(true);
        try {
            setUser(data.user);
            setToken(data.token);
            setRefreshToken(data.refreshToken);
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            if (data.user?.language) {
                i18n.changeLanguage(data.user.language);
            }
            await fetchCsrfToken();
            return data;
        } catch (error) {
            console.error('Finalize Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const linkWithGoogle = useCallback(async (googleToken) => {
        setIsLoading(true);
        try {
            const data = await apiLinkWithGoogle(googleToken);
            setUser(prev => ({ ...prev, ...data.user })); // Update user with linked account info
            return data;
        } catch (error) {
            console.error('Link with Google failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch profile on initial load
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    console.log('[UserContext] Initializing auth, fetching profile...');
                    const data = await fetchProfile();
                    console.log('[UserContext] Profile fetched for:', data.user.email);
                    setUser(data.user);
                    if (data.user.language) {
                        i18n.changeLanguage(data.user.language);
                    }
                } catch (err) {
                    console.error('[UserContext] Session init failed:', err.response?.data?.message || err.message);
                    logout();
                }
            } else {
                console.log('[UserContext] No token found, skipping profile fetch.');
            }
            setIsLoading(false);
        };
        initAuth();
    }, [token, logout]);

    return (
        <UserContext.Provider value={{
            user, setUser, token, refreshToken, isLoading,
            login, login2FA, resend2FA, verifyKeyFile, loginWithGoogle, loginWithGitHub,
            register, logout, updateLanguage, finalizeLogin, linkWithGoogle
        }}>
            {children}
        </UserContext.Provider>
    );
};
