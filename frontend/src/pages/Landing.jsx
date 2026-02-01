import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MessageSquare,
    Zap,
    Shield,
    History,
    ArrowRight,
    Sparkles,
    Layout,
    BarChart3,
    Globe,
    Users,
    Headset,
    CheckCircle2,
    ChevronDown,
    Search,
    ShoppingBasket,
    Wallet,
    Star,
    Menu,
    X
} from 'lucide-react';
import { motion as Motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';

const sectionVariants = {
    offscreen: {
        y: 100,
        opacity: 0,
    },
    onscreen: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            bounce: 0.3,
            duration: 0.8
        }
    }
};

const Landing = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const getDashboardPath = () => {
        if (!user) return '/chat';
        if (user.role === 'ADMIN') return '/admin';
        if (user.role === 'OWNER') return '/owner';
        return '/chat';
    };
    const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

    const handleStartChat = () => {
        navigate('/chat');
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">
            {/* Fixed Background Layer */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            </div>

            {/* Sticky Header */}
            <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-[#020617]/70 backdrop-blur-xl">
                <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_-5px_#4f46e5] group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter italic">HEART<span className="text-indigo-500">AI</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Features</a>
                        <a href="#retailers" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Retailers</a>
                        <a href="#faq" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">FAQ</a>
                        <div className="h-4 w-px bg-white/10"></div>
                        <Link to="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Integrations</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-4">
                            {isAuthenticated ? (
                                <Link
                                    to={getDashboardPath()}
                                    className="group relative px-6 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-black transition-all hover:bg-indigo-700 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)] overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        Go to Dashboard
                                        <Layout className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                    </span>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="hidden sm:block text-sm font-bold text-zinc-300 hover:text-white transition-colors">Sign In</Link>
                                    <Link
                                        to="/register"
                                        className="group relative px-6 py-2.5 bg-white text-zinc-950 rounded-full text-sm font-black transition-all hover:bg-indigo-50 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center gap-1.5">
                                            Start Exploring
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <Menu className="w-8 h-8" />
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay - Outside header to blur entire page */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <Motion.div
                            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[500] bg-black/70 md:hidden"
                            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        />

                        {/* Sidebar */}
                        <Motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 z-[600] w-[300px] bg-zinc-950 border-l border-white/5 p-8 flex flex-col md:hidden"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-black text-xl italic tracking-tight">HEART<span className="text-indigo-500">AI</span></span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-6 mb-8">
                                {[
                                    { label: 'Features', href: '#features' },
                                    { label: 'Retailers', href: '#retailers' },
                                    { label: 'FAQ', href: '#faq' },
                                    { label: 'Integrations', href: '/login' }
                                ].map((item, i) => (
                                    <Motion.a
                                        key={item.label}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + i * 0.1 }}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-2xl font-black text-zinc-400 hover:text-white transition-colors"
                                    >
                                        {item.label}
                                    </Motion.a>
                                ))}
                            </div>

                            {/* Bottom Action Buttons */}
                            {/* Action Buttons */}
                            <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                                {isAuthenticated ? (
                                    <Link
                                        to={getDashboardPath()}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="group relative px-6 py-3 bg-indigo-600 text-white rounded-full text-sm font-black transition-all hover:bg-indigo-700 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)] overflow-hidden w-full flex justify-center"
                                    >
                                        <span className="relative z-10 flex items-center gap-1.5">
                                            Go to Dashboard
                                            <Layout className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                        </span>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="w-full py-3 text-center text-sm font-bold text-zinc-300 hover:text-white transition-colors"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="group relative px-6 py-3 bg-white text-zinc-950 rounded-full text-sm font-black transition-all hover:bg-indigo-50 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden w-full flex justify-center"
                                        >
                                            <span className="relative z-10 flex items-center gap-1.5">
                                                Start Exploring
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </Motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <Motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 pt-44 pb-32 px-6"
            >
                <Motion.div
                    style={{ opacity, scale }}
                    className="max-w-7xl mx-auto text-center hero-content"
                >
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[13px] font-black tracking-wide mb-8 shadow-inner"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="uppercase">Evolution of Retail Intelligence</span>
                    </Motion.div>

                    <Motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black tracking-tightest mb-8 leading-[0.9] bg-gradient-to-b from-white via-white to-zinc-600 bg-clip-text text-transparent"
                    >
                        SHOPPING HAS <br />
                        <span className="text-indigo-600">A HEART NOW.</span>
                    </Motion.h1>

                    <Motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg md:text-2xl max-w-3xl mx-auto mb-14 font-medium leading-relaxed"
                    >
                        Heart is the first AI-native digital concierge that bridges the gap between shoppers and inventory.
                        Locate anything, track everything, and get instant human support—all in one chat.
                    </Motion.p>

                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <button
                            onClick={handleStartChat}
                            className="group px-10 py-5 bg-indigo-600 rounded-2xl text-xl font-black hover:bg-indigo-700 transition-all shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] flex items-center gap-3 active:scale-95 border-b-4 border-indigo-900"
                        >
                            Open Chat Assistant
                            <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        </button>
                        <button
                            className="px-10 py-5 bg-zinc-900 border border-white/10 rounded-2xl text-xl font-black hover:bg-zinc-800 transition-all active:scale-95 backdrop-blur-lg flex items-center gap-3"
                        >
                            <Zap className="w-6 h-6 text-yellow-400" />
                            Store Setup
                        </button>
                    </Motion.div>

                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="mt-20 flex flex-wrap justify-center gap-12 opacity-40 grayscale filter hover:grayscale-0 transition-all"
                    >
                        <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><ShoppingBasket className="w-6 h-6" /> RETAILCO</div>
                        <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><Globe className="w-6 h-6" /> GLOBALSHOP</div>
                        <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><Zap className="w-6 h-6" /> HYPERSTORE</div>
                        <div className="flex items-center gap-2 font-black text-2xl tracking-tighter"><Shield className="w-6 h-6" /> SECUREMART</div>
                    </Motion.div>
                </Motion.div>
            </Motion.section>

            {/* Demo Terminal Preview */}
            <Motion.section
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.3 }}
                variants={sectionVariants}
                className="relative z-10 py-20 px-6 overflow-hidden"
            >
                <div className="max-w-6xl mx-auto">
                    <Motion.div
                        className="relative rounded-[2.5rem] border border-white/10 bg-zinc-900/40 p-4 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.15)] backdrop-blur-md group"
                    >
                        <div className="flex h-14 items-center justify-between px-4 md:px-6 border-b border-white/5 bg-zinc-900/60 rounded-t-[1.8rem]">
                            <div className="flex gap-2">
                                <div className="w-3.5 h-3.5 rounded-full bg-rose-500/20 border border-rose-500/40"></div>
                                <div className="w-3.5 h-3.5 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                            </div>
                            <div className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-500 font-black">Live interaction Preview</div>
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center"><Search className="w-4 h-4 text-indigo-400" /></div>
                        </div>

                        <div className="p-4 md:p-10 space-y-6 md:space-y-8 font-medium">
                            <ChatMessage
                                role="user"
                                text="Halo Heart! Ada stok Indomie Goreng? Lokasi raknya dimana ya?"
                            />
                            <ChatMessage
                                role="ai"
                                text="Halo! Saya cek database sebentar... 🍜"
                            />
                            <ChatMessage
                                role="ai"
                                text="Stok Indomie Goreng tersedia sebanyak 142 pcs. Lokasinya ada di Rak B4 (Lorong Sembako) - Rp 3.100 / pcs."
                                isProduct={{
                                    name: "Indomie Goreng (SKU: 412)",
                                    detail: "Available in Rack B4. Price: Rp 3.100"
                                }}
                            />
                            <ChatMessage
                                role="user"
                                text="Oke, masukkin ke shopping list saya ya. Sama ingetin kalo harganya turun."
                            />
                            <ChatMessage
                                role="ai"
                                text="Siap! Produk telah ditambahkan ke Shopping List Anda. ✅ Saya akan memberi notifikasi jika ada promo menarik terkait item ini."
                            />
                        </div>

                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </Motion.div>
                </div>
            </Motion.section>

            {/* Features Multi-Grid */}
            <Motion.section
                id="features"
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionVariants}
                className="relative z-10 py-32 px-6 bg-[#020617]"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black mb-6">UNMATCHED CAPABILITIES.</h2>
                        <p className="text-zinc-500 text-xl max-w-2xl mx-auto font-medium">Built with the latest generative AI to handle complex retail logic out of the box.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="lg:col-span-2 relative group p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 overflow-hidden">
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-10 border border-indigo-500/20">
                                    <Zap className="w-8 h-8 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black mb-4">Real-time <br />Inventory Audit</h3>
                                    <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-md">Our AI doesn't just chat—it manages. It keeps track of every SKU, rack location, and stock level with millisecond latency.</p>
                                </div>
                            </div>
                            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/5 blur-[100px] group-hover:bg-indigo-600/10 transition-colors"></div>
                        </div>

                        {/* Feature 2 */}
                        <div className="relative group p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-amber-600/10 rounded-2xl flex items-center justify-center mb-10 border border-amber-500/20">
                                    <History className="w-8 h-8 text-amber-500" />
                                </div>
                                <h3 className="text-3xl font-black mb-4">Smart <br />Contextualization</h3>
                                <p className="text-zinc-400 font-medium leading-relaxed">Remembers user preferences, past purchases, and specific requests across sessions for a truly personal experience.</p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="relative group p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center mb-10 border border-emerald-500/20">
                                    <Shield className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-3xl font-black mb-4">Secure <br />Wallets</h3>
                                <p className="text-zinc-400 font-medium leading-relaxed">Integrated balance management and secure transaction history with bank-grade encryption layers.</p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="lg:col-span-2 relative group p-10 rounded-[3rem] bg-zinc-900/50 border border-white/5 overflow-hidden">
                            <div className="relative z-10 flex items-start justify-between">
                                <div className="max-w-md">
                                    <div className="w-16 h-16 bg-violet-600/10 rounded-2xl flex items-center justify-center mb-10 border border-violet-500/20">
                                        <Headset className="w-8 h-8 text-violet-500" />
                                    </div>
                                    <h3 className="text-4xl font-black mb-4">Human-in-the-Loop <br />Live Support</h3>
                                    <p className="text-zinc-400 text-lg font-medium leading-relaxed">When AI reaches its limit, users can instantly summon staff. Real-time polling ensures no customer is left waiting.</p>
                                </div>
                                <div className="hidden sm:block p-8 bg-zinc-950 border border-white/5 rounded-[2rem] shadow-2xl">
                                    <div className="flex gap-2 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase text-zinc-500">Connecting to Staff</span>
                                    </div>
                                    <div className="w-32 h-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-zinc-600">
                                        <Headset className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Motion.section>

            {/* Audience Section */}
            <Motion.section
                id="retailers"
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionVariants}
                className="relative z-10 py-32 px-6"
            >
                <div className="max-w-7xl mx-auto border border-white/5 bg-zinc-900/20 rounded-[4rem] p-12 md:p-24">
                    <div className="grid md:grid-cols-2 gap-20">
                        <div className="space-y-12">
                            <h2 className="text-5xl font-black leading-tight">MADE FOR <br /> MODERN RETAIL.</h2>

                            <div className="space-y-8">
                                <CheckItem title="Automatic Store Approval" desc="Register your store and get AI-ready in minutes with our automated approval system." />
                                <CheckItem title="Missing Request Audits" desc="AI identifies what customers are looking for that you don't have, enabling perfect inventory growth." />
                                <CheckItem title="Deep Sentiment Data" desc="Analyze user feedback and ratings to optimize store layout and service quality." />
                            </div>

                            <Link to="/register" className="inline-flex items-center gap-2 group text-indigo-400 font-black text-lg">
                                Register as Store Owner
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-600/10 blur-[100px] rounded-full"></div>
                            <div className="relative z-10 space-y-6">
                                {/* Mock Stat Cards */}
                                <div className="p-8 rounded-[2rem] bg-zinc-900 border border-white/5 shadow-2xl hover:scale-105 transition-transform duration-500">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-zinc-500 font-bold uppercase text-xs">Customer Satisfaction</span>
                                        <Star className="text-amber-500 w-5 h-5 fill-current" />
                                    </div>
                                    <div className="text-5xl font-black">4.9<span className="text-zinc-600">/5</span></div>
                                </div>
                                <div className="p-8 rounded-[2rem] bg-indigo-600 shadow-2xl shadow-indigo-500/20 hover:scale-105 transition-transform duration-500">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-white/70 font-bold uppercase text-xs">AI Request Success</span>
                                        <Sparkles className="text-white w-5 h-5" />
                                    </div>
                                    <div className="text-5xl font-black text-white">99.8%</div>
                                </div>
                                <div className="p-8 rounded-[2rem] bg-zinc-900 border border-white/5 shadow-2xl hover:scale-105 transition-transform duration-500">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-zinc-500 font-bold uppercase text-xs">Inventory Efficiency</span>
                                        <BarChart3 className="text-indigo-400 w-5 h-5" />
                                    </div>
                                    <div className="text-5xl font-black">+45%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Motion.section>

            {/* Multi-Section Content Blocks */}
            <Motion.section
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionVariants}
                className="relative z-10 py-32 px-6"
            >
                <div className="max-w-7xl mx-auto space-y-40">
                    {/* Section Block 1 */}
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl font-black mb-8">Bilingual by Design.</h2>
                            <p className="text-zinc-400 text-xl font-medium leading-relaxed">
                                Whether your customers speak <span className="text-white">Bahasa Indonesia</span> or <span className="text-white">English</span>,
                                Heart AI adapts instantly. It understands slang, abbreviations, and informal speech to ensure a natural flow.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 text-center">
                                <div className="text-3xl font-black mb-1">ID</div>
                                <p className="text-xs font-bold text-zinc-500">INDONESIA</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 text-center">
                                <div className="text-3xl font-black mb-1">EN</div>
                                <p className="text-xs font-bold text-zinc-500">ENGLISH</p>
                            </div>
                        </div>
                    </div>

                    {/* Section Block 2 */}
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="order-2 md:order-1">
                            <div className="relative p-10 rounded-[3rem] bg-gradient-to-br from-zinc-900 to-black border border-white/10">
                                <History className="w-12 h-12 text-indigo-500 mb-6" />
                                <h3 className="text-3xl font-black mb-4">Never Lose Progress.</h3>
                                <p className="text-zinc-400 font-medium">Your chat history is synced across devices. Start a shopping list on your desktop and access it via mobile in-store.</p>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-4xl font-black mb-8">Cloud-Sync Infrastructure.</h2>
                            <p className="text-zinc-400 text-xl font-medium leading-relaxed">
                                Built on a resilient microservices architecture that ensures your shopping journey is saved safely in the cloud,
                                accessible whenever you need it.
                            </p>
                        </div>
                    </div>
                </div>
            </Motion.section>

            {/* FAQ Section */}
            <Motion.section
                id="faq"
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionVariants}
                className="relative z-10 py-32 px-6 bg-zinc-950/50"
            >
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">COMMON QUESTIONS.</h2>
                        <p className="text-zinc-500 font-medium">Everything you need to know about the platform.</p>
                    </div>

                    <div className="space-y-4">
                        <FAQItem
                            q="Bagaimana cara mendaftarkan toko saya?"
                            a="Anda dapat mengklik tombol 'Store Setup' di hero section dan mengisi detail toko Anda. Tim admin kami akan melakukan audit singkat sebelum memberikan akses penuh."
                        />
                        <FAQItem
                            q="Apakah AI ini bisa memberikan rekomendasi harga?"
                            a="Ya, AI Heart mampu menganalisis harga pasar dan memberikan saran harga kompetitif berdasarkan data stok dan permintaan real-time."
                        />
                        <FAQItem
                            q="Apa keunggulan fitur Live Support?"
                            a="Fitur ini memungkinkan pelanggan untuk berbicara langsung dengan staff toko jika AI tidak memiliki informasi spesifik atau memerlukan tindakan manual seperti reservasi produk."
                        />
                        <FAQItem
                            q="Is my data secure?"
                            a="Absolutely. We use end-to-end encryption for all chat logs and wallet data. We never share your personal shopping habits with third parties."
                        />
                    </div>
                </div>
            </Motion.section>

            {/* Final CTA */}
            <Motion.section
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.2 }}
                variants={sectionVariants}
                className="relative z-10 py-44 px-6 overflow-hidden"
            >
                <div className="text-center">
                    <Motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black mb-12 tracking-tighter"
                    >
                        READY TO UPGRADE <br /> YOUR RETAIL?
                    </Motion.h2>
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="flex flex-wrap justify-center gap-6"
                    >
                        <Link
                            to="/register"
                            className="px-12 py-6 bg-indigo-600 rounded-3xl text-2xl font-black hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.4)]"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            to="/chat"
                            className="px-12 py-6 bg-zinc-900 border border-white/10 rounded-3xl text-2xl font-black hover:bg-zinc-800 transition-all active:scale-95 backdrop-blur-lg"
                        >
                            Try AI Assistant
                        </Link>
                    </Motion.div>
                </div>
            </Motion.section>

            {/* Comprehensive Footer */}
            <footer className="relative z-10 border-t border-white/5 py-24 px-6 bg-[#020617]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-2">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">H</div>
                                <span className="font-black text-xl italic tracking-tight">HEART<span className="text-indigo-500">AI</span></span>
                            </div>
                            <p className="text-zinc-500 font-medium max-w-sm leading-relaxed mb-8">
                                The global standard for AI-native retail intelligence and digital customer success.
                            </p>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"><Users className="w-5 h-5" /></div>
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"><Zap className="w-5 h-5" /></div>
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"><Globe className="w-5 h-5" /></div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-widest text-zinc-300 mb-8">Product</h4>
                            <ul className="space-y-4 text-zinc-500 font-medium text-sm">
                                <li className="hover:text-white transition-colors cursor-pointer">AI Concierge</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Live Support</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Inventory Sync</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Wallet System</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-widest text-zinc-300 mb-8">Resources</h4>
                            <ul className="space-y-4 text-zinc-500 font-medium text-sm">
                                <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Integrations</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Pricing</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Changelog</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-zinc-600 text-xs font-bold uppercase tracking-widest">
                        <div>© 2026 Heart AI. Powered by fully agentic intelligence.</div>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-zinc-400">Privacy Policy</a>
                            <a href="#" className="hover:text-zinc-400">Terms of Service</a>
                            <a href="#" className="hover:text-zinc-400">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

/* --- Helpers --- */

const ChatMessage = ({ role, text, isProduct }) => (
    <div className={`flex gap-3 md:gap-6 items-start ${role === 'user' ? 'opacity-80' : ''}`}>
        <div className={`shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-black ${role === 'user' ? 'bg-zinc-800 text-zinc-400 border border-white/5' : 'bg-indigo-600 text-white shadow-lg'}`}>
            <span className="text-sm md:text-base">{role === 'user' ? 'U' : 'H'}</span>
        </div>
        <div className="flex flex-col gap-2 md:gap-3 flex-1 min-w-0">
            <div className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border ${role === 'user' ? 'bg-zinc-800/50 border-white/5' : 'bg-zinc-950 border-indigo-500/20'}`}>
                <p className="text-zinc-300 leading-relaxed text-sm md:text-base">{text}</p>
            </div>
            {isProduct && (
                <div className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-indigo-600/10 border border-indigo-500/30 w-full md:w-fit max-w-sm flex items-center gap-3 md:gap-4 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                        <ShoppingBasket className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs md:text-sm font-black italic truncate">{isProduct.name || 'Indomie Goreng (SKU: 412)'}</div>
                        <div className="text-[10px] md:text-xs font-bold text-indigo-400 truncate">{isProduct.detail || 'Available in Rack B4. Price: Rp 3.100'}</div>
                    </div>
                </div>
            )}
        </div>
    </div>
);

const FeatureItem = ({ icon: Icon, title, desc }) => (
    <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 hover:border-indigo-500/20 transition-all group">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6 text-indigo-400" />
        </div>
        <h4 className="text-xl font-black mb-3">{title}</h4>
        <p className="text-zinc-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
);

const CheckItem = ({ title, desc }) => (
    <div className="flex items-start gap-4">
        <div className="mt-1.5 w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div>
            <h4 className="font-black text-lg mb-1">{title}</h4>
            <p className="text-zinc-500 font-medium leading-relaxed">{desc}</p>
        </div>
    </div>
);

const FAQItem = ({ q, a }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-[1.8rem] overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
            >
                <span className="text-lg font-black">{q}</span>
                <ChevronDown className={`w-5 h-5 text-zinc-500 group-hover:text-white transition-all ${open ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}>
                <div className="px-8 pb-8 text-zinc-400 font-medium leading-relaxed border-t border-white/5 pt-4">
                    {a}
                </div>
            </div>
        </div>
    );
};

export default Landing;
