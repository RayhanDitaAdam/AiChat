import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Save, Trash2, Eye, EyeOff,
    GripVertical, Edit2, Layout, Zap, MessageSquare,
    Globe, Sparkles, CheckCircle2, Settings,
    Monitor, Quote, MonitorPlay, UploadCloud, Users,
    ChevronRight, Layers, ArrowLeft, Maximize2, Minimize2,
    Type, Image as ImageIcon, MousePointer2, Move, Grid3X3,
    Hash, Store
} from 'lucide-react';
import { Reorder, motion as Motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Swal from 'sweetalert2';

// --- Shared Constants ---
const SECTION_TYPES = [
    { type: 'HEADER', icon: MousePointer2, label: 'Navigation Header' },
    { type: 'HERO', icon: Sparkles, label: 'Hero Section' },
    { type: 'FEATURES', icon: Zap, label: 'Features Grid' },
    { type: 'CONTENT_BLOCK', icon: Layout, label: 'Content Block' },
    { type: 'TERMINAL', icon: Monitor, label: 'Chat Preview' },
    { type: 'AUDIENCE_STATS', icon: Users, label: 'Audience & Stats' },
    { type: 'BENTO_GRID', icon: Layout, label: 'Bento Grid' },
    { type: 'TECH_STACK', icon: Globe, label: 'Tech Stack' },
    { type: 'INTEGRATIONS', icon: Layers, label: 'Ecosystem Sync' },
    { type: 'HOW_IT_WORKS', icon: Move, label: 'Step Sequence' },
    { type: 'TESTIMONIALS', icon: Quote, label: 'Testimonials' },
    { type: 'PRICING', icon: Hash, label: 'Pricing Tiers' },
    { type: 'NEWSLETTER', icon: UploadCloud, label: 'Intel Subscription' },
    { type: 'FAQ', icon: MessageSquare, label: 'FAQ Accordion' },
    { type: 'CTA', icon: CheckCircle2, label: 'Call to Action' },
    { type: 'STORE_LIST', icon: Store, label: 'Store Network' },
    { type: 'FOOTER', icon: Layout, label: 'Page Footer' }
];

const LAYOUT_TEMPLATES = {
    HERO: [
        { id: 'split', icon: Layout, label: 'Split Bio' },
        { id: 'centered', icon: Monitor, label: 'Centered' },
        { id: 'split_reverse', icon: Layers, label: 'Reverse Split' }
    ],
    FEATURES: [
        { id: 'grid', icon: Grid3X3, label: 'Standard Grid' },
        { id: 'list', icon: Move, label: 'Vertical List' },
        { id: 'bento', icon: Layout, label: 'Bento Style' }
    ],
    AUDIENCE_STATS: [
        { id: 'cards', icon: Layout, label: 'Card Pack' },
        { id: 'minimal', icon: Hash, label: 'Plain Text' },
        { id: 'highlight', icon: Zap, label: 'High Focus' }
    ],
    CTA: [
        { id: 'banner', icon: Layout, label: 'Wide Banner' },
        { id: 'card', icon: Layers, label: 'Floating Card' },
        { id: 'split', icon: Grid3X3, label: 'Split Input' }
    ],
    STORE_LIST: [
        { id: 'marquee', icon: Move, label: 'Infinite Scroll' },
        { id: 'grid', icon: Grid3X3, label: 'Static Directory' }
    ]
};

// --- Styled Sub-components ---
const Field = ({ label, children }) => (
    <div className="mb-6">
        <label className="block mb-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">{label}</label>
        {children}
    </div>
);

const Input = ({ ...props }) => (
    <input {...props} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 sm:text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full p-4 dark:text-white transition-all shadow-sm font-medium" />
);

const LandingCMS = () => {
    const [sections, setSections] = useState([]);
    const [config, setConfig] = useState({
        pageTitle: '', faviconUrl: '', floatingWhatsAppNumber: '', maintenanceMode: false, themeMode: 'dark'
    });
    const [activeTab, setActiveTab] = useState('sections');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeEditId, setActiveEditId] = useState(null);
    const [lastAutoSave, setLastAutoSave] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [sectionsRes, configRes] = await Promise.all([
                api.get('/landing/admin/sections'),
                api.get('/landing/admin/config')
            ]);
            setSections(sectionsRes.data.sort((a, b) => a.order - b.order));
            setConfig(configRes.data);
        } catch {
            Swal.fire('Error', 'Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAutoSave = useCallback(async () => {
        if (activeEditId) {
            const section = sections.find(s => s.id === activeEditId);
            if (section) {
                try {
                    await api.post(`/landing/admin/sections/${activeEditId}/draft`, section);
                    setLastAutoSave(new Date().toLocaleTimeString());
                } catch (err) { console.error('Auto-save err', err); }
            }
        }
    }, [activeEditId, sections]);

    useEffect(() => {
        const interval = setInterval(() => {
            handleAutoSave();
        }, 60000);
        return () => clearInterval(interval);
    }, [handleAutoSave]);

    const handleSaveDraft = async (section) => {
        try {
            setSaving(true);
            await api.post(`/landing/admin/sections/${section.id}/draft`, section);
            Swal.fire({ icon: 'success', title: 'Draft Saved', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
            fetchData();
        } catch { Swal.fire('Error', 'Failed to save', 'error'); }
        finally { setSaving(false); }
    };

    const handlePublish = async (id) => {
        const result = await Swal.fire({ title: 'Publish Changes?', text: "This will make your draft live.", icon: 'question', showCancelButton: true, confirmButtonColor: '#4f46e5', confirmButtonText: 'Yes, Publish!' });
        if (result.isConfirmed) {
            try {
                setSaving(true);
                await api.post(`/landing/admin/sections/${id}/publish`);
                Swal.fire('Published!', 'Live now!', 'success');
                setActiveEditId(null);
                fetchData();
            } catch { Swal.fire('Error', 'Failed', 'error'); }
            finally { setSaving(false); }
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            await api.patch(`/landing/admin/sections/${id}/active`, { isActive: !currentStatus });
            setSections(sections.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
            Swal.fire({ icon: 'success', title: 'Visibility Updated', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
        } catch { Swal.fire('Error', 'Failed', 'error'); }
    };

    const deleteSection = async (id) => {
        const result = await Swal.fire({ title: 'Delete Section?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#e02424', confirmButtonText: 'Yes, Delete' });
        if (result.isConfirmed) {
            try {
                await api.delete(`/landing/admin/sections/${id}`);
                setSections(sections.filter(s => s.id !== id));
                if (activeEditId === id) setActiveEditId(null);
                Swal.fire('Deleted!', '', 'success');
            } catch { Swal.fire('Error', 'Failed', 'error'); }
        }
    };

    const addNewSection = async (type) => {
        try {
            const response = await api.post('/landing/admin/sections', { type, title: `New ${type}`, content: {}, order: sections.length, isActive: true });
            setSections([...sections, response.data]);
            setActiveEditId(response.data.id);
        } catch { Swal.fire('Error', 'Failed', 'error'); }
    };

    const saveOrder = async (newSections) => {
        try {
            const reorderData = newSections.map((s, index) => ({ id: s.id, order: index }));
            await api.post('/landing/admin/sections/reorder', reorderData);
        } catch { Swal.fire('Error', 'Failed Reorder', 'error'); }
    };

    const updateSectionContent = (id, newContent) => {
        setSections(sections.map(s => s.id === id ? { ...s, content: newContent, status: 'DRAFT' } : s));
    };

    const selectedSection = sections.find(s => s.id === activeEditId);

    if (loading) return (
        <div className="flex bg-gray-50 dark:bg-gray-950 items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className={`fixed inset-0 z-[100] bg-gray-50 dark:bg-black flex flex-col font-sans transition-all overflow-hidden ${isFullscreen ? 'p-0' : 'p-4 sm:p-8'}`}>
            {/* Design Toolbar */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center px-6 justify-between shrink-0 shadow-lg z-50">
                <div className="flex items-center gap-6">
                    <button onClick={() => window.history.back()} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                    <div className="h-6 w-[1.5px] bg-gray-200 dark:bg-gray-800" />
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white"><Layers className="w-5 h-5" /></div>
                        <div>
                            <h1 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">Site <span className="text-indigo-600">Architect</span></h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Architectural Workspace</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {lastAutoSave && (
                        <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700 font-mono">
                            Sync: {lastAutoSave}
                        </div>
                    )}
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                    <div className="h-6 w-[1.5px] bg-gray-200 dark:bg-gray-800" />
                    <button onClick={async () => {
                        try {
                            const res = await api.post('/landing/admin/config/preview-token');
                            window.open(`/?preview=true&token=${res.data.token}`, '_blank');
                        } catch { Swal.fire('Error', 'Failed Preview', 'error'); }
                    }} className="flex items-center gap-2 px-6 py-2.5 text-xs font-black text-white bg-black dark:bg-indigo-600 rounded-xl hover:bg-gray-900 dark:hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 transition-all active:scale-95 uppercase tracking-widest">
                        <MonitorPlay className="w-4 h-4" /> Live Review
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Section Library Sidebar */}
                <aside className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0 overflow-y-auto hidden lg:flex">
                    <div className="p-8 space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-6">Building Blocks</h3>
                            <div className="space-y-2">
                                {SECTION_TYPES.map((st) => (
                                    <button key={st.type} onClick={() => addNewSection(st.type)} className="flex items-center gap-4 w-full p-4 text-left rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 group transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                            <st.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-none">{st.label}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">Add to page</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-6">Global Styles</h3>
                            <button onClick={() => setActiveTab('config')} className={`flex items-center gap-4 w-full p-5 text-left rounded-2xl transition-all ${activeTab === 'config' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 ring-4 ring-indigo-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                                <Settings className={`w-5 h-5 animate-pulse ${activeTab === 'config' ? 'text-white' : 'text-gray-400'}`} />
                                <div className="flex-1">
                                    <p className="text-xs font-black uppercase tracking-tight">System Config</p>
                                    <p className={`text-[9px] uppercase tracking-widest mt-1 font-bold ${activeTab === 'config' ? 'text-indigo-100' : 'text-gray-400'}`}>Branding & Settings</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Wireframe Canvas */}
                <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-black p-12 scroll-smooth">
                    <div className="max-w-[1100px] mx-auto min-h-full bg-white dark:bg-gray-950 shadow-2xl rounded-t-[3rem] border-x border-t border-gray-200 dark:border-gray-800 p-8 pt-12 pb-40">
                        <div className="flex items-center justify-between mb-12 px-4 opacity-50">
                            <div className="flex item-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-indigo-400" />
                                <div className="w-3 h-3 rounded-full bg-indigo-300" />
                                <div className="w-3 h-3 rounded-full bg-indigo-200" />
                            </div>
                            <div className="px-6 py-1.5 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Architectural Flow Canvas</div>
                        </div>

                        <Reorder.Group axis="y" values={sections} onReorder={(newOrder) => { setSections(newOrder); saveOrder(newOrder); }} className="space-y-6">
                            <AnimatePresence initial={false}>
                                {sections.length > 0 ? sections.map((section) => (
                                    <Reorder.Item key={section.id} value={section}
                                        className={`relative group bg-white dark:bg-gray-900 border-2 transition-all cursor-pointer overflow-hidden ${activeEditId === section.id ? 'border-indigo-600 z-10 scale-[1.01] shadow-2xl rounded-3xl ring-8 ring-indigo-500/5' : 'border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:rounded-2xl hover:shadow-lg'}`}
                                        onClick={() => { setActiveEditId(section.id); setActiveTab('sections'); }}
                                    >
                                        <div className="flex flex-col">
                                            {/* Block Header Toolbar */}
                                            <div className="flex items-center justify-between px-8 py-4 bg-gray-50/50 dark:bg-gray-900/80 border-b border-gray-50 dark:border-gray-800">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors shadow-sm border border-gray-100 dark:border-gray-700">
                                                        {(() => { const Icon = SECTION_TYPES.find(t => t.type === section.type)?.icon || Type; return <Icon className="w-4.5 h-4.5" />; })()}
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest leading-none">{section.title || section.type}</span>
                                                        <span className="ml-3 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-[8px] font-bold text-gray-400 rounded-md uppercase tracking-tight">{section.type}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={(e) => { e.stopPropagation(); toggleActive(section.id, section.isActive); }} className={`p-1.5 rounded-md ${section.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}>{section.isActive ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}</button>
                                                        <button onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} className="p-1.5 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-md"><Trash2 className="w-4.5 h-4.5" /></button>
                                                    </div>
                                                    <div className="text-gray-200 dark:text-gray-700 group-hover:text-indigo-400 cursor-move transition-colors pl-4 border-l border-gray-100 dark:border-gray-800"><GripVertical className="w-6 h-6" /></div>
                                                </div>
                                            </div>

                                            {/* Block Content Mockup */}
                                            <div className="p-10">
                                                {(() => {
                                                    const { type, content } = section;
                                                    const gridCols = content.gridCols || 3;
                                                    const items = content.items || [{}, {}, {}];

                                                    if (type === 'HEADER') {
                                                        return (
                                                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6 opacity-60">
                                                                <div className="text-sm font-black tracking-tighter uppercase">{content.logoText || 'LOGO'}</div>
                                                                <div className="flex gap-6 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                                                    {(content.links || []).map(l => <span key={l.id || l.label}>{l.label}</span>)}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'HERO') {
                                                        return (
                                                            <div className={`flex gap-12 items-center ${content.layout === 'centered' ? 'flex-col text-center' : content.layout === 'split_reverse' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                                <div className="flex-1 space-y-6">
                                                                    <div className={`h-2 w-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full ${content.layout === 'centered' ? 'mx-auto' : ''}`} />
                                                                    <div className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight bg-gray-50 dark:bg-gray-800/30 px-6 py-3 rounded-2xl inline-block shadow-sm">
                                                                        {content.headline || 'HERO_HEADLINE_STUB'}
                                                                    </div>
                                                                    <p className={`text-xs text-gray-400 font-medium leading-relaxed max-w-lg ${content.layout === 'centered' ? 'mx-auto' : ''}`}>
                                                                        {content.subHeadline || 'Architectural description of the primary value proposition.'}
                                                                    </p>
                                                                    <div className={`flex gap-3 pt-4 ${content.layout === 'centered' ? 'justify-center' : ''}`}>
                                                                        <div className="px-8 py-4 bg-indigo-600 rounded-2xl border-2 border-indigo-500 shadow-xl shadow-indigo-600/20 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                                            {content.ctaText || 'ACTION'} <ChevronRight className="w-3.5 h-3.5" />
                                                                        </div>
                                                                        <div className="h-12 w-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner" />
                                                                    </div>
                                                                </div>
                                                                {content.layout !== 'centered' && <div className="w-80 h-56 bg-white dark:bg-gray-800 rounded-[3rem] border-4 border-gray-50 dark:border-gray-950 flex items-center justify-center shadow-2xl relative overflow-hidden">
                                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
                                                                    <ImageIcon className="w-16 h-16 text-gray-100 dark:text-gray-900 relative z-10" />
                                                                </div>}
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'AUDIENCE_STATS') {
                                                        const layout = content.layout || 'cards';
                                                        return (
                                                            <div className="space-y-10">
                                                                <div className={`space-y-4 ${layout === 'highlight' ? 'text-center' : ''}`}>
                                                                    <div className={`h-2 w-24 bg-indigo-100 dark:bg-indigo-950 rounded-full ${layout === 'highlight' ? 'mx-auto' : ''}`} />
                                                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight bg-gray-50 dark:bg-gray-800/30 px-4 py-1 rounded-lg inline-block">{content.headline || 'ARCHITECTURAL_STATS'}</h4>
                                                                    {content.subHeadline && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">{content.subHeadline}</p>}
                                                                </div>
                                                                <div className={layout === 'highlight' ? 'space-y-6' : 'grid gap-6'} style={layout !== 'highlight' ? { gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` } : {}}>
                                                                    {items.map((item, idx) => (
                                                                        <div key={item.id || idx} className={`relative transition-all ${layout === 'minimal' ? 'flex flex-col border-l-4 border-indigo-500 pl-6 py-2' :
                                                                            layout === 'highlight' && idx === 0 ? 'bg-indigo-600 text-white p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-600/20 scale-105 mb-8' :
                                                                                'bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 flex flex-col justify-center items-center text-center shadow-sm'
                                                                            } group/item`}>
                                                                            <div className={`${layout === 'highlight' && idx === 0 ? 'text-6xl' : 'text-3xl'} font-black ${layout === 'highlight' && idx === 0 ? 'text-white' : 'text-gray-900 dark:text-white'} uppercase flex items-center gap-1`}>
                                                                                {item.value || '00'}
                                                                                <span className={`${layout === 'highlight' && idx === 0 ? 'text-indigo-200' : 'text-indigo-600'} text-sm font-black`}>{item.suffix || ''}</span>
                                                                            </div>
                                                                            <div className={`text-[10px] font-black ${layout === 'highlight' && idx === 0 ? 'text-indigo-100' : 'text-gray-400'} uppercase tracking-widest`}>{item.label || 'STAT_LABEL'}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'TERMINAL') {
                                                        return (
                                                            <div className="space-y-8">
                                                                <div className="space-y-4">
                                                                    <div className="h-1.5 w-20 bg-emerald-100 dark:bg-emerald-950 rounded-full" />
                                                                    <h4 className="text-sm font-black uppercase tracking-tighter bg-gray-50 dark:bg-gray-800/30 px-4 py-1 rounded-lg inline-block">{content.headline || 'TERMINAL_PREVIEW'}</h4>
                                                                </div>
                                                                <div className="bg-gray-900 rounded-[2.5rem] border-4 border-gray-800 overflow-hidden shadow-2xl">
                                                                    <div className="h-10 bg-gray-800 flex items-center px-6 gap-2">
                                                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                                                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                                                                        <div className="ml-4 h-4 w-40 bg-gray-700 rounded-full opacity-30" />
                                                                    </div>
                                                                    <div className="p-8 space-y-4 font-mono">
                                                                        {(content.mockMessages || []).map(m => (
                                                                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                                                <div className={`max-w-[80%] p-4 rounded-2xl text-[10px] ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}>
                                                                                    {m.text}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'INTEGRATIONS') {
                                                        return (
                                                            <div className="space-y-10">
                                                                <div className="text-center space-y-4">
                                                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] opacity-40 italic">{content.headline || 'ECOSYSTEM'}</h4>
                                                                </div>
                                                                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                                                                    {items.map((item, idx) => (
                                                                        <div key={item.id || idx} className="p-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl flex flex-col items-center gap-3 grayscale opacity-40 hover:opacity-100 transition-opacity">
                                                                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm"><Layers className="w-6 h-6 text-gray-300" /></div>
                                                                            <span className="text-[9px] font-black uppercase tracking-tighter text-center line-clamp-1">{item.title}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'HOW_IT_WORKS') {
                                                        return (
                                                            <div className="space-y-12">
                                                                <h4 className="text-sm font-black uppercase tracking-tight bg-gray-50 dark:bg-gray-800/30 px-4 py-1 rounded-lg inline-block">{content.headline || 'CORE_PROCESS'}</h4>
                                                                <div className="grid gap-12" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                                                                    {items.map((item, idx) => (
                                                                        <div key={item.id || idx} className="relative space-y-4">
                                                                            <div className="text-5xl font-black text-gray-100 dark:text-gray-800/50 absolute -top-8 -left-4 z-0 italic">{idx + 1}</div>
                                                                            <div className="relative z-10 space-y-3">
                                                                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{item.title}</div>
                                                                                <div className="h-1 w-12 bg-indigo-50 dark:bg-indigo-900/40 rounded-full" />
                                                                                <p className="text-[9px] text-gray-400 font-medium leading-relaxed">{item.description}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'TESTIMONIALS') {
                                                        return (
                                                            <div className="space-y-10">
                                                                <h4 className="text-sm font-black uppercase tracking-tight bg-gray-50 dark:bg-gray-800/30 px-4 py-1 rounded-lg inline-block">{content.headline || 'SOCIAL_PROOF'}</h4>
                                                                <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                                                                    {items.map((item, idx) => (
                                                                        <div key={item.id || idx} className="p-8 bg-gray-50 dark:bg-gray-900/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-6">
                                                                            <div className="flex gap-1">
                                                                                {[1, 2, 3, 4, 5].map(s => <Zap key={s} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                                                                            </div>
                                                                            <p className="text-[10px] font-medium italic text-gray-500 dark:text-gray-400 leading-relaxed">"{item.description}"</p>
                                                                            <div className="flex items-center gap-3 pt-2">
                                                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-sm" />
                                                                                <div className="text-[9px] font-black uppercase tracking-widest text-gray-900 dark:text-white">{item.title}</div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'PRICING') {
                                                        return (
                                                            <div className="space-y-10">
                                                                <h4 className="text-sm font-black uppercase tracking-tight bg-gray-50 dark:bg-gray-800/30 px-4 py-1 rounded-lg inline-block">{content.headline || 'SUBSCRIPTION_MODELS'}</h4>
                                                                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                                                                    {items.map((item, idx) => (
                                                                        <div key={item.id || idx} className={`p-8 rounded-[3rem] border-2 transition-all ${idx === 1 ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/20 text-white translate-y-[-10px]' : 'bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-900 text-gray-900 dark:text-white'}`}>
                                                                            <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">{item.title}</div>
                                                                            <div className="text-3xl font-black mb-6">$00<span className="text-[10px] opacity-60">/mo</span></div>
                                                                            <div className="space-y-3 opacity-60">
                                                                                <div className="h-1.5 w-full bg-current rounded-full opacity-20" />
                                                                                <div className="h-1.5 w-3/4 bg-current rounded-full opacity-20" />
                                                                                <div className="h-1.5 w-full bg-current rounded-full opacity-20" />
                                                                            </div>
                                                                            <button className={`w-full py-4 rounded-2xl mt-8 text-[9px] font-black uppercase tracking-widest border-2 transition-all ${idx === 1 ? 'bg-white text-indigo-600 border-transparent hover:scale-105' : 'bg-transparent border-gray-100 dark:border-gray-800'}`}>Select Plan</button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'NEWSLETTER') {
                                                        return (
                                                            <div className="py-20 bg-gray-50 dark:bg-gray-900/40 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 text-center space-y-8 px-10">
                                                                <div className="space-y-3">
                                                                    <div className="h-1.5 w-16 bg-indigo-100 dark:bg-indigo-950 rounded-full mx-auto" />
                                                                    <h4 className="text-xl font-black uppercase tracking-tighter">{content.headline || 'JOIN_THE_NETWORK'}</h4>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-sm mx-auto">{content.subHeadline}</p>
                                                                </div>
                                                                <div className="max-w-md mx-auto flex gap-3">
                                                                    <div className="flex-1 h-14 bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-2xl flex items-center px-6 text-[10px] font-medium text-gray-300">architect@intel.com</div>
                                                                    <button className="px-8 h-14 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20">{content.buttonText || 'JOIN'}</button>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'TECH_STACK') {
                                                        return (
                                                            <div className="space-y-10">
                                                                <div className="text-center space-y-4">
                                                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] opacity-40 italic">{content.headline || 'CORE_STACK'}</h4>
                                                                </div>
                                                                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                                                                    {items.map((item, idx) => (
                                                                        <div key={item.id || idx} className="p-6 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl flex flex-col items-center gap-3 grayscale opacity-40">
                                                                            <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl" />
                                                                            <span className="text-[10px] font-black uppercase tracking-widest">{item.title}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'FAQ') {
                                                        return (
                                                            <div className="space-y-8">
                                                                <h4 className="text-sm font-black uppercase tracking-tight bg-gray-50 dark:bg-gray-800/30 px-4 py-1 rounded-lg inline-block">{content.headline || 'KNOWLEDGE_BASE'}</h4>
                                                                <div className="space-y-4">
                                                                    {items.map((item, idx) => (
                                                                        <div key={item.id || idx} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group/faq shadow-sm">
                                                                            <div className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.title}</div>
                                                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover/faq:text-indigo-500 transition-colors" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'STORE_LIST') {
                                                        const layout = content.layout || 'marquee';
                                                        return (
                                                            <div className="space-y-8">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{content.headline || 'Live Partner Network'}</span>
                                                                </div>
                                                                <div className={`p-8 bg-gray-50 dark:bg-gray-900/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 ${layout === 'marquee' ? 'overflow-hidden' : ''}`}>
                                                                    <div className={layout === 'marquee' ? 'flex gap-6 animate-pulse' : 'grid grid-cols-2 gap-4'}>
                                                                        {[1, 2, 3, 4].map(idx => (
                                                                            <div key={idx} className="shrink-0 flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm min-w-[200px]">
                                                                                <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-500"><Store className="w-5 h-5" /></div>
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase">Store {idx}</span>
                                                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Retail</span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'CTA') {
                                                        const layout = content.layout || 'banner';
                                                        return (
                                                            <div className={`py-20 rounded-[3.5rem] border transition-all ${layout === 'card' ? 'bg-white dark:bg-gray-900 shadow-2xl border-gray-100 dark:border-gray-800 p-12 max-w-2xl mx-auto' :
                                                                layout === 'split' ? 'bg-gray-50 dark:bg-gray-900 p-16 flex flex-col md:flex-row items-center gap-12 text-left' :
                                                                    'bg-indigo-600 border-indigo-500 p-20 text-center shadow-xl shadow-indigo-600/20 text-white'
                                                                }`}>
                                                                <div className={`space-y-6 ${layout === 'split' ? 'flex-1' : ''}`}>
                                                                    <div className={`h-1.5 w-16 rounded-full ${layout === 'banner' ? 'bg-white/20 mx-auto' : 'bg-indigo-100 dark:bg-indigo-900'} ${layout === 'card' ? 'mx-auto' : ''}`} />
                                                                    <h4 className={`${layout === 'banner' ? 'text-4xl text-white' : 'text-2xl text-gray-900 dark:text-white'} font-black uppercase tracking-tighter leading-tight`}>{content.headline || 'READY_TO_START'}</h4>
                                                                    <p className={`text-xs font-bold uppercase tracking-widest leading-relaxed ${layout === 'banner' ? 'text-indigo-100' : 'text-gray-400'} ${layout === 'split' ? 'max-w-md' : 'mx-auto max-w-sm'}`}>{content.subHeadline}</p>
                                                                </div>
                                                                <div className={`flex flex-col gap-3 ${layout === 'split' ? 'w-80' : 'mt-8'}`}>
                                                                    {layout === 'split' && (
                                                                        <div className="h-14 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl flex items-center px-4 text-[10px] text-gray-400">email@example.com</div>
                                                                    )}
                                                                    <button className={`px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-transform hover:scale-105 active:scale-95 ${layout === 'banner' ? 'bg-white text-indigo-600 shadow-2xl shadow-white/10' :
                                                                        'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                                                        }`}>
                                                                        {content.buttonText || 'START_MISSION'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'FOOTER') {
                                                        return (
                                                            <div className="pt-12 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center gap-10 opacity-40">
                                                                <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest">
                                                                    {(content.links || []).map(l => <span key={l.id || l.label}>{l.label}</span>) || []}
                                                                </div>
                                                                <div className="text-[10px] font-bold uppercase tracking-[0.2em]">{content.copyright}</div>
                                                            </div>
                                                        );
                                                    }

                                                    if (type === 'FEATURES') {
                                                        const layout = content.layout || 'grid';
                                                        return (
                                                            <div className="space-y-12">
                                                                <div className="space-y-4">
                                                                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight bg-gray-50 dark:bg-gray-800/30 px-4 py-1 rounded-lg inline-block">{content.headline || 'CORE_CAPABILITIES'}</h4>
                                                                </div>
                                                                <div className={layout === 'list' ? 'space-y-6' : 'grid gap-6'} style={layout === 'grid' ? { gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` } : layout === 'bento' ? { gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: 'minmax(140px, auto)' } : {}}>
                                                                    {items.map((item, idx) => (
                                                                        <div key={item.id || idx} className={`${layout === 'list' ? 'flex items-center gap-10 p-10 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-gray-100 dark:border-gray-800' :
                                                                            layout === 'bento' ? `p-10 bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] border border-gray-100 dark:border-gray-800 flex flex-col ${idx === 0 ? 'col-span-2 row-span-2' : idx === 3 ? 'col-span-2' : ''}` :
                                                                                'p-10 bg-gray-50 dark:bg-gray-900/40 rounded-[3rem] border border-gray-100 dark:border-gray-800 flex flex-col min-h-[220px]'
                                                                            } group/item relative overflow-hidden transition-all hover:border-indigo-500 hover:shadow-xl shadow-sm bg-white dark:bg-gray-950`}>
                                                                            {layout === 'list' && (
                                                                                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shrink-0 border-2 border-gray-50 dark:border-gray-700 shadow-xl text-indigo-500"><Zap className="w-7 h-7" /></div>
                                                                            )}
                                                                            <div className="space-y-3">
                                                                                <div className={`${layout === 'bento' && idx === 0 ? 'text-xl' : 'text-[11px]'} font-black text-gray-900 dark:text-white uppercase tracking-tight`}>{item.title || 'BLOCK_ITEM'}</div>
                                                                                <p className="text-[10px] font-medium text-gray-400 leading-relaxed line-clamp-3">{item.description}</p>
                                                                            </div>
                                                                            {layout !== 'list' && (
                                                                                <>
                                                                                    <div className="flex-1" />
                                                                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl mt-6 flex items-center justify-center border border-gray-100 dark:border-gray-700 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all"><Zap className="w-5 h-5 text-gray-300 group-hover/item:text-white" /></div>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    // Standard Grid (Bento, Tech Stack, etc. - Fallback)
                                                    return (
                                                        <div className="space-y-10">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="space-y-2">
                                                                    <div className="h-1.5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full opacity-30" />
                                                                    <h4 className="text-sm font-black uppercase tracking-tighter bg-gray-50 dark:bg-gray-800/30 px-3 py-1 rounded-lg">{content.headline || 'ARCHITECTURAL_FEATURES'}</h4>
                                                                </div>
                                                                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-full border border-indigo-100 dark:border-indigo-900 h-fit">
                                                                    <Grid3X3 className="w-3 h-3 text-indigo-500" />
                                                                    <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{gridCols} Cols</span>
                                                                </div>
                                                            </div>
                                                            <div className={`grid gap-8`} style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}>
                                                                {items.map((item, idx) => (
                                                                    <div key={item.id || idx} className="relative bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 p-8 rounded-[2.5rem] space-y-4 hover:border-indigo-400 dark:hover:border-indigo-700 transition-all shadow-sm group/item h-full flex flex-col">
                                                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-inner group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all transform group-hover/item:rotate-12">
                                                                            <Zap className="w-5 h-5 text-gray-300 group-hover/item:text-white" />
                                                                        </div>
                                                                        <div className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.title || 'BLOCK_ITEM'}</div>
                                                                        {item.description && <p className="text-[9px] font-medium text-gray-400 leading-relaxed line-clamp-2">{item.description}</p>}
                                                                        <div className="flex-1" />
                                                                        <div className="h-1.5 w-1/2 bg-gray-50 dark:bg-gray-800 rounded-full opacity-30" />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </Reorder.Item>
                                )) : (
                                    <div className="py-40 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/30 rounded-[3rem] border-4 border-dashed border-gray-200 dark:border-gray-800 hover:border-indigo-200 transition-colors shadow-inner">
                                        <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-8 shadow-2xl border-4 border-white dark:border-gray-700 animate-bounce"><Plus className="w-12 h-12 text-indigo-500" /></div>
                                        <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.5em]">Canvas Empty</h2>
                                        <p className="text-[10px] font-black text-gray-400 uppercase mt-4 max-w-[200px] text-center leading-relaxed tracking-widest">Connect architectural modules from the left-hand library to start building.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </Reorder.Group>

                        {/* Page Footer Visual */}
                        <div className="mt-32 pt-16 border-t border-gray-100 dark:border-gray-800 opacity-20 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center mb-6 shadow-inner"><Layers className="w-6 h-6" /></div>
                            <p className="text-[11px] font-black uppercase tracking-[0.4em]">Structural Page Floor</p>
                        </div>
                    </div>
                </main>

                {/* Properties Inspector Panel */}
                <aside className="w-[520px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col shadow-2xl z-40 shrink-0">
                    <AnimatePresence mode="wait">
                        {activeTab === 'config' ? (
                            <Motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
                                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/40">
                                    <div><h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Global <span className="text-indigo-600 underline decoration-indigo-200 decoration-4 underline-offset-4">Control</span></h2><p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Site-wide architectural settings</p></div>
                                    <button onClick={() => setActiveTab('sections')} className="p-3 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><Minimize2 className="w-5 h-5" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-10 space-y-10">
                                    <Field label="Site Display Title"><Input value={config.pageTitle} onChange={e => setConfig({ ...config, pageTitle: e.target.value })} /></Field>
                                    <Field label="Favicon Icon URL"><Input value={config.faviconUrl} onChange={e => setConfig({ ...config, faviconUrl: e.target.value })} /></Field>
                                    <Field label="Base Visual Theme">
                                        <select value={config.themeMode || 'dark'} onChange={e => setConfig({ ...config, themeMode: e.target.value })} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl text-xs font-black uppercase tracking-tight dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all">
                                            <option value="dark">Industrial Dark</option>
                                            <option value="light">Minimalist White</option>
                                        </select>
                                    </Field>
                                </div>
                                <div className="p-10 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30">
                                    <button onClick={async () => { try { setSaving(true); await api.post('/landing/admin/config', config); Swal.fire({ icon: 'success', title: 'Site Updated', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }); } finally { setSaving(false); } }} disabled={saving} className="w-full py-5 text-xs font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-600/40 transition-all active:scale-95 uppercase tracking-[0.3em] font-mono leading-none tracking-[0.4em]">{saving ? 'REFRESHING...' : 'COMMIT SITE'}</button>
                                </div>
                            </Motion.div>
                        ) : selectedSection ? (
                            <Motion.div key="editor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800">
                                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/40">
                                    <div><h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Block <span className="text-indigo-600 underline decoration-indigo-200 decoration-4 underline-offset-4">Inspector</span></h2><p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Refining {selectedSection.type} architectural data</p></div>
                                    <button onClick={() => setActiveEditId(null)} className="p-3 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"><Minimize2 className="w-5 h-5" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-10 space-y-12">
                                    <Field label="Component ID"><div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 font-mono text-[9px] font-black text-gray-400 uppercase tracking-widest">{selectedSection.id}</div></Field>
                                    <Field label="Local Label"><Input value={selectedSection.title || ''} onChange={(e) => setSections(sections.map(s => s.id === selectedSection.id ? { ...s, title: e.target.value } : s))} placeholder="e.g. Master Trust Metrics" /></Field>

                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2"><Move className="w-4 h-4" /> Layout Attributes</h3>
                                        <div className="p-10 bg-gray-950 rounded-[3rem] border border-gray-800 shadow-2xl space-y-10">
                                            {(() => {
                                                const { type, content } = selectedSection;
                                                const onChange = (val) => updateSectionContent(selectedSection.id, val);

                                                const isGrid = ['FEATURES', 'AUDIENCE_STATS', 'TESTIMONIALS', 'FAQ', 'BENTO_GRID', 'TECH_STACK', 'INTEGRATIONS', 'HOW_IT_WORKS', 'STORE_LIST'].includes(type);
                                                const hasLayoutPresets = LAYOUT_TEMPLATES[type] !== undefined;

                                                return (
                                                    <div className="space-y-10">
                                                        {hasLayoutPresets && (
                                                            <Field label="Structural Layout Template">
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    {LAYOUT_TEMPLATES[type].map(tmpl => (
                                                                        <button
                                                                            key={tmpl.id}
                                                                            onClick={() => onChange({ ...content, layout: tmpl.id })}
                                                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${content.layout === tmpl.id ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-gray-800 text-gray-500 hover:border-gray-700 active:scale-95'}`}
                                                                        >
                                                                            <tmpl.icon className="w-5 h-5" />
                                                                            <span className="text-[8px] font-black uppercase tracking-tighter">{tmpl.label}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </Field>
                                                        )}
                                                        {isGrid && (
                                                            <Field label="Grid Composition (Cols)">
                                                                <div className="grid grid-cols-4 gap-3">
                                                                    {[1, 2, 3, 4].map(n => (
                                                                        <button key={n} onClick={() => onChange({ ...content, gridCols: n })} className={`p-4 rounded-xl border-2 transition-all font-black text-xs ${content.gridCols === n ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-gray-800 text-gray-500 hover:border-gray-700 active:scale-95'}`}>{n}</button>
                                                                    ))}
                                                                </div>
                                                            </Field>
                                                        )}

                                                        <div className="space-y-6">
                                                            <Field label="Module Headline"><Input value={content.headline} onChange={e => onChange({ ...content, headline: e.target.value })} placeholder="Enter primary text..." /></Field>
                                                            {(type !== 'TECH_STACK' && type !== 'INTEGRATIONS') && <Field label="Context Description"><textarea value={content.subHeadline} onChange={e => onChange({ ...content, subHeadline: e.target.value })} rows={4} className="w-full p-5 bg-gray-800 border-2 border-gray-700 rounded-2xl text-xs font-medium text-gray-300 shadow-inner focus:border-indigo-500 outline-none" placeholder="Provide extra context..." /></Field>}
                                                        </div>

                                                        {isGrid && (
                                                            <div className="space-y-6">
                                                                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                                                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2"><Hash className="w-3.5 h-3.5" /> Logical Items ({content.items?.length || 0})</h4>
                                                                    <button onClick={() => { const newItems = [...(content.items || []), { id: Date.now().toString(), title: 'New Node', value: '00', suffix: '+', label: 'Metric' }]; onChange({ ...content, items: newItems }); }} className="p-2.5 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-90"><Plus className="w-4.5 h-4.5" /></button>
                                                                </div>
                                                                <Reorder.Group axis="y" values={content.items || []} onReorder={(newItems) => onChange({ ...content, items: newItems })} className="space-y-4">
                                                                    {(content.items || []).map((item, idx) => (
                                                                        <Reorder.Item key={item.id || idx} value={item} className="p-8 bg-gray-900 border border-gray-800 rounded-3xl group/item cursor-default">
                                                                            <div className="flex items-center justify-between mb-6">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="cursor-move text-gray-600 hover:text-indigo-500 transition-colors"><GripVertical className="w-5 h-5" /></div>
                                                                                    <span className="text-[9px] font-black text-indigo-500 uppercase">Item Node {idx + 1}</span>
                                                                                </div>
                                                                                <button onClick={() => { const newItems = content.items.filter((_, i) => i !== idx); onChange({ ...content, items: newItems }); }} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                {type === 'AUDIENCE_STATS' ? (
                                                                                    <>
                                                                                        <div className="col-span-1"><Field label="Value"><input value={item.value || ''} onChange={(e) => { const newItems = [...content.items]; newItems[idx].value = e.target.value; onChange({ ...content, items: newItems }); }} className="bg-gray-800 border-none rounded-xl p-3 text-xs font-black text-white w-full uppercase" /></Field></div>
                                                                                        <div className="col-span-1"><Field label="Suffix"><input value={item.suffix || ''} onChange={(e) => { const newItems = [...content.items]; newItems[idx].suffix = e.target.value; onChange({ ...content, items: newItems }); }} className="bg-gray-800 border-none rounded-xl p-3 text-xs font-black text-indigo-400 w-full" /></Field></div>
                                                                                        <div className="col-span-2"><Field label="Descriptor"><input value={item.label || ''} onChange={(e) => { const newItems = [...content.items]; newItems[idx].label = e.target.value; onChange({ ...content, items: newItems }); }} className="bg-gray-800 border-none rounded-xl p-3 text-xs font-bold text-gray-300 w-full uppercase tracking-tighter" /></Field></div>
                                                                                    </>
                                                                                ) : (
                                                                                    <div className="col-span-2"><Field label="Label Text"><input value={item.title || ''} onChange={(e) => { const newItems = [...content.items]; newItems[idx].title = e.target.value; onChange({ ...content, items: newItems }); }} className="bg-gray-800 border-none rounded-xl p-3 text-xs font-black text-white w-full uppercase" /></Field></div>
                                                                                )}
                                                                            </div>
                                                                        </Reorder.Item>
                                                                    ))}
                                                                </Reorder.Group>
                                                            </div>
                                                        )}

                                                        {!isGrid && type !== 'HERO' && !['HEADER', 'FOOTER'].includes(type) && (
                                                            <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4"><Monitor className="w-12 h-12 text-gray-500" /><p className="text-[9px] font-black uppercase tracking-[0.25em] italic max-w-[180px]">Architectural Interface Pending Production Update</p></div>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-10 bg-black border-t border-gray-800 flex gap-4 shrink-0">
                                    <button onClick={() => handleSaveDraft(selectedSection)} className="flex-1 py-5 text-[10px] font-black text-white border-2 border-gray-800 rounded-2xl hover:bg-gray-900 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-2"><UploadCloud className="w-4 h-4" /> Save Graph</button>
                                    <button onClick={() => handlePublish(selectedSection.id)} className="flex-1 py-5 text-[10px] font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all uppercase tracking-[0.3em] font-mono leading-none tracking-[0.4em]">DEPLOY()</button>
                                </div>
                            </Motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-20 grayscale pointer-events-none group">
                                <div className="w-36 h-36 rounded-[4rem] bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-10 border-8 border-white dark:border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12"><MousePointer2 className="w-14 h-14 text-indigo-400" /></div>
                                <h4 className="text-[12px] font-black text-gray-500 uppercase tracking-[0.5em] italic">Inspector Offline</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase mt-6 max-w-[260px] leading-relaxed tracking-wider">Select a structural block from the architect's flow canvas to calibrate its internal properties and data nodes.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </aside>
            </div>
        </div>
    );
};

export default LandingCMS;
