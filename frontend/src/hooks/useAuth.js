import { useUser } from '../context/useUser.js';

export const useAuth = () => {
    const {
        user, setUser, login, login2FA, resend2FA, verifyKeyFile,
        loginWithGoogle, loginWithGitHub, register, logout, isLoading, linkWithGoogle
    } = useUser();

    // Debug: check if register exists
    console.log('useAuth register:', !!register);

    const isOwner = user?.role === 'OWNER';
    const isUser = user?.role === 'USER';

    return {
        user,
        setUser,
        login,
        login2FA,
        resend2FA,
        verifyKeyFile,
        loginWithGoogle,
        loginWithGitHub,
        linkWithGoogle,
        register,
        logout,
        isLoading,
        isOwner,
        isUser,
        isAuthenticated: !!user
    };
};
