import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Save, ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import api from '../services/api.js';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../components/ProgressBar.jsx';

const ChangePassword = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [formData, setFormData] = useState({
        currentPassword: '',
        password: '',
        confirmPassword: ''
    });

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

        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', content: t('profile.messages.passwords_do_not_match') || 'Passwords do not match' });
            setLoading(false);
            return;
        }

        try {
            const response = await api.patch('/auth/profile', {
                currentPassword: formData.currentPassword,
                password: formData.password
            });

            if (response.data.status === 'success') {
                setMessage({ type: 'success', content: t('profile.messages.password_update_success') || 'Password updated successfully!' });
                setFormData({ currentPassword: '', password: '', confirmPassword: '' });
                // Optional: redirect back to profile after delay
                setTimeout(() => {
                    navigate(-1);
                }, 2000);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                content: error.response?.data?.message || t('profile.messages.password_update_failed') || 'Failed to update password'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl p-4 md:p-6 2xl:p-10 bg-[#f9f9f9] min-h-screen">
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 transition-colors font-medium bg-white rounded-xl border border-slate-100 shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('common.back') || 'Back'}</span>
                </button>
                <div className="px-3 py-1 bg-indigo-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t('profile.security_settings') || 'Security Settings'}
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('profile.change_password') || 'Change Password'}</h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">{t('profile.password_desc') || 'Ensure your account is using a strong password'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">{t('profile.current_password') || 'Current Password'}</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            autoComplete="current-password"
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-slate-900 font-medium"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">{t('profile.new_password') || 'New Password'}</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-slate-900 font-medium"
                                placeholder="Min. 8 char"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">{t('profile.confirm_new_password') || 'Confirm New'}</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-slate-900 font-medium"
                                placeholder="Confirm"
                                required
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {message.content && (
                            <Motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                    }`}
                            >
                                {message.content}
                            </Motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 tracking-wide"
                    >
                        {loading ? (
                            <div className="w-32"><ProgressBar targetWidth="100%" /></div>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>{t('profile.update_password') || 'Update Password'}</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
