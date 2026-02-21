import React, { useState } from 'react';
import { LuShield, LuCheck, LuMail } from 'react-icons/lu';
import { setup2FA, disable2FA } from '../services/api.js';
import ProgressBar from './ProgressBar.jsx';

const TwoFactorSetup = ({ user, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEnable = async () => {
        setLoading(true);
        setError('');
        try {
            await setup2FA();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to enable 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!window.confirm('Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.')) return;
        setLoading(true);
        setError('');
        try {
            await disable2FA();
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    if (user?.twoFactorEnabled) {
        return (
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                        <LuShield className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Email 2FA is Active</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Your account is protected. We'll send a verification link to <strong>{user.email}</strong> when you log in.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleDisable}
                            disabled={loading}
                            className="text-rose-600 hover:text-rose-700 text-sm font-bold flex items-center gap-1 transition-colors"
                        >
                            {loading ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                    </div>
                    <LuCheck className="w-6 h-6 text-emerald-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 shrink-0">
                    <LuMail className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Enable Email Authentication</h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Add an extra layer of security. We'll send a verification link to your email whenever you log in.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleEnable}
                        disabled={loading}
                        className="btn bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        {loading ? <ProgressBar targetWidth="100%" /> : 'Enable 2FA'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorSetup;
