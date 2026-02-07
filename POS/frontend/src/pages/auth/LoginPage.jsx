import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { PATHS } from '../../routes/paths';
import { LogIn, User, Lock, Loader2 } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const LoginPage = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (isAuthenticated) return <Navigate to={PATHS.HOME} replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await login(formData.email, formData.password);
        if (res.success) {
            navigate(PATHS.HOME);
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden font-sans">
            <Motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm relative z-10"
            >
                <div className="card shadow-2xl p-8 border-2">
                    <header className="text-center mb-8 pt-4">
                        <div className="w-16 h-16 bg-foreground text-background rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                            H
                        </div>
                        <h1 className="text-2xl font-bold tracking-tighter uppercase">Heart POS</h1>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[9px] mt-1">Intelligence Retail Hub</p>
                    </header>

                    {error && (
                        <Motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded text-xs font-bold mb-6 flex items-center gap-2"
                        >
                            <AlertCircle size={14} />
                            {error}
                        </Motion.div>
                    )}

                    <section>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Email</label>
                                <div className="relative group">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input w-full pl-10"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="input w-full pl-10"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn w-full h-12 mt-4 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <LogIn size={18} />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </section>

                    <footer className="mt-8 text-center">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Controlled Access Only</p>
                    </footer>
                </div>
            </Motion.div>
        </div>
    );
};

// Import AlertCircle for error display
const AlertCircle = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

export default LoginPage;
