import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LogIn, Lock, ArrowLeft } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { PATHS } from '../routes/paths.js';
import ProgressBar from '../components/ProgressBar.jsx';

const SuperAdminLogin = () => {
    const navigate = useNavigate();
    const { login, verifyKeyFile } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [tempUserId, setTempUserId] = useState(null);
    const [step, setStep] = useState('login'); // 'login' or 'verify_key'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login(formData.email, formData.password);
            if (data.status === 'requires_key_file') {
                setTempUserId(data.userId);
                setStep('verify_key');
            } else if (data.status === 'success' && data.user?.role === 'SUPER_ADMIN') {
                navigate(PATHS.SUPER_ADMIN_DASHBOARD);
            } else {
                setError('Authentication failed: Only Super Admins can login here.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyKeyFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');
        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const rawKeyContent = event.target.result;
            const keyContent = typeof rawKeyContent === 'string'
                ? rawKeyContent.replace(/\s+/g, '')
                : rawKeyContent;

            console.log("Verify Request Payload:");
            console.log("UserID:", tempUserId);
            console.log("KeyContent Length:", keyContent?.length);
            console.log("KeyContent Start:", keyContent?.substring(0, 10));

            try {
                const data = await verifyKeyFile(tempUserId, keyContent);
                console.log("Verify Response:", data);
                navigate(PATHS.SUPER_ADMIN_DASHBOARD);
            } catch (err) {
                console.error("Verify Error:", err);
                setError(err.response?.data?.message || 'Invalid key file. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        reader.onerror = () => {
            setError('Failed to read the key file.');
            setLoading(false);
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 overflow-hidden">
            <Motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={step}
                className="relative bg-white px-8 pt-10 pb-9 mx-auto w-full max-w-md rounded-2xl shadow-xl"
            >
                {step === 'verify_key' && (
                    <button
                        onClick={() => setStep('login')}
                        className="absolute top-4 left-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                )}

                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                        Super Admin Portal
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {step === 'login'
                            ? 'Enter super admin credentials'
                            : 'Upload your secure key file (.txt)'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 font-medium text-sm">
                        {error}
                    </div>
                )}

                {step === 'login' ? (
                    <form onSubmit={handleSubmit} className="grid gap-6">
                        <div className="grid gap-2">
                            <label className="text-sm font-semibold text-slate-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-semibold text-slate-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full h-11 px-4 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-11 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                        >
                            {loading ? <ProgressBar targetWidth="100%" /> : 'Authenticate'}
                        </button>
                    </form>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl w-full text-center">
                            <Lock className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                            <h3 className="font-semibold text-slate-900 mb-2">Upload Key File</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Provide your physical key token file.
                            </p>

                            <label className="relative flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-slate-800 hover:bg-slate-100 cursor-pointer transition-colors group">
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
                                        {loading ? 'Verifying...' : 'Click to Browse File'}
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".txt"
                                    onChange={handleVerifyKeyFile}
                                    disabled={loading}
                                />
                            </label>
                        </div>
                        {loading && <div className="w-full max-w-[200px]"><ProgressBar targetWidth="100%" /></div>}
                    </div>
                )}
            </Motion.div>
        </div>
    );
};

export default SuperAdminLogin;
