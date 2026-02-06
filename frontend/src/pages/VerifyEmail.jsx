import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { PATHS } from '../routes/paths.js';
import { useAuth } from '../hooks/useAuth.js';
import api from '../services/api.js';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [searchParams] = useSearchParams();
    const emailParam = searchParams.get('email');

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Persist email in session storage to handle refresh
    const persistentEmail = emailParam || sessionStorage.getItem('pending_verify_email');

    useEffect(() => {
        if (emailParam) {
            sessionStorage.setItem('pending_verify_email', emailParam);
        }

        if (!persistentEmail) {
            const timer = setTimeout(() => {
                const checkAgain = searchParams.get('email') || sessionStorage.getItem('pending_verify_email');
                if (!checkAgain) navigate(PATHS.LOGIN);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [emailParam, persistentEmail, navigate, searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/verify-email', { email: persistentEmail, code });
            setSuccess('Email berhasil diverifikasi! Mengalihkan ke halaman login...');
            sessionStorage.removeItem('pending_verify_email');
            setTimeout(() => {
                navigate(PATHS.LOGIN);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Verifikasi gagal. Silakan cek kode Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full text-center"
            >
                <div className="mb-8 flex justify-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                        <Mail className="w-8 h-8 text-indigo-600" />
                    </div>
                </div>

                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Verifikasi Email Anda</h2>
                    <p className="text-slate-500">
                        Kami telah mengirimkan kode 6-digit ke <span className="font-semibold text-slate-900">{persistentEmail || 'email Anda'}</span>.
                        Masukkan kode tersebut untuk mengaktifkan akun.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 font-medium text-sm text-left">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 font-medium text-sm text-left flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5" />
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            className="w-full text-center text-3xl font-bold tracking-[10px] py-4 rounded-xl border-2 border-slate-100 focus:border-indigo-600 focus:ring-0 transition-all outline-none"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length < 6 || !!success}
                        className="btn w-full py-4 text-lg"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Memverifikasi...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                Verifikasi Akun
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-sm text-slate-400">
                    Tidak menerima email? Cek folder Spam atau <button className="text-indigo-600 font-semibold hover:underline">Kirim Ulang</button>
                </p>

                <div className="mt-10 pt-6 border-t border-slate-100">
                    <button
                        onClick={() => {
                            sessionStorage.removeItem('pending_verify_email');
                            logout();
                            navigate(PATHS.LOGIN);
                        }}
                        className="text-slate-400 hover:text-indigo-600 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        Bukan akun Anda? <span className="underline">Logout & Kembali ke Login</span>
                    </button>
                </div>
            </Motion.div>
        </div>
    );
};

export default VerifyEmail;
