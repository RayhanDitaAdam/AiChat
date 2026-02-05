import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LogIn, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { PATHS } from '../routes/paths.js';

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    const store = searchParams.get('store');

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

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >

                <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">Welcome back</h2>
                    <p className="text-muted-foreground text-sm">Enter your credentials to access your account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 font-medium text-sm">
                        {error}
                    </div>
                )}

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
                        <p className="text-muted-foreground text-sm">Use the email you used during registration.</p>
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
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

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
