import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { User, Printer, Save, Smartphone, MapPin, Globe } from 'lucide-react';
import api from '../services/api.js';
import MembershipCard from '../components/MembershipCard.jsx';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        password: '',
        confirmPassword: '',
        printerIp: user?.printerIp || '',
        printerPort: user?.printerPort || 9100,
        language: user?.language || 'id',
        phone: user?.phone || '',
        domain: user?.owner?.domain || '',
        storeName: user?.owner?.name || ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                currentPassword: '',
                password: '',
                confirmPassword: '',
                printerIp: user.printerIp || '',
                printerPort: user.printerPort || 9100,
                language: user.language || 'id',
                phone: user.phone || '',
                domain: user?.owner?.domain || '',
                storeName: user?.owner?.name || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'printerPort' ? parseInt(value) || '' : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        // Validate password fields
        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', content: 'Passwords do not match' });
            setLoading(false);
            return;
        }

        // Prepare data (exclude empty password fields and confirmPassword)
        const submitData = { ...formData };
        delete submitData.confirmPassword;
        if (!submitData.password) {
            delete submitData.password;
            delete submitData.currentPassword;
        }

        try {
            const response = await api.patch('/auth/profile', submitData);
            if (response.data.status === 'success') {
                setMessage({ type: 'success', content: 'Profile updated successfully!' });
                setUser(response.data.user);
                // Clear password fields
                setFormData(prev => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }));
            }
        } catch (error) {
            setMessage({
                type: 'error',
                content: error.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
                <p className="text-slate-500 font-medium">Manage your account and printer configurations</p>
            </div>

            {/* Membership Card */}
            <div className="mb-10 w-full flex justify-center">
                <MembershipCard user={user} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <User className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                    placeholder="+628123456789"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Printer Settings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <Printer className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Printer Configuration</h2>
                    </div>

                    <p className="text-sm text-slate-500 mb-6"> Configure your network printer for direct thermal receipt printing. Make sure your printer is on the same network!</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Printer IP Address</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="printerIp"
                                    value={formData.printerIp}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                    placeholder="192.168.1.100"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Printer Port</label>
                            <input
                                type="number"
                                name="printerPort"
                                value={formData.printerPort}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                placeholder="9100"
                            />
                        </div>
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
                    </div>

                    <p className="text-sm text-slate-500 mb-6">Update your password to keep your account secure.</p>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                    placeholder="Min. 8 characters"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Owner Settings - Only for Owners */}
                {user?.role === 'OWNER' && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">Store Settings</h2>
                        </div>

                        <p className="text-sm text-slate-500 mb-6">Manage your store name and URL.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Store Name</label>
                                <input
                                    type="text"
                                    name="storeName"
                                    value={formData.storeName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                    placeholder="My Awesome Store"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Store URL (Slug)</label>
                                <input
                                    type="text"
                                    name="domain"
                                    value={formData.domain}
                                    onChange={(e) => {
                                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                        setFormData(prev => ({ ...prev, domain: val }));
                                    }}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-bold"
                                    placeholder="my-store"
                                />
                                <p className="text-[10px] text-slate-400">Your store will be accessible at: /store/your-slug</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Message */}
                {message.content && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                        {message.content}
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
