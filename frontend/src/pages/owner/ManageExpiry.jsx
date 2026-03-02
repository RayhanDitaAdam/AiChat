import React, { useState, useEffect } from 'react';
import { getExpiries, createExpiry, deleteExpiry, assignProductToExpiry, removeProductFromExpiry, getProductsByOwner } from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import {
    CalendarClock, Plus, Trash2, Search, Package,
    ChevronDown, AlertCircle, Calendar as CalendarIcon, PackageOpen
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import MySwal from '../../utils/swal.js';
const ManageExpiry = () => {
    const { user } = useAuth();

    // State
    const [expiries, setExpiries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState(new Set());

    // Add Date Modal State
    const [isAddDateOpen, setIsAddDateOpen] = useState(false);
    const [newDate, setNewDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Assign Product Modal State
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedExpiryId, setSelectedExpiryId] = useState(null);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    useEffect(() => {
        fetchExpiries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchExpiries = async () => {
        try {
            setIsLoading(true);
            const res = await getExpiries();
            setExpiries(res.data);

            // Auto expand first group if exists
            if (res.data.length > 0 && expandedGroups.size === 0) {
                setExpandedGroups(new Set([res.data[0].id]));
            }
        } catch (error) {
            console.error('Failed to fetch expiry groups:', error);
            MySwal.fire('Error', 'Failed to load Expiry data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInventory = async () => {
        try {
            setIsLoadingProducts(true);
            const ownerId = user?.ownerId || user?.memberOfId || user?.id; // Determine correct ID context
            const res = await getProductsByOwner(ownerId);
            setProducts(res?.products || res?.data || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            MySwal.fire('Error', 'Failed to load products for assignment', 'error');
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }
            return next;
        });
    };

    const handleAddDate = async (e) => {
        e.preventDefault();
        if (!newDate) return;

        try {
            setIsSubmitting(true);
            await createExpiry({ date: newDate });

            MySwal.fire({
                title: 'Success',
                text: 'Expiry tracking date added',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });

            setIsAddDateOpen(false);
            setNewDate('');
            fetchExpiries();
        } catch (error) {
            console.error('Add Date Error:', error);
            MySwal.fire('Error', error.response?.data?.message || 'Failed to add date', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteExpiry = async (id, dateStr) => {
        const d = new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const result = await MySwal.fire({
            title: `Delete Expiry Group?`,
            text: `Products inside ${d} will lose their tracking tags.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteExpiry(id);
                MySwal.fire('Deleted!', 'The expiry group has been removed.', 'success');
                fetchExpiries();
            } catch (error) {
                console.error('Delete Expiry Error:', error);
                MySwal.fire('Error', 'Failed to delete Expiry tracking', 'error');
            }
        }
    };

    const openAssignModal = (expiryId) => {
        setSelectedExpiryId(expiryId);
        setIsAssignOpen(true);
        setSearchQuery('');
        if (products.length === 0) fetchInventory();
    };

    const handleAssignProduct = async (productId) => {
        try {
            setIsAssigning(true);
            await assignProductToExpiry(selectedExpiryId, { productId });

            // Refresh data in background to show update
            fetchExpiries();

            MySwal.fire({
                title: 'Assigned',
                text: 'Product added to this expiration date',
                icon: 'success',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error('Assign Product Error:', error);
            MySwal.fire('Error', 'Failed to assign product', 'error');
        } finally {
            setIsAssigning(false);
            setIsAssignOpen(false);
        }
    };

    const handleRemoveProduct = async (expiryId, productId) => {
        try {
            await removeProductFromExpiry(expiryId, productId);
            fetchExpiries();
        } catch (error) {
            console.error('Remove Product Error:', error);
            MySwal.fire('Error', 'Failed to remove product from tracking', 'error');
        }
    };

    // Filter products for modal
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchQuery))
    );

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto font-outfit">
            {/* Header section structure mimicking Store Layout logic */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-50 rounded-xl">
                        <CalendarClock className="w-8 h-8 text-rose-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Kedaluwarsa (Expirations)</h1>
                        <p className="text-sm text-slate-500 mt-1">Track and manage product expiration timelines</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddDateOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                >
                    <Plus className="w-4 h-4" />
                    Add Expiration Date
                </button>
            </div>

            {/* List UI matching Products/Store Layout table styling */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                    <div className="col-span-1 border-r border-slate-200 flex justify-center items-center">
                        Toggle
                    </div>
                    <div className="col-span-4">Expiration Date</div>
                    <div className="col-span-3">Item Count</div>
                    <div className="col-span-4 flex justify-end">Actions</div>
                </div>

                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : expiries.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <CalendarIcon className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="font-medium text-slate-700">No expiration tracking dates defined</p>
                        <p className="text-sm mt-1">Click Add Date to start organizing product expiry</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {expiries.map((expiry) => {
                            const isExpanded = expandedGroups.has(expiry.id);
                            const displayDate = new Date(expiry.date).toLocaleDateString('id-ID', {
                                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                            });

                            // Calculate if date is in the past / expiring soon
                            const timeDiff = new Date(expiry.date).getTime() - new Date().getTime();
                            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                            const isExpired = daysDiff < 0;
                            const isExpiringSoon = daysDiff >= 0 && daysDiff <= 14;

                            return (
                                <div key={expiry.id} className="transition-colors hover:bg-slate-50/50">
                                    {/* Main Row */}
                                    <div
                                        onClick={() => toggleGroup(expiry.id)}
                                        className={`grid grid-cols-12 gap-4 p-4 items-center cursor-pointer ${isExpanded ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <div className="col-span-1 flex justify-center text-slate-400">
                                            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                        <div className="col-span-4 flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900">{displayDate}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                {isExpired && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 uppercase">
                                                        <AlertCircle className="w-3 h-3" /> Expired
                                                    </span>
                                                )}
                                                {isExpiringSoon && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
                                                        <CalendarClock className="w-3 h-3" /> In {daysDiff} Days
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-sm text-slate-600 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-slate-400" />
                                            {expiry.items?.length || 0} Products
                                        </div>
                                        <div className="col-span-4 flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => openAssignModal(expiry.id)}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Assign Product
                                            </button>
                                            <button
                                                onClick={() => handleDeleteExpiry(expiry.id, expiry.date)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Nested Product Logic */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <Motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden border-t border-slate-100"
                                            >
                                                <div className="bg-slate-50/50 p-4 pl-16">
                                                    {expiry.items?.length === 0 ? (
                                                        <div className="text-sm text-slate-500 py-4 flex items-center gap-2">
                                                            <PackageOpen className="w-4 h-4" />
                                                            No products assigned to this expiration date yet.
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {expiry.items.map(item => (
                                                                <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group">
                                                                    <div className="flex gap-3 items-center min-w-0">
                                                                        {item.product.image ? (
                                                                            <img src={item.product.image} className="w-10 h-10 rounded-lg object-cover" />
                                                                        ) : (
                                                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                                                <Package className="w-5 h-5 text-slate-400" />
                                                                            </div>
                                                                        )}
                                                                        <div className="min-w-0">
                                                                            <p className="text-sm font-semibold text-slate-900 truncate">{item.product.name}</p>
                                                                            <p className="text-xs text-slate-500 font-mono">{item.product.barcode || 'NO-BARCODE'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleRemoveProduct(expiry.id, item.product.id)}
                                                                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all ml-2 flex-shrink-0"
                                                                        title="Remove from this expiry group"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modals go here */}

            {/* Add Date Modal */}
            <AnimatePresence>
                {isAddDateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
                        >
                            <form onSubmit={handleAddDate}>
                                <div className="p-6 border-b border-slate-100">
                                    <h3 className="text-xl font-bold text-slate-900">Add Expiration Date</h3>
                                    <p className="text-sm text-slate-500 mt-1">Create a new bucket to track products</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tracked Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={newDate}
                                            onChange={(e) => setNewDate(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddDateOpen(false)}
                                        className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Add Date'}
                                    </button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Assign Products Modal */}
            <AnimatePresence>
                {isAssignOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col relative"
                        >
                            <div className="p-6 border-b border-slate-100 flex-shrink-0">
                                <h3 className="text-xl font-bold text-slate-900">Assign Products</h3>
                                <p className="text-sm text-slate-500 mt-1">Add items to this expiration bucket</p>

                                <div className="mt-4 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or barcode..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm"
                                    />
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                                {isLoadingProducts ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : filteredProducts.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p>No products found matching your search.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {filteredProducts.map(product => {
                                            const currentExpiry = expiries.find(e => e.id === selectedExpiryId);
                                            const isAlreadyAssigned = currentExpiry?.items?.some(i => i.product.id === product.id);

                                            return (
                                                <div
                                                    key={product.id}
                                                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${isAlreadyAssigned
                                                        ? 'bg-slate-100 border-slate-200 opacity-70'
                                                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                                                        }`}
                                                >
                                                    <div className="flex gap-3 items-center min-w-0 pr-2">
                                                        {product.image ? (
                                                            <img src={product.image} className="w-10 h-10 rounded-lg object-cover" />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <Package className="w-5 h-5 text-slate-400" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-900 truncate" title={product.name}>{product.name}</p>
                                                            <p className="text-xs text-slate-500">{product.barcode || 'NO-BARCODE'}</p>
                                                        </div>
                                                    </div>

                                                    {isAlreadyAssigned ? (
                                                        <span className="text-xs font-semibold px-2 py-1 bg-slate-200 text-slate-600 rounded whitespace-nowrap">
                                                            Assigned
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAssignProduct(product.id)}
                                                            disabled={isAssigning}
                                                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 whitespace-nowrap"
                                                        >
                                                            <Plus className="w-3 h-3" /> Add
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                                <button
                                    onClick={() => setIsAssignOpen(false)}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 bg-white border border-slate-200 rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ManageExpiry;
