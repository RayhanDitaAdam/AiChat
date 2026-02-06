import { useUser } from '../context/useUser.js';

export const useAuth = () => {
    const { user, setUser, login, loginWithGoogle, loginWithGitHub, register, logout, isLoading } = useUser();

    // Debug: check if register exists
    console.log('useAuth register:', !!register);

    const isOwner = user?.role === 'OWNER';
    const isUser = user?.role === 'USER';

    return {
        user,
        setUser,
        login,
        loginWithGoogle,
        loginWithGitHub,
        register,
        logout,
        isLoading,
        isOwner,
        isUser,
        isAuthenticated: !!user
    };
};
