import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { PATHS } from '../routes/paths.js';

const GitHubCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithGitHub } = useAuth();
    const processedRef = useRef(false);

    useEffect(() => {
        const code = searchParams.get('code');

        if (code && !processedRef.current) {
            processedRef.current = true;

            const handleLogin = async () => {
                try {
                    const data = await loginWithGitHub(code);
                    if (data.user.role === 'OWNER') navigate(PATHS.OWNER_DASHBOARD);
                    else if (data.user.role === 'ADMIN') navigate(PATHS.ADMIN_DASHBOARD);
                    else navigate(PATHS.USER_DASHBOARD);
                } catch (error) {
                    console.error('GitHub Callback Error:', error);
                    navigate(PATHS.LOGIN);
                }
            };

            handleLogin();
        } else if (!code) {
            navigate(PATHS.LOGIN);
        }
    }, [searchParams, loginWithGitHub, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-slate-800">Authenticating with GitHub...</h2>
                <p className="text-slate-500 mt-2">Please wait while we connect your account.</p>
            </div>
        </div>
    );
};

export default GitHubCallback;
