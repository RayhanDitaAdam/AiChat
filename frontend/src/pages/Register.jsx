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
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full"
            >

                <div className="mb-10">
                    <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">
                        {ownerDomain ? `Join ${storeName}` : 'Create your account'}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        {ownerDomain ? 'Register to get your digital membership' : 'Scale your store with our shopping assistant'}
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 font-medium text-sm flex items-center gap-3">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

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
                    </div>

                    {formData.role === 'OWNER' && (
                        <>
                            <div className="grid gap-2">
                                <label htmlFor="storeName">Store Name</label>
                                <input
                                    type="text"
                                    id="storeName"
                                    name="storeName"
                                    required
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
                                <p className="text-muted-foreground text-sm">This is how your store will be displayed to customers.</p>
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="domain">Store Link ID (Slug)</label>
                                <input
                                    type="text"
                                    id="domain"
                                    name="domain"
                                    required
                                    placeholder="my-store"
                                    value={formData.domain}
                                    onChange={(e) => {
                                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                        setFormData(prev => ({ ...prev, domain: val }));
                                    }}
                                />
                                <p className="text-muted-foreground text-sm">
                                    Your store will be at: <span className="text-indigo-600 font-medium">domain.com/{formData.domain || 'your-store'}</span>
                                </p>
                            </div>
                        </>
                    )}

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
                            minLength={8}
                            placeholder="Min. 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn w-full"
                    >
                        {loading ? 'Processing...' : 'Create account'}
                    </button>
                </form>

                <div className="mt-10 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link to={PATHS.LOGIN} className="text-indigo-600 hover:text-indigo-500 font-medium">
                        Sign in
                    </Link>
                </div>
            </Motion.div>
        </div>
    );
};

export default Register;
