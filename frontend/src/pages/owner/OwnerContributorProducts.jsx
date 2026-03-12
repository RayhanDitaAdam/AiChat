import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Search, BadgeCheck, Loader2, CheckCircle2, XCircle, Home, ChevronRight, Filter } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getPendingProducts, updateProductStatus, bulkUpdateProductStatus, getMediaURL } from '../../services/api';
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
        if (selectedIds.length === finalProducts.length && finalProducts.length > 0) {
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

    let finalProducts = products.filter(p => {
        const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' || (p.category || 'General') === selectedCategory;
        const matchesSearch = !searchQuery.trim() ||
            (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-normal">
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {/* Breadcrumb */}
                <nav className="flex mb-5" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
                        <li className="inline-flex items-center">
                            <Link to={PATHS.OWNER_DASHBOARD} className="inline-flex items-center text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white transition-colors">
                                <Home className="w-4 h-4 mr-2" />
                                Home
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                <Link to={PATHS.OWNER_CONTRIBUTORS} className="ml-1 text-gray-700 hover:text-indigo-600 md:ml-2 dark:text-gray-300 dark:hover:text-white transition-colors">Contributors</Link>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                <span className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page">Review Submissions</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                            {t('contributor_approval.title')} {contributor ? `— ${contributor.name}` : ''}
                        </h1>
                        <p className="text-sm font-normal text-gray-500 mt-1 dark:text-gray-400">
                            Perform strategic evaluation of pending product deployments
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(PATHS.OWNER_CONTRIBUTORS)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Network
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        {/* Search */}
                        <div className="relative flex-1 min-w-0 md:max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="search"
                                placeholder="Search submissions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        {/* Filters Container */}
                        <div className="flex gap-3">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="block p-2.5 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 outline-none appearance-none cursor-pointer min-w-[180px]"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.75rem' }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedIds.length > 0 && (
                            <Motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2"
                            >
                                <button
                                    onClick={() => handleBulkAction('APPROVED')}
                                    disabled={bulkProcessing}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none disabled:opacity-50"
                                >
                                    {bulkProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                    Approve Selected ({selectedIds.length})
                                </button>
                                <button
                                    onClick={() => handleBulkAction('REJECTED')}
                                    disabled={bulkProcessing}
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:ring-4 focus:ring-rose-300 dark:focus:ring-rose-900 transition-all active:scale-95 shadow-lg shadow-rose-100 dark:shadow-none disabled:opacity-50"
                                >
                                    {bulkProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                                    Reject Selected
                                </button>
                            </Motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="p-4">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Verifying pending submissions...</span>
                        </div>
                    ) : finalProducts.length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-6">
                                <Package size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Review Protocol Clear</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">No pending submissions match your current filtering criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="p-4 w-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={finalProducts.length > 0 && selectedIds.length === finalProducts.length}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </div>
                                        </th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-24">Preview</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Product Specification</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400 w-32">Category</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400 w-24">Quantity</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-right text-gray-500 uppercase dark:text-gray-400 w-32">Valuation</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-center text-gray-500 uppercase dark:text-gray-400 w-48">Decisions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {finalProducts.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                            <td className="p-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(p.id)}
                                                        onChange={() => toggleSelect(p.id)}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm">
                                                    {p.image ? (
                                                        <img
                                                            src={getMediaURL(p.image)}
                                                            alt={p.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                                                        />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-gray-300" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {p.halal && (
                                                            <span className="inline-flex px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                                                Halal
                                                            </span>
                                                        )}
                                                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                                            {p.description || 'No detailed brief provided.'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm">
                                                    {p.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white num-montserrat">{p.stock}</span>
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white num-montserrat">
                                                    Rp {p.price?.toLocaleString('id-ID')}
                                                </span>
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleAction(p.id, 'APPROVED')}
                                                        disabled={processing === p.id}
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-all border border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 dark:border-indigo-800 shadow-sm disabled:opacity-50 active:scale-95"
                                                    >
                                                        {processing === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(p.id, 'REJECTED')}
                                                        disabled={processing === p.id}
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg transition-all border border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 dark:border-rose-800 shadow-sm disabled:opacity-50 active:scale-95"
                                                    >
                                                        {processing === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Metrics Footer */}
            {!loading && products.length > 0 && (
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 z-10 mx-4 mb-4 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between max-w-[1400px] mx-auto">
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aggregate Review Volume</span>
                                <span className="num-montserrat text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                    {products.length} <span className="text-xs text-gray-400 font-medium">units</span>
                                </span>
                            </div>
                            <div className="w-[1px] h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Potential Asset Valuation</span>
                                <span className="num-montserrat text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                    Rp {products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerContributorProducts;
