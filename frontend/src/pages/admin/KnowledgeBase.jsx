import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import {
    BookOpen, Plus, Search, Pencil, Trash2, CheckCircle2, Clock,
    FolderOpen, X, Tag, Save, ChevronDown, MoreHorizontal, Filter,
    Layers, Globe, ShieldCheck, Mail, Info, Package, Search as SearchIcon
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const API = '/admin-ai';

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <Motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-slate-100"
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 bg-slate-50/30">
                    <h3 className="font-extrabold text-slate-800 tracking-tight">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </Motion.div>
        </div>
    );
}

function FaqForm({ initial, categories, onSave, onCancel }) {
    const [form, setForm] = useState({
        question: initial?.question || '',
        answer: initial?.answer || '',
        alternatives: (initial?.alternatives || []).join(', '),
        tags: (initial?.tags || []).join(', '),
        priority: initial?.priority || 0,
        categoryId: initial?.categoryId || '',
        isActive: initial?.isActive ?? true,
        productIds: initial?.productIds || [],
    });

    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        if (initial?.productIds?.length > 0) {
            const fetchLinkedProducts = async () => {
                try {
                    // Fetch all products for this owner and filter by IDs, 
                    // or better, use a specific endpoint if available.
                    // For now, we can use the existing /products endpoint with multiple IDs if it supports it, 
                    // or just fetch all and filter.
                    const res = await api.get('/products');
                    const allProducts = res.data.data || [];
                    const linked = allProducts.filter(p => initial.productIds.includes(p.id));
                    setSelectedProducts(linked);
                } catch (e) { console.error(e); }
            };
            fetchLinkedProducts();
        }
    }, [initial]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (productSearch.length >= 2) {
                setSearching(true);
                try {
                    const res = await api.get(`/products?search=${productSearch}`);
                    setSearchResults(res.data.data || []);
                } catch (e) { console.error(e); }
                finally { setSearching(false); }
            } else {
                setSearchResults([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [productSearch]);

    const addProduct = (p) => {
        if (!form.productIds.includes(p.id)) {
            setForm(prev => ({ ...prev, productIds: [...prev.productIds, p.id] }));
            setSelectedProducts(prev => [...prev, p]);
        }
        setProductSearch('');
        setSearchResults([]);
    };

    const removeProduct = (id) => {
        setForm(prev => ({ ...prev, productIds: prev.productIds.filter(pid => pid !== id) }));
        setSelectedProducts(prev => prev.filter(p => p.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            alternatives: form.alternatives.split(',').map(s => s.trim()).filter(Boolean),
            tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
            priority: Number(form.priority),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Question *</label>
                    <input
                        value={form.question}
                        onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                        required
                        placeholder="e.g. How do I track my order?"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Answer *</label>
                    <textarea
                        value={form.answer}
                        onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
                        required
                        rows={4}
                        placeholder="Provide a clear, helpful response..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Alternatives</label>
                        <input
                            value={form.alternatives}
                            onChange={e => setForm(p => ({ ...p, alternatives: e.target.value }))}
                            placeholder="comma, separated"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tags</label>
                        <input
                            value={form.tags}
                            onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                            placeholder="tag1, tag2"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                        <select
                            value={form.categoryId}
                            onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all cursor-pointer appearance-none"
                        >
                            <option value="">Ungrouped</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Priority</label>
                        <input
                            type="number"
                            value={form.priority}
                            onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                        className="w-5 h-5 accent-indigo-600 rounded-lg cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-sm text-slate-700 font-bold cursor-pointer">Published (Active in Chat)</label>
                </div>

                <div className="pt-2">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Attach Products (Optional)</label>
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={productSearch}
                            onChange={e => setProductSearch(e.target.value)}
                            placeholder="Search products to attach..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                        />
                        {searching && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto z-10 sticky top-0">
                            {searchResults.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => addProduct(p)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 last:border-0"
                                >
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Package className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Rp{p.price.toLocaleString()}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedProducts.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {selectedProducts.map(p => (
                                <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 animate-in fade-in zoom-in duration-200">
                                    <Package className="w-3.5 h-3.5" />
                                    <span className="text-xs font-extrabold truncate max-w-[120px]">{p.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeProduct(p.id)}
                                        className="p-0.5 hover:bg-indigo-100 rounded-md transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-extrabold transition-all shadow-lg shadow-indigo-100"
                >
                    <Save className="w-4 h-4" /> Save Knowledge Point
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function KnowledgeBase() {
    const [categories, setCategories] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [catRes, faqRes] = await Promise.all([
                api.get(`${API}/categories`),
                api.get(`${API}/faqs`),
            ]);
            setCategories(catRes.data.data || []);
            setFaqs(faqRes.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const loadFaqs = useCallback(async () => {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('categoryId', selectedCategory);
        if (search) params.set('search', search);
        const res = await api.get(`${API}/faqs?${params}`);
        setFaqs(res.data.data || []);
    }, [selectedCategory, search]);

    useEffect(() => {
        if (!loading) loadFaqs();
    }, [loadFaqs, loading]);

    const saveFaq = async (data) => {
        try {
            if (editingFaq) {
                await api.put(`${API}/faqs/${editingFaq.id}`, data);
            } else {
                await api.post(`${API}/faqs`, data);
            }
            setShowModal(false);
            setEditingFaq(null);
            loadFaqs();
        } catch (e) { console.error(e); }
    };

    const deleteFaq = async (id) => {
        if (!window.confirm('Are you sure you want to delete this knowledge entry? This cannot be undone.')) return;
        await api.delete(`${API}/faqs/${id}`);
        loadFaqs();
    };

    const createCategory = async (e) => {
        e.preventDefault();
        await api.post(`${API}/categories`, { name: newCategory });
        setNewCategory('');
        setShowCategoryModal(false);
        const res = await api.get(`${API}/categories`);
        setCategories(res.data.data || []);
    };

    return (
        <div className="flex flex-col xl:flex-row gap-8 min-h-screen p-6 bg-gray-50/50">
            {/* Category Sidebar */}
            <div className="w-full xl:w-72 shrink-0">
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm sticky top-24">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Folders
                        </h3>
                        <button
                            onClick={() => setShowCategoryModal(true)}
                            className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                            title="New Category"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-extrabold transition-all ${!selectedCategory ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Layers className={`w-4 h-4 ${!selectedCategory ? 'text-indigo-200' : 'text-slate-400'}`} />
                            <span>Library</span>
                            <span className={`ml-auto px-2 py-0.5 rounded-lg text-[10px] ${!selectedCategory ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {faqs.length}
                            </span>
                        </button>

                        <div className="h-px bg-slate-50 my-3 mx-2" />

                        {categories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedCategory(c.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-extrabold transition-all ${selectedCategory === c.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <FolderOpen className={`w-4 h-4 ${selectedCategory === c.id ? 'text-indigo-200' : 'text-slate-400'}`} />
                                <span className="truncate">{c.name}</span>
                                <span className={`ml-auto px-2 py-0.5 rounded-lg text-[10px] ${selectedCategory === c.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {c._count?.faqs ?? 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                        <Info className="w-5 h-5 text-slate-300 mx-auto mb-2" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-tight">Organize content to help AI categorize answers.</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-2xl">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Knowledge Base</h1>
                            <p className="text-sm text-slate-500 font-medium">Manage instructions and FAQ data points.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setEditingFaq(null); setShowModal(true); }}
                        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-sm font-extrabold transition-all shadow-lg shadow-purple-200"
                    >
                        <Plus className="w-4 h-4" /> New Instruction
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search system knowledge..."
                        className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all"
                    />
                </div>

                {/* Management Table */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100/50">
                                    <th className="px-8 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Question & Response</th>
                                    <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-40">Classification</th>
                                    <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-24">Sync</th>
                                    <th className="px-6 py-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-40 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="py-24 text-center">
                                            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Library...</span>
                                        </td>
                                    </tr>
                                ) : faqs.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-24 text-center">
                                            <div className="max-w-xs mx-auto">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <BookOpen className="w-8 h-8 text-slate-200" />
                                                </div>
                                                <h4 className="text-slate-900 font-extrabold">No data found</h4>
                                                <p className="text-xs text-slate-500 font-medium mt-1">Start by adding your first FAQ to train the system.</p>
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className="mt-6 text-indigo-600 text-xs font-extrabold hover:underline"
                                                >
                                                    Add Knowledge +
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    faqs.map(faq => (
                                        <tr key={faq.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="max-w-md">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        {!faq.isActive && <span className="bg-rose-100 text-rose-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase">Draft</span>}
                                                        <p className="text-sm font-extrabold text-slate-800 leading-snug">{faq.question}</p>
                                                    </div>
                                                    <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed italic">
                                                        "{faq.answer}"
                                                    </p>
                                                    {faq.tags?.length > 0 && (
                                                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                                                            {faq.tags.map(t => (
                                                                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-lg border border-slate-200/50">
                                                                    <Tag className="w-2.5 h-2.5" />{t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {faq.productIds?.length > 0 && (
                                                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                            <span className="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-1 mr-1">
                                                                <Package className="w-3 h-3" /> Linked Items:
                                                            </span>
                                                            <span className="bg-indigo-50 text-indigo-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-indigo-100">
                                                                {faq.productIds.length} Products
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 vertical-top">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                                        <Layers className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate">
                                                            {faq.category?.name || 'Unsorted'}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-slate-400">PRIORITY: {faq.priority}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 vertical-top">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full">
                                                    {faq.isSynced ? (
                                                        <div className="p-1 px-2 bg-emerald-50 text-emerald-600 rounded-lg flex items-center gap-1 border border-emerald-100 shadow-sm" title="Vector Hub Active">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span className="text-[9px] font-black">AI</span>
                                                        </div>
                                                    ) : (
                                                        <div className="p-1 px-2 bg-amber-50 text-amber-600 rounded-lg flex items-center gap-1 border border-amber-100 shadow-sm" title="Sync Pending">
                                                            <Clock className="w-3.5 h-3.5" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => { setEditingFaq(faq); setShowModal(true); }}
                                                        className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm"
                                                        title="Edit Knowledge"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteFaq(faq.id)}
                                                        className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* FAQ Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <Modal title={editingFaq ? 'Modify Global Intelligence' : 'Teach New Concept'} onClose={() => { setShowModal(false); setEditingFaq(null); }}>
                        <FaqForm initial={editingFaq} categories={categories} onSave={saveFaq} onCancel={() => { setShowModal(false); setEditingFaq(null); }} />
                    </Modal>
                )}
            </AnimatePresence>

            {/* Category Create Modal */}
            <AnimatePresence>
                {showCategoryModal && (
                    <Modal title="Create New Library Segment" onClose={() => setShowCategoryModal(false)}>
                        <form onSubmit={createCategory} className="space-y-4 pt-2">
                            <div>
                                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category Name</label>
                                <input
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    required
                                    autoFocus
                                    placeholder="e.g. Logistics, Technical, Sales"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-extrabold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                            >
                                <Plus className="w-4 h-4 inline-block mr-2" />
                                Initialize Category
                            </button>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}
