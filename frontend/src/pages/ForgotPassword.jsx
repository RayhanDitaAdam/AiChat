import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { PATHS } from '../routes/paths.js';
import { forgotPassword } from '../services/api.js';
import ProgressBar from '../components/ProgressBar.jsx';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const data = await forgotPassword(email);
            setMessage(data.message || 'Instruksi reset password telah dikirim ke email Anda.');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengirim permintaan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <Link
                    to={PATHS.LOGIN}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-slate-900 transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                </Link>

                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mb-1">Forgot password?</h2>
                    <p className="text-muted-foreground text-sm">No worries, we'll send you reset instructions.</p>
                </div>

                {message ? (
                    <div className="text-center">
                        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 font-medium text-sm">
                            {message}
                        </div>
                        <Link
                            to={PATHS.LOGIN}
                            className="btn w-full inline-flex items-center justify-center"
                        >
                            Return to Sign In
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 font-medium text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="form grid gap-6">
                            <div className="grid gap-2">
                                <label htmlFor="email">Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                    />
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn w-full"
                            >
                                {loading ? <ProgressBar targetWidth="100%" /> : (
                                    <span className="flex items-center justify-center gap-2">
                                        Reset password
                                        <Send className="w-4 h-4" />
                                    </span>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </Motion.div>
        </div>
    );
};

export default ForgotPassword;
