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
        <div className="min-h-screen bg-[#fafbff] flex items-center justify-center p-6">
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card max-w-md w-full p-10 md:p-12"
            >
                <div className="text-center mb-10">
                    <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <LogIn className="text-white h-7 w-7" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome <span className="text-indigo-600">.</span></h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sign in to your assistant</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-bold text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5 group-focus-within:text-indigo-500 transition-colors z-10" />
                            <input
                                type="email"
                                name="email"
                                required
                                className="input pl-12 w-full font-bold text-slate-700"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5 group-focus-within:text-indigo-500 transition-colors z-10" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                className="input pl-12 pr-12 w-full font-bold text-slate-700"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors z-10"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full h-14 font-black transition-all flex items-center justify-center gap-3 text-lg"
                    >
                        <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                        {!loading && <ArrowRight className="h-6 w-6" />}
                    </button>
                </form>

                <div className="mt-10 text-center text-sm font-bold text-slate-400">
                    Don't have an account?{' '}
                    <Link
                        to={`${PATHS.REGISTER}${store ? `?store=${store}` : ''}`}
                        className="text-indigo-600 hover:text-indigo-700"
                    >
                        Create Access
                    </Link>
                </div>
            </Motion.div>
        </div>
    );
};

export default Login;
