import React, { useState, useEffect, useRef } from 'react';
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

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

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

    const handleKeyDown = (e, index) => {
        if (
            !/^[0-9]{1}$/.test(e.key)
            && e.key !== 'Backspace'
            && e.key !== 'Delete'
            && e.key !== 'Tab'
            && !e.metaKey
        ) {
            e.preventDefault();
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (index > 0 && !code[index]) {
                const newCode = [...code];
                newCode[index - 1] = '';
                setCode(newCode);
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleInput = (e, index) => {
        const value = e.target.value;
        if (value && /^[0-9]$/.test(value)) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);

            if (index < code.length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleFocus = (e) => {
        e.target.select();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        if (!new RegExp(`^[0-9]{${code.length}}$`).test(text)) {
            return;
        }
        const digits = text.split('');
        setCode(digits);
        inputRefs.current[code.length - 1]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const fullCode = code.join('');

        try {
            await api.post('/auth/verify-email', { email: persistentEmail, code: fullCode });
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

    const isCodeComplete = code.every(digit => digit !== '');

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow"
            >
                <div className="mb-8 flex justify-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                        <Mail className="w-8 h-8 text-indigo-600" />
                    </div>
                </div>

                <header className="mb-8">
                    <h1 className="text-2xl font-bold mb-1">Email Verification</h1>
                    <p className="text-[15px] text-slate-500">
                        Enter the 6-digit verification code that was sent to <span className="font-semibold text-slate-900">{persistentEmail || 'your email'}</span>.
                    </p>
                </header>

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

                <form id="otp-form" onSubmit={handleSubmit}>
                    <div className="flex items-center justify-center gap-3">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                pattern="\d*"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleInput(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={handleFocus}
                                onPaste={handlePaste}
                            />
                        ))}
                    </div>
                    <div className="max-w-[260px] mx-auto mt-4">
                        <button
                            type="submit"
                            disabled={loading || !isCodeComplete || !!success}
                            className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Verifying...
                                </div>
                            ) : (
                                'Verify Account'
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-sm text-slate-500 mt-4">
                    Didn't receive code? <button className="font-medium text-indigo-500 hover:text-indigo-600">Resend</button>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100">
                    <button
                        onClick={() => {
                            sessionStorage.removeItem('pending_verify_email');
                            logout();
                            navigate(PATHS.LOGIN);
                        }}
                        className="text-slate-400 hover:text-indigo-600 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        Not your account? <span className="underline">Logout & Return to Login</span>
                    </button>
                </div>
            </Motion.div>
        </div>
    );
};

export default VerifyEmail;
