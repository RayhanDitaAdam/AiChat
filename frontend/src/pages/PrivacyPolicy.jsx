import React from 'react';
import { Shield, Lock, Eye, Database, Globe, Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../routes/paths.js';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-violet-200">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">AI Heart</span>
                    </div>
                    <button
                        onClick={() => navigate(PATHS.HOME)}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-violet-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-white border-b border-slate-200 pt-20 pb-16 px-6">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-violet-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight not-italic">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto not-italic">
                        We value your privacy. This policy explains how AI Heart collects, uses, and protects your personal information.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm font-semibold text-slate-600">
                        <span>Last Updated: February 26, 2026</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
                {/* Section 1 */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Database className="w-6 h-6 text-violet-600" />
                        <h2 className="text-2xl font-bold text-slate-900 not-italic">Data We Collect</h2>
                    </div>
                    <div className="prose prose-slate prose-lg">
                        <p className="text-slate-600 leading-relaxed font-medium not-italic">
                            When you use AI Heart, we collect the necessary context to provide you with the best conversational experience. This includes:
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-2 text-slate-600 font-medium not-italic">
                            <li>Account information (Name, Email, Role)</li>
                            <li>Chat history and prompts provided to the AI</li>
                            <li>Voluntary medical notes or system preferences</li>
                            <li>Technical data like IP address and device information for security purposes</li>
                        </ul>
                    </div>
                </section>

                {/* Section 2 */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Eye className="w-6 h-6 text-violet-600" />
                        <h2 className="text-2xl font-bold text-slate-900 not-italic">How We Use Your Data</h2>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-slate-600 leading-relaxed font-medium not-italic mb-4">
                            Your data allows us to personalize your experience. We use the information primarily to:
                        </p>
                        <ul className="space-y-3 font-medium text-slate-700 not-italic">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-violet-600 text-xs font-bold">1</span>
                                </div>
                                Provide, maintain, and improve the AI Heart services and interactions.
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-violet-600 text-xs font-bold">2</span>
                                </div>
                                Train and fine-tune our algorithms (only if you opt-in to human chat review).
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-violet-600 text-xs font-bold">3</span>
                                </div>
                                Secure your account from unauthorized access.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Section 3 */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Lock className="w-6 h-6 text-violet-600" />
                        <h2 className="text-2xl font-bold text-slate-900 not-italic">Chat Review Privacy</h2>
                    </div>
                    <div className="prose prose-slate prose-lg">
                        <p className="text-slate-600 leading-relaxed font-medium not-italic">
                            To improve our AI responses, humans may review a small fraction of anonymized chat data.
                            <strong> You have full control over this.</strong>
                            <br /><br />
                            If you do not wish for your chats to be reviewed or used for service improvement, you can easily disable this feature by navigating to your Profile settings and turning off "AI Chat Privacy".
                        </p>
                    </div>
                </section>

                {/* Section 4 */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Globe className="w-6 h-6 text-violet-600" />
                        <h2 className="text-2xl font-bold text-slate-900 not-italic">Third Party Sharing</h2>
                    </div>
                    <div className="prose prose-slate prose-lg border-l-4 border-violet-500 pl-4">
                        <p className="text-slate-600 leading-relaxed font-medium not-italic">
                            We do not sell your personal data to any third-party marketing services. Information is only shared with our secure hosting partners and AI processing vendors required to make the service function, all of whom are strictly bound by confidentiality agreements.
                        </p>
                    </div>
                </section>

            </div>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-6 mt-12">
                <div className="max-w-4xl mx-auto text-center space-y-4 font-medium not-italic">
                    <div className="flex justify-center mb-4">
                        <Heart className="w-6 h-6 text-violet-500 opacity-50" />
                    </div>
                    <p>© {new Date().getFullYear()} AI Heart. All rights reserved.</p>
                    <p className="text-sm">For privacy-related inquiries, please contact privacy@aiheart.com</p>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
