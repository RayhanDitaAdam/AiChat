import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LogIn, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { PATHS } from '../routes/paths.js';
import { GoogleLogin } from '@react-oauth/google';
import ProgressBar from '../components/ProgressBar.jsx';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { login, loginWithGoogle } = useAuth();

    const store = searchParams.get('store');
    const message = location.state?.message;

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(formData.email, formData.password);
            if (store && data.user.role === 'USER') {
                navigate(`/${store}`);
            } else if (data.user.role === 'ADMIN') {
                navigate(PATHS.ADMIN_DASHBOARD);
            } else if (data.user.role === 'OWNER') {
                navigate(PATHS.OWNER_DASHBOARD);
            } else {
                navigate(PATHS.USER_DASHBOARD);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGitHubLogin = () => {
        const GITHUB_CLIENT_ID = "Ov23liqtudX7jqm3nlBm";
        const REDIRECT_URI = "http://localhost:5173/auth/github/callback";
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email`;
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            const data = await loginWithGoogle(credentialResponse.credential);
            if (store && data.user.role === 'USER') {
                navigate(`/${store}`);
            } else if (data.user.role === 'ADMIN') {
                navigate(PATHS.ADMIN_DASHBOARD);
            } else if (data.user.role === 'OWNER') {
                navigate(PATHS.OWNER_DASHBOARD);
            } else {
                navigate(PATHS.USER_DASHBOARD);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Google login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">Welcome back</h2>
                    <p className="text-muted-foreground text-sm">Enter your credentials to access your account</p>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 font-medium text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 font-medium text-sm">
                        {error}
                    </div>
                )}

                <div className="grid gap-6">
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={handleGitHubLogin}
                            className="flex-1 flex items-center justify-center gap-2 h-10 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors bg-white text-slate-700 font-medium text-sm"
                        >
                            <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                                <title>GitHub</title>
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                            </svg>
                            GitHub
                        </button>

                        <div className="relative flex-1">
                            <button
                                type="button"
                                className="w-full flex items-center justify-center gap-2 h-10 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors bg-white text-slate-700 font-medium text-sm"
                            >
                                <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                                    <title>Google</title>
                                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"></path>
                                </svg>
                                Google
                            </button>
                            <div className="absolute inset-0 opacity-0 z-10 overflow-hidden flex justify-center items-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError('Google login failed.')}
                                    theme="outline"
                                    size="large"
                                    shape="rect"
                                    text="signup_with"
                                    width="1000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="form grid gap-6">
                        <div className="grid gap-2">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                required
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn w-full"
                        >
                            {loading ? <ProgressBar targetWidth="100%" /> : 'Sign In'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link
                        to={`${PATHS.REGISTER}${store ? `?store=${store}` : ''}`}
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        Create an account
                    </Link>
                </div>
            </Motion.div>
        </div>
    );
};

export default Login;
