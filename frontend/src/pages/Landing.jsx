import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MessageSquare, Zap, Shield, History, ArrowRight, Sparkles, Layout,
    BarChart3, Globe, Users, Headset, CheckCircle2, ChevronDown, Search,
    ShoppingBasket, Wallet, Star, Menu, X, Phone, Monitor, Quote, Layers,
    Store, ArrowUpRight
} from 'lucide-react';
import { motion as Motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.js';
import { PATHS } from '../routes/paths.js';
import api from '../services/api';
import MagicBento from '../components/MagicBento';
import LogoLoop from '../components/LogoLoop';
import { useSystemContext } from '../context/SystemContext.jsx';
import {
    SiReact, SiVite, SiTailwindcss, SiJavascript, SiTypescript, SiNodedotjs,
    SiExpress, SiPrisma, SiPostgresql, SiGoogle, SiFramer, SiGreensock, SiAxios, SiI18Next
} from 'react-icons/si';

// SaaS Design Tokens
const COLORS = {
    primary: "#4f46e5",
    background: "#020617",
    surface: "#0f172a",
    text_primary: "#ffffff",
    text_secondary: "#94a3b8",
    accent: "#6366f1"
};

const iconMap = {
    zap: Zap, shield: Shield, history: History, globe: Globe, barchart: BarChart3,
    sparkles: Sparkles, users: Users, headset: Headset, monitor: Monitor, quote: Quote,
    message: MessageSquare, check: CheckCircle2, search: Search, wallet: Wallet, star: Star,
    shopping: ShoppingBasket, arrow: ArrowRight
};

const techLogos = [
    { node: <SiReact className="w-10 h-10 text-sky-400" />, title: 'React' },
    { node: <SiVite className="w-10 h-10 text-purple-400" />, title: 'Vite' },
    { node: <SiTailwindcss className="w-10 h-10 text-cyan-400" />, title: 'Tailwind' },
    { node: <SiJavascript className="w-10 h-10 text-yellow-400" />, title: 'JavaScript' },
    { node: <SiTypescript className="w-10 h-10 text-blue-500" />, title: 'TypeScript' },
    { node: <SiNodedotjs className="w-10 h-10 text-green-500" />, title: 'Node.js' },
    { node: <SiExpress className="w-10 h-10 text-slate-400" />, title: 'Express' },
    { node: <SiPrisma className="w-10 h-10 text-white" />, title: 'Prisma' },
    { node: <SiPostgresql className="w-10 h-10 text-blue-400" />, title: 'PostgreSQL' },
    { node: <SiGoogle className="w-10 h-10 text-white" />, title: 'Google' },
    { node: <SiFramer className="w-10 h-10 text-white" />, title: 'Framer' },
    { node: <SiAxios className="w-10 h-10 text-purple-600" />, title: 'Axios' }
];

const Landing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const { companyName } = useSystemContext();
    const [sections, setSections] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);
    const shortName = companyName?.replace(/ai$/i, '').toUpperCase() || 'HEART';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const isPreview = params.get('preview') === 'true';
                const token = params.get('token');
                const [sectionsRes, configRes] = await Promise.all([
                    api.get('/landing/sections', { params: isPreview ? { preview: 'true', token } : {} }),
                    api.get('/landing/config')
                ]);
                setSections(sectionsRes.data);
                setConfig(configRes.data);
                if (configRes.data?.pageTitle) document.title = configRes.data.pageTitle;
            } catch (err) {
                console.error("Landing Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (config?.maintenanceMode && !(new URLSearchParams(window.location.search).get('preview') === 'true')) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 italic tracking-tighter" style={{ fontFamily: 'Inter' }}>{shortName}<span className="text-indigo-500">AI</span></h1>
                <p className="text-zinc-400 text-lg">Under maintenance.</p>
            </div>
        );
    }

    const getDashboardPath = () => {
        if (!user) return PATHS.USER_DASHBOARD;
        return (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? PATHS.ADMIN_DASHBOARD : (user.role === 'OWNER' ? PATHS.OWNER_DASHBOARD : PATHS.USER_DASHBOARD);
    };

    const renderSection = (section) => {
        if (!section.isActive) return null;
        const { type, content } = section;
        const layout = content.layout || 'split';

        switch (type) {
            case 'HERO': {
                const isCentered = layout === 'centered';
                const isReverse = layout === 'split_reverse';
                return (
                    <section key={section.id} className="pt-44 pb-32 px-6 relative z-10 overflow-hidden">
                        <div className={`max-w-[1200px] mx-auto grid ${isCentered ? 'grid-cols-1' : 'md:grid-cols-12'} gap-12 items-center`}>
                            <Motion.div style={isCentered ? { opacity, scale } : {}} className={`${isCentered ? 'text-center max-w-3xl mx-auto' : `md:col-span-6 ${isReverse ? 'md:order-2' : ''}`}`}>
                                {content.badge && <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-6 tracking-wide uppercase italic">{content.badge}</div>}
                                <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tighter text-white" style={{ fontFamily: 'Inter' }}>{content.headline}</h1>
                                <p className="text-slate-400 text-lg md:text-xl font-medium mb-12 leading-relaxed">{content.subHeadline || content.description}</p>
                                <div className={`flex flex-wrap gap-4 ${isCentered ? 'justify-center' : ''}`}>
                                    <button onClick={() => navigate(getDashboardPath())} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95">{content.ctaPrimaryText || 'Get Started'}</button>
                                    {content.secondaryText && <button className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all border border-slate-700 active:scale-95">{content.secondaryText}</button>}
                                </div>
                            </Motion.div>
                            {!isCentered && (
                                <div className={`md:col-span-6 ${isReverse ? 'md:order-1' : ''}`}>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full group-hover:bg-indigo-600/30 transition-all" />
                                        {content.heroImage ? (
                                            <img src={content.heroImage} alt="Hero" className="relative z-10 rounded-3xl border border-white/5 shadow-2xl transition-transform hover:scale-[1.02]" />
                                        ) : (
                                            <div className="relative z-10 aspect-video rounded-3xl bg-slate-900/50 border border-white/5 flex items-center justify-center backdrop-blur-sm"><Layout className="w-12 h-12 text-slate-700" /></div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                );
            }
            case 'FEATURES': {
                const layout = content.layout || 'grid';
                const gridCols = content.gridCols || 3;
                return (
                    <section key={section.id} className="py-24 px-6 relative z-10 bg-slate-950/20">
                        <div className="max-w-[1200px] mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 tracking-tighter" style={{ fontFamily: 'Inter' }}>{content.sectionTitle || content.headline}</h2>
                            <div className={layout === 'list' ? 'space-y-6' : layout === 'bento' ? 'grid grid-cols-1 md:grid-cols-3 gap-8' : `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${gridCols} gap-8`}>
                                {(content.items || []).map((it, i) => (
                                    <div key={i} className={`p-8 bg-[#0f172a] border border-white/5 rounded-[2rem] hover:border-indigo-500/30 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] group relative overflow-hidden ${layout === 'list' ? 'flex items-center gap-8' :
                                        layout === 'bento' && (i === 0 || i === 3) ? 'md:col-span-2' : ''
                                        }`}>
                                        <div className={`bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform shrink-0 ${layout === 'list' ? 'w-16 h-16' : 'w-12 h-12 mb-6'}`}>
                                            {(() => { const Icon = iconMap[it.icon?.toLowerCase()] || Zap; return <Icon className="w-6 h-6 text-indigo-500" />; })()}
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">{it.title}</h3>
                                            <p className="text-slate-400 font-medium leading-relaxed">{it.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                );
            }
            case 'CONTENT_BLOCK': {
                const isImageRight = layout === 'image_right';
                return (
                    <section key={section.id} className="py-24 px-6 relative z-10">
                        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-20 items-center">
                            <div className={isImageRight ? 'order-1' : 'order-2'}>
                                <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tighter leading-tight" style={{ fontFamily: 'Inter' }}>{content.heading}</h2>
                                <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">{content.description}</p>
                            </div>
                            <div className={isImageRight ? 'order-2' : 'order-1'}>
                                <div className="relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                                    {content.image ? (
                                        <img src={content.image} alt="Block" className="w-full h-auto" />
                                    ) : (
                                        <div className="aspect-square bg-slate-900/50 flex items-center justify-center"><ImageIcon className="w-12 h-12 text-slate-700" /></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                );
            }
            case 'FAQ': return (
                <section key={section.id} className="py-24 px-6 bg-slate-950/40 relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12 tracking-tighter" style={{ fontFamily: 'Inter' }}>{content.sectionTitle}</h2>
                        <div className="space-y-4">
                            {(content.items || []).map((it, i) => <FAQItem key={i} q={it.question} a={it.answer} />)}
                        </div>
                    </div>
                </section>
            );
            case 'CTA': {
                const layout = content.layout || 'banner';
                return (
                    <section key={section.id} className="py-24 px-6 relative z-10">
                        <div className={`max-w-[1200px] mx-auto transition-all ${layout === 'card' ? 'max-w-3xl p-12 bg-slate-900/40 border border-white/5 rounded-[3rem] shadow-2xl' :
                            layout === 'split' ? 'p-12 md:p-20 bg-slate-900 border border-white/5 rounded-[4rem] flex flex-col md:flex-row items-center gap-12 text-left' :
                                'p-12 md:p-24 bg-indigo-600 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group'
                            }`}>
                            {layout === 'banner' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />}

                            <div className={`space-y-8 ${layout === 'split' ? 'flex-1' : ''}`}>
                                <h2 className={`font-bold tracking-tighter ${layout === 'banner' ? 'text-4xl md:text-6xl text-white' : 'text-3xl md:text-5xl text-white'}`} style={{ fontFamily: 'Inter' }}>{content.headline}</h2>
                                <p className={`text-lg md:text-xl font-medium max-w-2xl ${layout === 'banner' ? 'text-white/80 mx-auto' : 'text-slate-400'} ${layout === 'split' ? '' : 'mx-auto'}`}>{content.subHeadline}</p>
                            </div>

                            <div className={`flex flex-col gap-4 ${layout === 'split' ? 'w-full md:w-80' : 'mt-12 items-center'}`}>
                                {layout === 'split' && (
                                    <input type="email" placeholder="enter your email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                                )}
                                <button onClick={() => navigate(getDashboardPath())} className={`px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-xl active:scale-95 ${layout === 'banner' ? 'bg-white text-indigo-600 hover:bg-slate-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 w-full'
                                    }`}>
                                    {user ? 'Go to Dashboard' : content.buttonText || 'Get Started'}
                                </button>
                            </div>
                        </div>
                    </section>
                );
            }
            case 'TERMINAL': return (
                <section key={section.id} className="py-24 px-6 relative z-10">
                    <div className="max-w-4xl mx-auto bg-slate-900/50 border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-lg">
                        <div className="flex gap-2 mb-6 border-b border-white/5 pb-4"><div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/30" /><div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30" /><div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" /></div>
                        <div className="space-y-6">{(content.mockMessages || content.messages || []).map((m, i) => <div key={i} className={`flex gap-4 ${m.role === 'ai' ? 'flex-row' : 'flex-row-reverse text-right'}`}><div className={`p-4 rounded-2xl max-w-[80%] ${m.role === 'ai' ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'}`}><p className="text-sm">{m.text}</p></div></div>)}</div>
                    </div>
                </section>
            );
            case 'AUDIENCE_STATS': {
                const layout = content.layout || 'cards';
                const gridCols = content.gridCols || 3;
                return (
                    <section key={section.id} className="py-24 px-6 relative z-10">
                        <div className="max-w-[1200px] mx-auto">
                            <div className={`mb-16 ${layout === 'highlight' ? 'text-center' : ''}`}>
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4" style={{ fontFamily: 'Inter' }}>{content.headline}</h2>
                                {content.subHeadline && <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">{content.subHeadline}</p>}
                            </div>
                            <div className={layout === 'highlight' ? 'space-y-8' : `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${gridCols} gap-8`}>
                                {(content.items || []).map((item, idx) => (
                                    <div key={idx} className={`relative p-8 rounded-3xl border transition-all ${layout === 'minimal' ? 'border-l-4 border-l-indigo-500 border-white/5 bg-slate-900/20' :
                                        layout === 'highlight' && idx === 0 ? 'bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-600/20 p-12' :
                                            'bg-slate-900/40 border-white/5 hover:border-indigo-500/30'
                                        }`}>
                                        <div className={`text-4xl md:text-5xl font-black mb-2 ${layout === 'highlight' && idx === 0 ? 'text-white' : 'text-indigo-500'}`}>
                                            {item.value}<span className="text-xl font-bold ml-1 opacity-70">{item.suffix}</span>
                                        </div>
                                        <div className={`text-sm font-bold uppercase tracking-widest ${layout === 'highlight' && idx === 0 ? 'text-indigo-100' : 'text-slate-400'}`}>
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                );
            }
            case 'BENTO_GRID': return (
                <section key={section.id} className="py-24 px-6 relative z-10">
                    <div className="max-w-[1200px] mx-auto">
                        <MagicBento />
                    </div>
                </section>
            );
            case 'TECH_STACK': return (
                <section key={section.id} className="py-24 px-6 relative z-10 bg-slate-950/20">
                    <div className="max-w-[1200px] mx-auto text-center">
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-indigo-500 mb-12 italic">{content.headline || 'Trusted by innovative teams worldwide'}</h2>
                        <LogoLoop logos={techLogos} logoHeight={40} gap={60} speed={40} />
                    </div>
                </section>
            );
            case 'INTEGRATIONS': return (
                <section key={section.id} className="py-24 px-6 relative z-10">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4" style={{ fontFamily: 'Inter' }}>{content.headline || 'Native Integrations'}</h2>
                            <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">{content.subHeadline}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {(content.items || []).map((item, idx) => (
                                <div key={idx} className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col items-center gap-4 group hover:border-indigo-500/30 transition-all">
                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><Layers className="w-6 h-6 text-indigo-500" /></div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{item.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );
            case 'HOW_IT_WORKS': return (
                <section key={section.id} className="py-24 px-6 relative z-10">
                    <div className="max-w-[1200px] mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 tracking-tighter" style={{ fontFamily: 'Inter' }}>{content.headline || 'How it works'}</h2>
                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {(content.items || []).map((item, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="text-8xl font-black text-white/5 absolute -top-12 -left-4 z-0 italic group-hover:text-indigo-500/10 transition-colors">{idx + 1}</div>
                                    <div className="relative z-10 space-y-4">
                                        <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">{item.title}</h3>
                                        <p className="text-slate-400 font-medium leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );
            case 'TESTIMONIALS': return (
                <section key={section.id} className="py-24 px-6 relative z-10 bg-slate-950/20">
                    <div className="max-w-[1200px] mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 tracking-tighter" style={{ fontFamily: 'Inter' }}>{content.headline || 'Social Proof'}</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {(content.items || []).map((item, idx) => (
                                <div key={idx} className="p-8 bg-slate-900/40 border border-white/5 rounded-[2rem] space-y-6 hover:border-indigo-500/30 transition-all">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-amber-500 fill-amber-500" />)}
                                    </div>
                                    <p className="text-slate-300 font-medium italic leading-relaxed">"{item.description}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30" />
                                        <div>
                                            <div className="text-sm font-bold text-white uppercase tracking-widest">{item.title}</div>
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">{item.label || 'Customer'}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );
            case 'PRICING': return (
                <section key={section.id} className="py-24 px-6 relative z-10">
                    <div className="max-w-[1200px] mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 tracking-tighter" style={{ fontFamily: 'Inter' }}>{content.headline || 'Simple Pricing'}</h2>
                        <div className="grid md:grid-cols-3 gap-8 items-end">
                            {(content.items || []).map((item, idx) => (
                                <div key={idx} className={`p-8 rounded-[3rem] border transition-all ${idx === 1 ? 'bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-600/20 text-white scale-105 z-10 h-full flex flex-col' : 'bg-slate-900/40 border-white/5 text-white'}`}>
                                    <div className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-70">{item.title}</div>
                                    <div className="text-5xl font-black mb-8">$00<span className="text-lg opacity-60">/mo</span></div>
                                    <ul className="space-y-4 mb-10 flex-1">
                                        <li className="flex items-center gap-3 text-sm font-bold italic"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Feature A</li>
                                        <li className="flex items-center gap-3 text-sm font-bold italic"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Feature B</li>
                                        <li className="flex items-center gap-3 text-sm font-bold italic"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Feature C</li>
                                    </ul>
                                    <button className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${idx === 1 ? 'bg-white text-indigo-600' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}>Get Started</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );
            case 'NEWSLETTER': return (
                <section key={section.id} className="py-24 px-6 relative z-10">
                    <div className="max-w-[1200px] mx-auto p-12 md:p-24 bg-slate-900/40 border border-white/5 rounded-[4rem] text-center shadow-2xl">
                        <div className="space-y-6 mb-12">
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter" style={{ fontFamily: 'Inter' }}>{content.headline || 'Stay Ahead'}</h2>
                            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">{content.subHeadline}</p>
                        </div>
                        <div className="max-w-xl mx-auto flex flex-col md:flex-row gap-4">
                            <input type="email" placeholder="enter your email" className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600" />
                            <button className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl active:scale-95">{content.buttonText || 'Join'}</button>
                        </div>
                    </div>
                </section>
            );
            case 'STORE_LIST': return <StoreNetwork key={section.id} layout={content.layout} headline={content.headline || content.sectionTitle} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden" style={{ fontFamily: 'Inter' }}>
            {/* Design Tokens: Subtle Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full" />
                <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-indigo-500/5 blur-[120px] rounded-full" />
            </div>

            <header className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/70 backdrop-blur-xl border-b border-white/5">
                <nav className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-indigo-600/20"><Zap className="w-5 h-5 text-white" /></div>
                        <span className="font-bold text-xl italic tracking-tighter">{shortName}<span className="text-indigo-500">AI</span></span>
                    </div>
                    <div className="hidden md:flex gap-10 text-sm font-bold text-slate-400 absolute left-1/2 -translate-x-1/2">
                        <Link to="/" className="hover:text-white transition-colors">Product</Link>
                        <Link to="/" className="hover:text-white transition-colors">Features</Link>
                        <Link to="/" className="hover:text-white transition-colors">Showcase</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {!user ? (
                            <>
                                <Link to={PATHS.LOGIN} className="hidden md:block text-sm font-bold text-slate-400 hover:text-white px-2">Log In</Link>
                                <Link to={PATHS.REGISTER} className="px-6 py-2.5 bg-white text-slate-950 rounded-full text-sm font-bold hover:bg-slate-100 transition-all shadow-lg active:scale-95">Get Started</Link>
                            </>
                        ) : (
                            <Link to={getDashboardPath()} className="px-8 py-3 bg-indigo-600 text-white rounded-full text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 uppercase tracking-widest italic flex items-center gap-2 group">
                                <Users className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                Dashboard
                            </Link>
                        )}
                    </div>
                </nav>
            </header>

            <main className="relative pt-20">
                {loading ? (
                    <div className="flex items-center justify-center py-40 animate-pulse"><Zap className="w-10 h-10 text-indigo-500" /></div>
                ) : sections.length > 0 ? (
                    sections.map(s => renderSection(s))
                ) : (
                    <section className="py-40 px-6 text-center">
                        <h1 className="text-5xl font-bold mb-6 tracking-tighter" style={{ fontFamily: 'Inter' }}>Welcome to {companyName}</h1>
                        <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">The modern standard for AI-native retail success. Start building your custom experience in the CMS portal.</p>
                        <button onClick={() => navigate(getDashboardPath())} className="px-8 py-4 bg-indigo-600 rounded-xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                            {user ? 'Go to Dashboard' : 'Get Started'}
                        </button>
                    </section>
                )}
            </main>

            <footer className="py-24 px-6 border-t border-white/5 bg-[#020617] relative z-10">
                <div className="max-w-[1200px] mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-8"><div className="w-6 h-6 bg-indigo-600/20 rounded flex items-center justify-center"><Zap className="w-4 h-4 text-indigo-500" /></div><span className="font-bold italic text-lg">{shortName}AI</span></div>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed uppercase tracking-widest text-[10px]">Built for the future of intelligent retail management.</p>
                        </div>
                        <div><h4 className="font-bold text-sm text-white mb-6 uppercase tracking-wider">Product</h4><ul className="space-y-4 text-slate-500 text-sm font-medium italic"><li>Concierge AI</li><li>Stock Radar</li><li>Live Connect</li></ul></div>
                        <div><h4 className="font-bold text-sm text-white mb-6 uppercase tracking-wider">Company</h4><ul className="space-y-4 text-slate-500 text-sm font-medium italic"><li>About Us</li><li>Careers</li><li>Press</li></ul></div>
                        <div><h4 className="font-bold text-sm text-white mb-6 uppercase tracking-wider">Legal</h4><ul className="space-y-4 text-slate-500 text-sm font-medium italic"><li>Privacy</li><li>Terms</li><li>Security</li></ul></div>
                    </div>
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                        <div>© {new Date().getFullYear()} {companyName}. All rights reserved.</div>
                        <div className="flex gap-8"><a href="#" className="hover:text-white transition-colors">Twitter</a><a href="#" className="hover:text-white transition-colors">GitHub</a><a href="#" className="hover:text-white transition-colors">LinkedIn</a></div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const StoreNetwork = ({ layout, headline }) => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await api.get('/public/owners/list?limit=10');
                if (response.data.status === 'success' && response.data.owners) {
                    setStores(response.data.owners);
                }
            } catch (error) {
                console.error('Failed to fetch stores:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    if (loading || stores.length === 0) return null;

    if (layout === 'marquee') {
        const logoItems = stores.map(store => ({
            id: store.id,
            node: (
                <div onClick={() => navigate(`/${store.domain}`)} className="group flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all cursor-pointer">
                    <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:scale-110 transition-all">
                        <Store className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-white group-hover:text-indigo-200">{store.name}</span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{store.businessCategory || 'RETAIL'}</span>
                    </div>
                </div>
            )
        }));

        return (
            <div className="w-full py-12 relative z-10">
                <div className="max-w-[1200px] mx-auto px-6 mb-12 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{headline || 'Live Partner Network'}</span>
                </div>
                <LogoLoop logos={logoItems} speed={30} logoHeight={80} gap={40} pauseOnHover fadeOut />
            </div>
        );
    }

    return (
        <section className="py-24 px-6 relative z-10 bg-slate-950/20">
            <div className="max-w-[1200px] mx-auto">
                <div className="mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white uppercase italic" style={{ fontFamily: 'Inter' }}>{headline || 'Our Network'}</h2>
                    <div className="h-1.5 w-20 bg-indigo-500 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stores.map(store => (
                        <div key={store.id} onClick={() => navigate(`/${store.domain}`)} className="group p-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:rotate-12 transition-all">
                                    <Store className="w-7 h-7 text-indigo-500 group-hover:text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-tighter">{store.name}</h3>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">{store.businessCategory || 'RETAIL'}</p>
                                <div className="mt-8 flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                    Visit Store <ArrowUpRight className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-white/5 rounded-2xl bg-slate-900/40 overflow-hidden hover:border-white/10 transition-all">
            <button onClick={() => setOpen(!open)} className="w-full px-8 py-6 flex justify-between items-center text-left group">
                <span className="font-bold text-slate-300 group-hover:text-white transition-colors italic">{q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {open && (
                    <Motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-8 pb-6 text-slate-500 text-base leading-relaxed border-t border-white/5 pt-4">{a}</div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ImageIcon = (props) => <Layout {...props} />;

export default Landing;
