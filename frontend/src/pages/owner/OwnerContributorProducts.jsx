import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Search, BadgeCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getPendingProducts, updateProductStatus, bulkUpdateProductStatus } from '../../services/api';
import { PATHS } from '../../routes/paths';

const OwnerContributorProducts = () => {
    const { t } = useTranslation();
    const { contributorId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [contributor, setContributor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getPendingProducts();
                const allPending = response.products || [];
                const filteredByContributor = contributorId
                    ? allPending.filter(p => p.contributorId === contributorId)
                    : allPending;

                setProducts(filteredByContributor);

                if (filteredByContributor.length > 0 && filteredByContributor[0].contributor) {
                    setContributor(filteredByContributor[0].contributor);
                }
            } catch (err) {
                console.error('Failed to fetch pending products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [contributorId]);

    const handleAction = async (productId, status) => {
        setProcessing(productId);
        try {
            await updateProductStatus(productId, status);
            setProducts(prev => prev.filter(p => p.id !== productId));
            setSelectedIds(prev => prev.filter(id => id !== productId));
        } catch (err) {
            console.error(`Failed to ${status} product:`, err);
        } finally {
            setProcessing(null);
        }
    };

    const handleBulkAction = async (status) => {
        if (selectedIds.length === 0) return;
        setBulkProcessing(true);
        try {
            await bulkUpdateProductStatus({ productIds: selectedIds, status });
            setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
            setSelectedIds([]);
        } catch (err) {
            console.error(`Failed to bulk ${status} products:`, err);
        } finally {
            setBulkProcessing(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === finalProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(finalProducts.map(p => p.id));
        }
    };

    const toggleSelect = (productId) => {
        setSelectedIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const categories = ['All Categories', ...new Set(products.map(p => p.category || 'General'))];

    let finalProducts = [...products];
    if (selectedCategory && selectedCategory !== 'All Categories') {
        finalProducts = finalProducts.filter(p => (p.category || 'General') === selectedCategory);
    }
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        finalProducts = finalProducts.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q) ||
            (p.contributor && p.contributor.name?.toLowerCase().includes(q))
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
            {/* Top toolbar */}
            <div className="p-4 bg-white border-b border-gray-200 shrink-0">
                <div className="max-w-[1600px] mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 mb-4" aria-label="Breadcrumb">
                        <button
                            onClick={() => navigate(PATHS.OWNER_CONTRIBUTORS)}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <ol className="inline-flex items-center space-x-1 text-xs font-medium md:space-x-2">
                            <li className="inline-flex items-center">
                                <span className="text-gray-500 uppercase tracking-widest">{t('contributor_approval.title')} {contributor ? `- ${contributor.name}` : ''}</span>
                            </li>
                            {selectedCategory && selectedCategory !== 'All Categories' && (
                                <>
                                    <li>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                            <span className="ml-1 text-indigo-600 font-bold uppercase tracking-widest">{selectedCategory}</span>
                                        </div>
                                    </li>
                                </>
                            )}
                        </ol>
                    </nav>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left: search + filters */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-4 h-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search pending products..."
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block pl-10 pr-4 py-2.5 w-64 lg:w-80 transition-all focus:bg-white"
                                />
                            </div>

                            {/* Category tabs filter */}
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[400px]">
                                {categories.slice(0, 5).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${(selectedCategory === cat)
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right: Bulk Actions */}
                        {selectedIds.length > 0 && (
                            <Motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2"
                            >
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">
                                    {selectedIds.length} Selected
                                </span>
                                <button
                                    onClick={() => handleBulkAction('APPROVED')}
                                    disabled={bulkProcessing}
                                    className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 active:scale-95"
                                    title="Approve Selected"
                                >
                                    {bulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    <span className="hidden sm:inline">Approve Selected</span>
                                </button>
                                <button
                                    onClick={() => handleBulkAction('REJECTED')}
                                    disabled={bulkProcessing}
                                    className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 active:scale-95"
                                    title="Reject Selected"
                                >
                                    {bulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    <span className="hidden sm:inline">Reject Selected</span>
                                </button>
                            </Motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Container - Scrollable */}
            <div className="flex-1 overflow-auto">
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed bg-white">
                            <thead className="bg-gray-50/50 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-200">
                                <tr>
                                    <th scope="col" className="p-4 text-[10px] font-medium text-left text-gray-500 uppercase tracking-widest w-16">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={finalProducts.length > 0 && selectedIds.length === finalProducts.length}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 transition-all cursor-pointer"
                                            />
                                        </div>
                                    </th>
                                    <th scope="col" className="p-4 text-[10px] font-medium text-left text-gray-500 uppercase tracking-widest w-16">
                                        #
                                    </th>
                                    <th scope="col" className="p-4 text-[10px] font-medium text-left text-gray-500 uppercase tracking-widest">
                                        Product Name
                                    </th>
                                    <th scope="col" className="p-4 text-[10px] font-medium text-left text-gray-500 uppercase tracking-widest hidden md:table-cell">
                                        Category
                                    </th>
                                    <th scope="col" className="p-4 text-[10px] font-medium text-left text-gray-500 uppercase tracking-widest hidden lg:table-cell">
                                        Stok
                                    </th>
                                    <th scope="col" className="p-4 text-[10px] font-medium text-left text-gray-500 uppercase tracking-widest">
                                        Price
                                    </th>
                                    {!contributorId && (
                                        <th scope="col" className="p-4 text-[10px] font-medium text-left text-gray-500 uppercase tracking-widest hidden sm:table-cell">
                                            Contributor
                                        </th>
                                    )}
                                    <th scope="col" className="p-4 text-[10px] font-medium text-center text-gray-500 uppercase tracking-widest">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Loading Products...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : finalProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
                                                    <Package className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {selectedCategory === 'All Categories' ? t('contributor_approval.no_pending') : `${t('contributor_approval.no_pending')} in ${selectedCategory}`}
                                                    </p>
                                                    <p className="text-xs font-medium text-slate-400">{t('contributor_approval.no_pending_desc')}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    finalProducts.map((p, idx) => (
                                        <Motion.tr
                                            key={p.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(p.id)}
                                                        onChange={() => toggleSelect(p.id)}
                                                        className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 transition-all cursor-pointer group-hover:border-indigo-400"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:border-indigo-100 transition-colors">
                                                    {p.image ? (
                                                        <img
                                                            src={p.image.startsWith('http') ? p.image : `http://localhost:4000${p.image}`}
                                                            alt={p.name}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                                        />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-gray-200" />
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-slate-800 truncate">{p.name}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {p.halal && (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                                <BadgeCheck className="w-2.5 h-2.5" /> Halal
                                                            </span>
                                                        )}
                                                        {p.description && (
                                                            <span className="text-[10px] font-medium text-slate-400 truncate max-w-[200px]">
                                                                {p.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4 hidden md:table-cell">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{p.category || 'General'}</span>
                                            </td>

                                            <td className="p-4 hidden lg:table-cell">
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-bold ${p.stock <= 5 ? 'text-rose-500' : 'text-slate-700'}`}>
                                                        {p.stock}
                                                    </span>
                                                    {p.stock <= 5 && (
                                                        <span className="text-[9px] font-semibold uppercase text-rose-400 leading-none">
                                                            {p.stock === 0 ? 'Out of stock' : 'Low stock'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <span className="text-sm font-bold text-slate-900 tracking-tight">
                                                    Rp {p.price?.toLocaleString('id-ID')}
                                                </span>
                                            </td>

                                            {!contributorId && (
                                                <td className="p-4 hidden sm:table-cell">
                                                    {p.contributor ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 uppercase">
                                                                {p.contributor.name?.[0]}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight truncate max-w-[100px]">{p.contributor.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase italic">Unknown</span>
                                                    )}
                                                </td>
                                            )}

                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleAction(p.id, 'APPROVED')}
                                                        disabled={processing === p.id}
                                                        className="inline-flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider group/btn active:scale-95"
                                                        title="Approve Product"
                                                    >
                                                        {processing === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                        <span className="hidden sm:inline">Approve</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(p.id, 'REJECTED')}
                                                        disabled={processing === p.id}
                                                        className="inline-flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider group/btn active:scale-95"
                                                        title="Reject Product"
                                                    >
                                                        {processing === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                                        <span className="hidden sm:inline">Reject</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </Motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer - Stats */}
            {!loading && finalProducts.length > 0 && (
                <div className="bg-white border-t border-gray-100 px-6 py-3 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Pending Reviews: <span className="text-slate-900">{finalProducts.length} items</span>
                        </p>
                        <div className="h-4 w-px bg-slate-100" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Total Value: <span className="text-emerald-600">Rp {finalProducts.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString('id-ID')}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerContributorProducts;

