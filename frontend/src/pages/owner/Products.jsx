import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { PATHS } from '../../routes/paths.js';

import { getProductsByOwner, createProduct, updateProduct, deleteProduct, uploadProducts, getContributors } from '../../services/api.js';
import { Plus, Edit2, Trash2, Package, FileUp, Download, Loader2, Filter, User, Search, BadgeCheck } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/Button.jsx';
import { useToast } from '../../context/ToastContext.js';
import ProductForm from '../../components/ProductForm.jsx';

const StatusBadge = ({ status }) => {
    const map = {
        APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        PENDING: 'bg-blue-50 text-blue-700 border border-blue-100',
        REJECTED: 'bg-rose-50 text-rose-700 border border-rose-100',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${map[status] || 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
            {status || 'APPROVED'}
        </span>
    );
};

const Products = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { category: activeCategory } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [contributors, setContributors] = useState([]);
    const [filterContributor, setFilterContributor] = useState('ALL');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const isContributor = user?.role === 'CONTRIBUTOR';
    const isOwner = user?.role === 'OWNER';

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
        } catch (err) {
            console.error('Failed to fetch products:', err);
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
                    setContributors(data);
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
            } else {
                await createProduct(formData);
            }
            await fetchProducts();
            setIsFormOpen(false);
            setEditingProduct(null);
            showToast('Product saved successfully', 'success');
        } catch {
            showToast('Failed to save product', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteProduct(id);
            await fetchProducts();
            showToast('Product deleted successfully', 'success');
        } catch {
            showToast('Failed to delete product', 'error');
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
            showToast(res.message || 'Products imported successfully', 'success');
            await fetchProducts();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to import products', 'error');
        } finally {
            setIsUploading(false);
            e.target.value = '';
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
    let finalProducts = [...products];
    if (activeCategory && activeCategory !== 'All Categories') {
        finalProducts = finalProducts.filter(p => (p.category || 'General') === activeCategory);
    }
    if (filterContributor && filterContributor !== 'ALL') {
        finalProducts = finalProducts.filter(p => p.contributorId === filterContributor);
    }
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        finalProducts = finalProducts.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
    }

    const canModify = (p) => isOwner || (isContributor && p.contributorId === user?.id && p.status !== 'APPROVED');

    return (
        <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
            {/* Top toolbar */}
            <div className="p-4 bg-white border-b border-gray-200 shrink-0">
                <div className="max-w-[1600px] mx-auto">
                    {/* Breadcrumb */}
                    <nav className="flex mb-4" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 text-xs font-medium md:space-x-2">
                            <li className="inline-flex items-center">
                                <span className="text-gray-500 uppercase tracking-widest">Inventory Management</span>
                            </li>
                            {activeCategory && activeCategory !== 'All Categories' && (
                                <>
                                    <li>
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                            <span className="ml-1 text-indigo-600 font-bold uppercase tracking-widest">{activeCategory}</span>
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
                                    placeholder="Search products by name, category, or description..."
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block pl-10 pr-4 py-2.5 w-64 lg:w-80 transition-all focus:bg-white"
                                />
                            </div>

                            {/* Category tabs filter */}
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[400px]">
                                {categories.slice(0, 5).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => {
                                            if (cat === 'All Categories') navigate(isOwner ? PATHS.OWNER_PRODUCTS : PATHS.CONTRIBUTOR_PRODUCTS);
                                            else navigate(`${isOwner ? PATHS.OWNER_PRODUCTS : PATHS.CONTRIBUTOR_PRODUCTS}/${cat}`);
                                        }}
                                        className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${(activeCategory === cat || (!activeCategory && cat === 'All Categories'))
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Contributor filter */}
                            {isOwner && (
                                <div className="relative">
                                    <select
                                        value={filterContributor}
                                        onChange={(e) => setFilterContributor(e.target.value)}
                                        className="appearance-none bg-white border border-gray-200 pl-3 pr-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 cursor-pointer"
                                    >
                                        <option value="ALL">All Contributors</option>
                                        {contributors.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                </div>
                            )}
                        </div>

                        {/* Right: action buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={downloadTemplate}
                                className="inline-flex items-center gap-2 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Template
                            </button>

                            <div className="relative">
                                <input
                                    type="file"
                                    id="excel-upload"
                                    className="hidden"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleImportExcel}
                                    disabled={isUploading}
                                />
                                <label
                                    htmlFor="excel-upload"
                                    className={`inline-flex items-center gap-2 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> : <FileUp className="w-4 h-4" />}
                                    Import
                                </label>
                            </div>

                            <button
                                onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white bg-black rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-300 transition-all shadow-lg shadow-slate-200"
                            >
                                <Plus className="w-4 h-4" />
                                Add Product
                            </button>
                        </div>
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
                                    {isContributor && (
                                        <th scope="col" className="p-4 text-[10px] font-medium text-left text-gray-500 uppercase tracking-widest hidden sm:table-cell">
                                            Status
                                        </th>
                                    )}
                                    {isOwner && (
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
                                {isInitialLoad ? (
                                    <tr>
                                        <td colSpan="8" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Loading Inventory...</span>
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
                                                    <p className="text-sm font-bold text-slate-800">No products found</p>
                                                    <p className="text-xs font-medium text-slate-400">Try adjusting your filters or search query.</p>
                                                </div>
                                                <button
                                                    onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                                                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white bg-black rounded-lg hover:bg-slate-800 transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add First Product
                                                </button>
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

                                            {isContributor && (
                                                <td className="p-4 hidden sm:table-cell">
                                                    <StatusBadge status={p.status} />
                                                </td>
                                            )}

                                            {isOwner && (
                                                <td className="p-4 hidden sm:table-cell">
                                                    {p.contributor ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 uppercase">
                                                                {p.contributor.name?.[0]}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight truncate max-w-[100px]">{p.contributor.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase italic">Original</span>
                                                    )}
                                                </td>
                                            )}

                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                                    {canModify(p) ? (
                                                        <>
                                                            <button
                                                                onClick={() => openEdit(p)}
                                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                                title="Edit Product"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(p.id)}
                                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                                title="Delete Product"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                                                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Locked</span>
                                                        </div>
                                                    )}
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
            {!isInitialLoad && finalProducts.length > 0 && (
                <div className="bg-white border-t border-gray-100 px-6 py-3 shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Inventory: <span className="text-slate-900">{finalProducts.length} items</span>
                        </p>
                        <div className="h-4 w-px bg-slate-100" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Total Value: <span className="text-emerald-600">Rp {finalProducts.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString('id-ID')}</span>
                        </p>
                    </div>
                    <p className="text-[9px] font-medium text-slate-300 italic">
                        Last updated: {new Date().toLocaleTimeString()}
                    </p>
                </div>
            )}

            <ProductForm
                key={editingProduct?.id || 'new'}
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingProduct(null); }}
                onSave={handleSave}
                editingProduct={editingProduct}
                businessCategory={user?.owner?.businessCategory}
            />
        </div>
    );
};

export default Products;
