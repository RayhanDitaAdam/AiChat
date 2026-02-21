import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Link } from 'react-router-dom';
import { User, Save, Smartphone, FileText, ShieldCheck, Lock } from 'lucide-react';
import UserAvatar from '../components/UserAvatar.jsx';
import Avatar from 'boring-avatars';
import api from '../services/api.js';
import MembershipCard from '../components/MembershipCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { useTranslation } from 'react-i18next';
import TwoFactorSetup from '../components/TwoFactorSetup.jsx';
import { fetchProfile } from '../services/api.js';
import { PATHS } from '../routes/paths.js';

const Profile = () => {
    const { t } = useTranslation();
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        medicalRecord: user?.medicalRecord || '',
        avatarVariant: user?.avatarVariant || 'beam'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                medicalRecord: user.medicalRecord || '',
                avatarVariant: user.avatarVariant || 'beam'
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        try {
            const response = await api.patch('/auth/profile', formData);
            if (response.data.status === 'success') {
                setMessage({ type: 'success', content: t('profile.messages.update_success') });
                setUser(response.data.user);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                content: error.response?.data?.message || t('profile.messages.update_failed')
            });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileRefresh = async () => {
        try {
            const data = await fetchProfile();
            setUser(data.user);
        } catch (error) {
            console.error('Failed to refresh profile:', error);
        }
    };

    return (
        <div className="min-h-full p-4">
            <div className="max-w-7xl mx-auto py-4 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('profile.title')}</h1>
                    <p className="text-slate-500 font-medium">{t('profile.subtitle')}</p>
                </div>

                {/* Membership Card */}
                <div className="mb-6 w-full flex justify-center px-2">
                    <MembershipCard user={{ ...user, avatarVariant: formData.avatarVariant }} />
                </div>

                {/* Loyalty Points Display */}
                <div className="mb-8 grid grid-cols-2 gap-4">
                    <div className="bg-indigo-600 rounded-[2rem] p-6 text-white text-center shadow-lg shadow-indigo-200">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">{t('profile.my_points')}</p>
                        <p className="text-4xl font-black tracking-tighter">{user?.points || 0}</p>
                    </div>
                    <div className="bg-white rounded-[2rem] p-6 text-slate-900 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('profile.member_id')}</p>
                        <p className="text-xl font-black tracking-tight">{user?.customerId || '-'}</p>
                    </div>
                </div>

                {/* Avatar Selection */}
                <div className="mb-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <User className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">{t('profile.choose_avatar')}</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="shrink-0 flex flex-col items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('profile.preview')}</span>
                            <div className="p-1 ring-4 ring-indigo-50 rounded-full">
                                <Avatar
                                    size={120}
                                    name={formData.name || 'User'}
                                    variant={formData.avatarVariant}
                                    colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                                />
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <label className="text-sm font-semibold text-slate-700 mb-3 block">{t('profile.styles')}</label>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {["beam", "marble", "pixel", "sunset", "bauhaus", "ring"].map((variant) => (
                                    <button
                                        key={variant}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, avatarVariant: variant }))}
                                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${formData.avatarVariant === variant
                                            ? 'border-indigo-600 ring-4 ring-indigo-600/10 scale-105 z-10'
                                            : 'border-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                                            <Avatar
                                                size="100%"
                                                name={formData.name || 'User'}
                                                variant={variant}
                                                colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                                            />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur-sm p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] text-white font-bold capitalize">{variant}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <TwoFactorSetup user={user} onUpdate={handleProfileRefresh} />
                </div>

                {/* Account Security / Change Password */}
                <div className="mb-8 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">{t('profile.security') || 'Security'}</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{t('profile.password_management') || 'Password Management'}</p>
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{t('profile.protect_account') || 'Protect your account'}</p>
                            </div>
                        </div>
                        <Link
                            to={user?.role === 'ADMIN' ? '#' : (user?.role === 'OWNER' ? PATHS.OWNER_CHANGE_PASSWORD : (user?.role === 'CONTRIBUTOR' ? PATHS.CONTRIBUTOR_CHANGE_PASSWORD : PATHS.USER_CHANGE_PASSWORD))}
                            className="w-full sm:w-auto px-6 py-2.5 bg-white text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all text-center shadow-sm"
                        >
                            {t('profile.change_password') || 'Change Password'}
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Medical Record */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{t('profile.medical_record')}</h2>
                        </div>

                        <p className="text-sm text-slate-500 mb-6">
                            {t('profile.medical_desc')}
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">{t('profile.medical_notes')}</label>
                            <textarea
                                name="medicalRecord"
                                value={formData.medicalRecord}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-900 font-medium resize-none"
                                placeholder={t('profile.medical_placeholder')}
                            />
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold text-slate-800">{t('profile.personal_info')}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">{t('profile.full_name')}</label>
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
                                <label className="text-sm font-semibold text-slate-700">{t('profile.email_address')}</label>
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
                                <label className="text-sm font-semibold text-slate-700">{t('profile.phone_number')}</label>
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

                    {message.content && (
                        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                            {message.content}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'w-full md:w-64' : ''}`}
                        >
                            {loading ? (
                                <div className="w-full">
                                    <ProgressBar targetWidth="100%" />
                                </div>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>{t('profile.save_profile')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
