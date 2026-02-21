import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { PATHS } from '../routes/paths.js';
import { resetPassword } from '../services/api.js';
import ProgressBar from '../components/ProgressBar.jsx';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // Auto-redirect to login after successful reset
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate(PATHS.LOGIN);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [success, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(token, password);
            setSuccess(true);
        } catch (err) {
            const backendError = err.response?.data;
            if (backendError?.errors && backendError.errors.length > 0) {
                setError(backendError.errors[0].message);
            } else {
                setError(backendError?.message || 'Gagal reset password. Link mungkin sudah kedaluwarsa.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">Invalid Reset Link</h2>
                    <p className="text-muted-foreground mb-6">Reset link tidak valid atau sudah kedaluwarsa. Silakan minta link baru.</p>
                    <Link to={PATHS.FORGOT_PASSWORD} className="btn w-full">Request New Link</Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
                <Motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full"
                >
                    <div className="mb-6 flex justify-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">Password Reset Successful</h2>
                    <p className="text-muted-foreground mb-8">Password Anda telah berhasil diperbarui. Sekarang Anda bisa login dengan password baru.</p>
                    <Link to={PATHS.LOGIN} className="btn w-full">Go to Sign In</Link>
                </Motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">Set new password</h2>
                    <p className="text-muted-foreground text-sm">Must be at least 8 characters long.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 font-medium text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form grid gap-6">
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password">New Password</label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                required
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn w-full"
                    >
                        {loading ? <ProgressBar targetWidth="100%" /> : 'Reset Password'}
                    </button>
                </form>
            </Motion.div>
        </div>
    );
};

export default ResetPassword;
