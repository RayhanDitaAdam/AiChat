import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { PATHS } from '../../routes/paths.js';

import { getProductsByOwner, createProduct, updateProduct, deleteProduct, uploadProducts, getContributors, getBaseURL } from '../../services/api.js';
import {
    Plus, Edit2, Trash2, Package, FileUp, Download,
    Loader2, Filter, User, Search, BadgeCheck,
    Home, ChevronRight, ChevronLeft, FileText, Calendar, Clock,
    CalendarClock
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/Button.jsx';
import ProductForm from '../../components/ProductForm.jsx';
import Pagination from '../../components/Pagination.jsx';
import { useSearchQuery } from '../../hooks/useSearchQuery.js';
import { showConfirm, showSuccess, showError } from '../../utils/swal.js';
import { bulkDeleteProducts } from '../../services/api.js';

const StatusBadge = ({ status }) => {
    const map = {
        APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
        PENDING: 'bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
        REJECTED: 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status] || 'bg-gray-50 text-gray-600 border border-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>
            {status || 'APPROVED'}
        </span>
    );
};

const Products = () => {
    const { user } = useAuth();
    const { category: activeCategory } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [contributors, setContributors] = useState([]);
    const [filterContributor, setFilterContributor] = useState('ALL');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const { query: searchQuery, debouncedQuery: debouncedSearchQuery, setQuery: setSearchQuery } = useSearchQuery('search', 400);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const itemsPerPage = 10;

    const isContributor = user?.role === 'CONTRIBUTOR';
    const isOwner = user?.role === 'OWNER';
    const isStaff = user?.role === 'STAFF';

    useEffect(() => {
        if (user?.role === 'CONTRIBUTOR' && user?.id) {
            setFilterContributor(user.id);
        } else {
            setFilterContributor('ALL');
        }
    }, [user]);

    const fetchProducts = useCallback(async () => {
        const ownerId = user?.ownerId || user?.memberOfId;
        if (!ownerId) return;
        try {
            const params = isContributor ? { status: 'ALL' } : {};
            const data = await getProductsByOwner(ownerId, params);
            setProducts(data.products || []);
            setSelectedProductIds([]); // Clear selections on fetch
        } catch (err) {
            console.error('Failed to fetch products:', err);
            showError('Failed to load products');
        } finally {
            setIsInitialLoad(false);
        }
    }, [user, isContributor]);

    useEffect(() => {
        let isCancelled = false;
        const loadProducts = async () => { if (!isCancelled) await fetchProducts(); };
        loadProducts();
        return () => { isCancelled = true; };
    }, [fetchProducts]);

    useEffect(() => {
        if (isOwner) {
            const loadContributors = async () => {
                try {
                    const data = await getContributors();
                    if (data.status === 'success') {
                        setContributors(data.contributors);
                    } else {
                        setContributors(data); // Fallback if api returns array directly
                    }
                } catch (err) {
                    console.error('Failed to load contributors', err);
                }
            };
            loadContributors();
        }
    }, [isOwner]);

    const handleSave = async (formData) => {
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
                showSuccess('Product updated');
            } else {
                await createProduct(formData);
                showSuccess('Product created');
            }
            await fetchProducts();
            setIsFormOpen(false);
            setEditingProduct(null);
        } catch (err) {
            showError(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (id) => {
        const confirm = await showConfirm('Delete this product?', 'This action cannot be undone.');
        if (confirm) {
            try {
                await deleteProduct(id);
                await fetchProducts();
                setSelectedProductIds(prev => prev.filter(pid => pid !== id));
                showSuccess('Product deleted');
            } catch (err) {
                console.error(err);
                showError('Failed to delete');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProductIds.length === 0) return;
        const confirm = await showConfirm(`Delete ${selectedProductIds.length} products?`, 'This action cannot be undone.');
        if (confirm) {
            try {
                await bulkDeleteProducts(selectedProductIds);
                await fetchProducts();
                setSelectedProductIds([]);
                showSuccess('Products deleted');
            } catch (err) {
                console.error(err);
                showError('Failed to delete selected products');
            }
        }
    };

    const openEdit = (p) => {
        setEditingProduct(p);
        setIsFormOpen(true);
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const res = await uploadProducts(file);
            showSuccess('Imported!', res.message || 'Products imported successfully');
            await fetchProducts();
        } catch (error) {
            console.error(error);
            showError('Import Failed', 'Failed to import products');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const [isScrapingOpen, setIsScrapingOpen] = useState(false);
    const [scrapeStoreName, setScrapeStoreName] = useState('');
    const [isScraping, setIsScraping] = useState(false);

    const handleScrapeProduct = async () => {
        if (!scrapeStoreName.trim()) {
            showError('Please enter a valid Tokopedia store name');
            return;
        }

        setIsScraping(true);
        try {
            // call to our backend scraper endpoint using the generic api instance
            const api = (await import('../../services/api.js')).default;
            const res = await api.post('/scraper/tokopedia', { storeName: scrapeStoreName });

            if (res.data?.status === 'success') {
                showSuccess('Scraping successful', res.data.message || 'Products added to inventory.');
                await fetchProducts();
                setIsScrapingOpen(false);
                setScrapeStoreName('');
            }
        } catch (error) {
            console.error('Scraping error:', error);
            showError('Scraping failed', error.response?.data?.message || 'There was an issue running the Tokopedia scraper.');
        } finally {
            setIsScraping(false);
        }
    };

    const downloadTemplate = () => {
        const headers = "Name,Price,Stock,Halal,Aisle,Shelf,Category,Description,Image,ExpiryDate,VideoUrl\n";
        const exampleRow = "Example Product,15000,50,true,A,1,General,Example description,https://example.com/image.jpg,2025-12-31,https://youtube.com/watch?v=...\n";
        const blob = new Blob([headers + exampleRow], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'product_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // Category tabs
    const categories = ['All Categories', ...new Set(products.map(p => p.category || 'General'))];

    // Filter pipeline
    const filteredProducts = products.filter(p => {
        const matchesSearch = !debouncedSearchQuery.trim() ||
            (p.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                p.category?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));

        const matchesCategory = !activeCategory || activeCategory === 'All Categories' || (p.category || 'General') === activeCategory;
        const matchesContributor = filterContributor === 'ALL' || p.contributorId === filterContributor;

        return matchesSearch && matchesCategory && matchesContributor;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginated = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const canModify = (p) => isOwner || isStaff || (isContributor && p.contributorId === user?.id && p.status !== 'APPROVED');

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allModifiableIds = filteredProducts.filter(p => canModify(p)).map(p => p.id);
            setSelectedProductIds(allModifiableIds);
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleSelectProduct = (e, id) => {
        if (e.target.checked) {
            setSelectedProductIds(prev => [...prev, id]);
        } else {
            setSelectedProductIds(prev => prev.filter(pid => pid !== id));
        }
    };

    // Filtered list for value calculation
    const finalProducts = products.filter(p => filterContributor === 'ALL' || p.contributorId === filterContributor);

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
                                <span className="ml-1 text-gray-700 hover:text-indigo-600 md:ml-2 dark:text-gray-300 dark:hover:text-white cursor-default">Monitoring</span>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                <span className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page">Inventory</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                            Inventory Management
                        </h1>
                        <p className="text-sm font-normal text-gray-500 mt-1 dark:text-gray-400">
                            Coordinate and monitor your strategic product reserves
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={downloadTemplate}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 transition-all shadow-sm"
                        >
                            <Download className="w-4 h-4 mr-2" /> Template
                        </button>

                        <div className="relative">
                            <input
                                type="file"
                                id="excel-upload-main"
                                className="hidden"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleImportExcel}
                                disabled={isUploading}
                            />
                            <label
                                htmlFor="excel-upload-main"
                                className={`inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 transition-all shadow-sm cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-500" /> : <FileUp className="w-4 h-4 mr-2" />}
                                Import
                            </label>
                        </div>

                        {isOwner && (
                            <button
                                onClick={() => setIsScrapingOpen(true)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-all active:scale-95 shadow-lg shadow-green-100 dark:shadow-none"
                            >
                                <Search className="w-4 h-4 mr-2" /> Scrap Tokopedia
                            </button>
                        )}

                        <button
                            onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Product
                        </button>

                        {selectedProductIds.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:ring-4 focus:ring-rose-300 dark:focus:ring-rose-900 transition-all active:scale-95 shadow-lg shadow-rose-100 dark:shadow-none"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Selected ({selectedProductIds.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 flex-wrap flex-1">
                        {/* Search */}
                        <div className="relative flex-1 min-w-0 md:max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="search"
                                placeholder="Search by name, category, or description..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        {/* Filters Container */}
                        <div className="flex gap-3">
                            {/* Category Filter */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <select
                                    value={activeCategory || 'All Categories'}
                                    onChange={(e) => {
                                        const cat = e.target.value;
                                        setCurrentPage(1);
                                        if (cat === 'All Categories') navigate(isOwner ? PATHS.OWNER_PRODUCTS : PATHS.CONTRIBUTOR_PRODUCTS);
                                        else navigate(`${isOwner ? PATHS.OWNER_PRODUCTS : PATHS.CONTRIBUTOR_PRODUCTS}/${cat}`);
                                    }}
                                    className="block p-2.5 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 outline-none appearance-none cursor-pointer min-w-[160px]"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.75rem' }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Contributor filter */}
                            {isOwner && (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <select
                                        value={filterContributor}
                                        onChange={(e) => { setFilterContributor(e.target.value); setCurrentPage(1); }}
                                        className="block p-2.5 pl-10 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 outline-none appearance-none cursor-pointer min-w-[180px]"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '0.75rem' }}
                                    >
                                        <option value="ALL">All Sources</option>
                                        {contributors.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Snapshots */}
                <div className="flex items-center gap-2 mt-6">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inventory Insight:</span>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">{products.length} Units</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Optimal Stock</span>
                        {products.filter(p => p.stock <= 5).length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                {products.filter(p => p.stock <= 5).length} Critical
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="p-4">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    {isInitialLoad ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Synchronizing inventory...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="p-4 w-12 text-center items-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                onChange={handleSelectAll}
                                                checked={filteredProducts.length > 0 && filteredProducts.filter(p => canModify(p)).every(p => selectedProductIds.includes(p.id))}
                                            />
                                        </th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-16 text-center">No.</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-24">Preview</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Product Specification</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-32 text-center">Category</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 text-center w-24">Availability</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 text-right w-32">Unit Price</th>
                                        {(isContributor || isOwner) && (
                                            <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 text-center w-32">
                                                {isContributor ? 'Workflow State' : 'Strategic Source'}
                                            </th>
                                        )}
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 text-center w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={isOwner || isContributor ? 9 : 8} className="p-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-center">
                                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-6">
                                                        <Package size={32} />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Empty Inventory</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">No products match your current filtering criteria.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((p, idx) => (
                                            <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="p-4 w-12 text-center">
                                                    {canModify(p) && (
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                            checked={selectedProductIds.includes(p.id)}
                                                            onChange={(e) => handleSelectProduct(e, p.id)}
                                                        />
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">
                                                    <span className="text-xs font-bold text-gray-400 num-montserrat">{(currentPage - 1) * itemsPerPage + idx + 1}</span>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm">
                                                        {p.image ? (
                                                            <img
                                                                src={p.image.startsWith('http') ? p.image : `${getBaseURL()}${p.image}`}
                                                                alt={p.name}
                                                                className="w-full h-full object-cover"
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
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            {p.halal && (
                                                                <span className="inline-flex px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                                                    Halal
                                                                </span>
                                                            )}
                                                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                                                {p.description || 'No detailed brief provided.'}
                                                            </span>
                                                            {p.expiryItems && p.expiryItems.length > 0 && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold tracking-wider border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                                                                    <CalendarClock size={12} /> {new Date(p.expiryItems[0].productExpiry.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm">
                                                        {p.category || 'General'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center whitespace-nowrap">
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-sm font-bold num-montserrat ${p.stock <= 5 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
                                                            {p.stock}
                                                        </span>
                                                        {p.stock <= 5 && (
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400 mt-0.5">
                                                                {p.stock === 0 ? 'Exhausted' : 'Low Stock'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right whitespace-nowrap">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white num-montserrat">
                                                        Rp {p.price?.toLocaleString('id-ID')}
                                                    </span>
                                                </td>
                                                {(isContributor || isOwner) && (
                                                    <td className="p-4 text-center whitespace-nowrap">
                                                        {isContributor ? (
                                                            <StatusBadge status={p.status} />
                                                        ) : (
                                                            p.contributor ? (
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase shadow-sm">
                                                                        {p.contributor.name?.[0]}
                                                                    </div>
                                                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[100px]">{p.contributor.name}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider dark:text-gray-500">Self-Managed</span>
                                                            )
                                                        )}
                                                    </td>
                                                )}
                                                <td className="p-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {canModify(p) ? (
                                                            <>
                                                                <button
                                                                    onClick={() => openEdit(p)}
                                                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                                    title="Edit Logistics"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(p.id)}
                                                                    className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:text-gray-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                                                                    title="Eliminate Resource"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <Clock size={16} className="text-gray-300 dark:text-gray-600" title="Modification Restricted" />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination footer */}
                    {!isInitialLoad && filteredProducts.length > 0 && (
                        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                Showing <span className="font-semibold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span> entries
                            </p>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Global Metrics Footer */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 z-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aggregate Valuation</span>
                            <span className="num-montserrat text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                Rp {finalProducts.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Stock Items</span>
                            <span className="num-montserrat text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                {products.reduce((acc, p) => acc + p.stock, 0)} <span className="text-xs text-gray-400 font-medium">Units</span>
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <Clock size={14} className="animate-pulse" />
                        Last Sync: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>

            <ProductForm
                key={editingProduct?.id || 'new'}
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingProduct(null); }}
                onSave={handleSave}
                editingProduct={editingProduct}
                businessCategory={user?.owner?.businessCategory}
            />

            {/* Scraping Modal Overlay */}
            <AnimatePresence>
                {isScrapingOpen && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
                    >
                        <Motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-100 dark:border-gray-700"
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Scrap Tokopedia Products</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Enter the Tokopedia store domain name (the part after tokopedia.com/) to automatically import products into your inventory.
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Name</label>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                                        tokopedia.com/
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="alysa-market"
                                        value={scrapeStoreName}
                                        onChange={(e) => setScrapeStoreName(e.target.value)}
                                        className="flex-1 block w-full min-w-0 px-3 py-2 rounded-none rounded-r-md text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        disabled={isScraping}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => !isScraping && setIsScrapingOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition"
                                    disabled={isScraping}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleScrapeProduct}
                                    className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition ${isScraping ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    disabled={isScraping}
                                >
                                    {isScraping ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    {isScraping ? 'Scraping...' : 'Start Scraping'}
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Products;
