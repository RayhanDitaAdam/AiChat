import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { UserPlus, User, Mail, Lock, ArrowRight, Briefcase, Globe, Eye, EyeOff } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { PATHS } from '../routes/paths.js';
import { getPublicOwner } from '../services/api.js';

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { register } = useAuth();

    const ownerDomain = searchParams.get('store');
    const [storeName, setStoreName] = useState(ownerDomain || '');

    const [formData, setFormData] = useState({
        name: '',
        storeName: '',
        email: '',
        password: '',
        role: ownerDomain ? 'USER' : 'OWNER',
        domain: '',
        ownerDomain: ownerDomain || ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (ownerDomain) {
            setFormData(prev => ({ ...prev, ownerDomain, role: 'USER' }));

            // Fetch store name
            const fetchStore = async () => {
                try {
                    const res = await getPublicOwner(ownerDomain);
                    if (res.status === 'success') {
                        setStoreName(res.owner.name);
                    }
                } catch (err) {
                    console.error('Failed to fetch store name:', err);
                }
            };
            fetchStore();
        }
    }, [ownerDomain]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await register(formData);
            if (ownerDomain && data.user.role === 'USER') {
                navigate(`/${ownerDomain}`);
            } else if (data.user.role === 'OWNER') {
                navigate(PATHS.OWNER_DASHBOARD);
            } else {
                navigate(PATHS.USER_DASHBOARD);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafbff] flex items-center justify-center p-6 relative">
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-12 md:p-16"
            >
                <div className="text-center mb-10">
                    <div className="h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <UserPlus className="text-white h-7 w-7" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">
                        {ownerDomain ? `Join ${storeName}` : 'Scale Your Store'} <span className="text-indigo-600">.</span>
                    </h2>
                    <p className="text-slate-400 font-bold text-sm tracking-wide uppercase">
                        {ownerDomain ? 'Register to get your digital membership' : 'Create an account to manage your inventory'}
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-sm flex items-center gap-3">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-300 h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="pl-14 w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none text-slate-700"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-300 h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="pl-14 w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none text-slate-700"
                                    placeholder="you@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {formData.role === 'OWNER' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Store Name</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-300 h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="storeName"
                                        required={formData.role === 'OWNER'}
                                        className="pl-14 w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-slate-700"
                                        placeholder="My Awesome Store"
                                        value={formData.storeName}
                                        onChange={(e) => {
                                            const name = e.target.value;
                                            // Auto-generate slug from store name
                                            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                                            setFormData(prev => ({
                                                ...prev,
                                                storeName: name,
                                                domain: slug
                                            }));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Store Link ID (Slug)</label>
                                <div className="relative group">
                                    <Globe className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-300 h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        name="domain"
                                        required={formData.role === 'OWNER'}
                                        className="pl-14 w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-slate-700"
                                        placeholder="makanankucing"
                                        value={formData.domain}
                                        onChange={(e) => {
                                            // Force slug format: lowercase, no spaces, no dots, only alphanumeric and hyphens
                                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                            setFormData(prev => ({ ...prev, domain: val }));
                                        }}
                                    />
                                </div>
                                <p className="ml-2 text-[10px] text-slate-400 font-medium">
                                    Your store will be accessible at: <span className="text-indigo-600 font-bold">domain.com/{formData.domain || 'your-store'}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Secure Password</label>
                        <div className="relative group font-bold">
                            <Lock className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-300 h-5 w-5 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                minLength={8}
                                className="pl-14 pr-14 w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none text-slate-700"
                                placeholder="Min. 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors z-10"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-2xl transition-colors flex items-center justify-center gap-3 shadow-sm disabled:opacity-70 text-lg"
                    >
                        <span>{loading ? 'Processing...' : 'Create Account'}</span>
                        {!loading && <ArrowRight className="h-6 w-6" />}
                    </button>
                </form>

                <div className="mt-12 text-center text-sm font-bold text-slate-400">
                    Already part of HEART?{' '}
                    <Link to={PATHS.LOGIN} className="text-indigo-600 hover:underline">
                        Sign In
                    </Link>
                </div>
            </Motion.div>
        </div>
    );
};

export default Register;
