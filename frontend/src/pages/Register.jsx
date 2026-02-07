import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { UserPlus, User, Mail, Lock, ArrowRight, Briefcase, Globe, Eye, EyeOff } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { PATHS } from '../routes/paths.js';
import { getPublicOwner } from '../services/api.js';
import ProgressBar from '../components/ProgressBar.jsx';

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

    const [activeTab, setActiveTab] = useState(ownerDomain ? 'USER' : 'USER');

    useEffect(() => {
        if (ownerDomain) {
            setFormData(prev => ({ ...prev, ownerDomain, role: 'USER' }));
            setActiveTab('USER');

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

    // Sync role with active tab
    useEffect(() => {
        if (!ownerDomain) {
            setFormData(prev => ({ ...prev, role: activeTab }));
        }
    }, [activeTab, ownerDomain]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await register(formData);
            if (data.requiresVerification) {
                navigate(`${PATHS.VERIFY_EMAIL}?email=${formData.email}`);
            } else {
                navigate(PATHS.LOGIN);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full"
            >

                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">
                        {ownerDomain ? `Join ${storeName}` : 'Create your account'}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {ownerDomain ? 'Register to get your digital membership' : 'Join as a User or start your own Store'}
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 font-medium text-sm flex items-center gap-3">
                        {error}
                    </div>
                )}

                {!ownerDomain && (
                    <div className="tabs w-full mb-6" id="registration-tabs">
                        <nav role="tablist" aria-orientation="horizontal" className="w-full flex space-x-2 bg-slate-100 p-1 rounded-xl">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'USER'}
                                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none ${activeTab === 'USER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                onClick={() => setActiveTab('USER')}
                            >
                                User
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'OWNER'}
                                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none ${activeTab === 'OWNER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                onClick={() => setActiveTab('OWNER')}
                            >
                                Owner
                            </button>
                        </nav>
                    </div>
                )}

                <div className="bg-white rounded-xl">
                    <form onSubmit={handleSubmit} className="form grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {activeTab === 'OWNER' && (
                            <Motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-6 overflow-hidden"
                            >
                                <div className="grid gap-2">
                                    <label htmlFor="storeName" className="text-sm font-medium text-slate-700">Store Name</label>
                                    <input
                                        type="text"
                                        id="storeName"
                                        name="storeName"
                                        required={activeTab === 'OWNER'}
                                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                        placeholder="My Awesome Store"
                                        value={formData.storeName}
                                        onChange={(e) => {
                                            const name = e.target.value;
                                            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                                            setFormData(prev => ({
                                                ...prev,
                                                storeName: name,
                                                domain: slug
                                            }));
                                        }}
                                    />
                                    <p className="text-slate-500 text-xs">This is how your store will be displayed to customers.</p>
                                </div>

                                <div className="grid gap-2">
                                    <label htmlFor="domain" className="text-sm font-medium text-slate-700">Store Link ID (Slug)</label>
                                    <input
                                        type="text"
                                        id="domain"
                                        name="domain"
                                        required={activeTab === 'OWNER'}
                                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                        placeholder="my-store"
                                        value={formData.domain}
                                        onChange={(e) => {
                                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                            setFormData(prev => ({ ...prev, domain: val }));
                                        }}
                                    />
                                    <p className="text-slate-500 text-xs">
                                        Your store will be at: <span className="text-indigo-600 font-medium">domain.com/{formData.domain || 'your-store'}</span>
                                    </p>
                                </div>
                            </Motion.div>
                        )}

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                required
                                minLength={8}
                                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                placeholder="Min. 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all"
                        >
                            {loading ? <ProgressBar targetWidth="100%" /> : (activeTab === 'OWNER' && !ownerDomain ? 'Create Store Account' : 'Create User Account')}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to={PATHS.LOGIN} className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
};

export default Register;
