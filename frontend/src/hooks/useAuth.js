import { useUser } from '../context/useUser.js';

export const useAuth = () => {
    const { user, login, logout, isLoading } = useUser();

    const isOwner = user?.role === 'OWNER';
    const isUser = user?.role === 'USER';

    return {
        user,
        login,
        logout,
        isLoading,
        isOwner,
        isUser,
        isAuthenticated: !!user
    };
};
