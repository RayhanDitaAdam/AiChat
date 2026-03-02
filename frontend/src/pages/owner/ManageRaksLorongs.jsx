import React, { useState, useEffect } from 'react';
import {
    Plus,
    ChevronDown,
    ChevronRight,
    Trash2,
    Loader2,
    LayoutGrid,
    Package,
    Home,
    ListPlus,
    Search,
    Check
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PATHS } from '../../routes/paths.js';
import { showError, showSuccess, showConfirm } from '../../utils/swal.js';
import { useUser } from '../../context/useUser';
import api, { getProductsByOwner, updateProduct } from '../../services/api.js';

const API_URL = '/rak-lorong';
const CATEGORY_API_URL = '/pos/settings/categories';

const ManageRaksLorongs = () => {
    const { user } = useUser();
    const role = user?.role;

    const getDashboardPath = () => {
        if (role === 'OWNER') return PATHS.OWNER_DASHBOARD;
        if (role === 'STAFF') return PATHS.STAFF_DASHBOARD;
        if (role === 'CONTRIBUTOR') return PATHS.CONTRIBUTOR_DASHBOARD;
        return '/';
    };

    const [lorongs, setLorongs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // UI State
    const [expandedLorongs, setExpandedLorongs] = useState({});

    // Aisle Modal
    const [lorongModalOpen, setLorongModalOpen] = useState(false);
    const [lorongName, setLorongName] = useState('');
    const [lorongDescription, setLorongDescription] = useState('');

    // Shelf Modal
    const [rakModalOpen, setRakModalOpen] = useState(false);
    const [selectedLorongId, setSelectedLorongId] = useState(null);
    const [rakName, setRakName] = useState('');
    const [rakDescription, setRakDescription] = useState('');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);



    // Assign Products State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignTarget, setAssignTarget] = useState({ aisle: '', rak: '' });
    const [storeProducts, setStoreProducts] = useState([]);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [searchAssignQuery, setSearchAssignQuery] = useState('');

    useEffect(() => {
        fetchLorongs();
        fetchCategories();
    }, []);

    const fetchLorongs = async () => {
        setLoading(true);
        try {
            const res = await api.get(API_URL);
            if (res.data?.status === 'success') {
                setLorongs(res.data.data || []);

                // Expand all by default initially
                const initialExp = {};
                res.data.data.forEach(l => {
                    initialExp[l.id] = true;
                });
                setExpandedLorongs(initialExp);
            }
        } catch (error) {
            console.error(error);
            showError('Failed to load Aisles');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get(CATEGORY_API_URL);
            if (res.data?.status === 'success') {
                setCategories(res.data.data || []);
            }
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    const toggleLorong = (id) => {
        setExpandedLorongs(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // --- Aisle Functions ---
    const handleCreateLorong = async () => {
        if (!lorongName.trim()) {
            showError('Aisle name is required');
            return;
        }

        try {
            const res = await api.post(API_URL, {
                name: lorongName,
                description: lorongDescription
            });

            if (res.data?.status === 'success') {
                showSuccess('Aisle created successfully');
                setLorongModalOpen(false);
                setLorongName('');
                setLorongDescription('');
                fetchLorongs();
            }
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to create Aisle');
        }
    };

    const handleDeleteLorong = async (id) => {
        const confirm = await showConfirm('Delete Aisle?', 'This will also delete all Shelves inside this Aisle. Cannot be undone.');
        if (!confirm.isConfirmed) return;

        try {
            const res = await api.delete(`${API_URL}/${id}`);
            if (res.data?.status === 'success') {
                showSuccess('Aisle deleted');
                fetchLorongs();
            }
        } catch (error) {
            console.error(error);
            showError('Failed to delete Aisle');
        }
    };

    // --- Shelf Functions ---
    const openRakModal = (lorongId) => {
        setSelectedLorongId(lorongId);
        setRakName('');
        setRakDescription('');
        setSelectedCategoryIds([]);
        setRakModalOpen(true);
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategoryIds(prev =>
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleCreateRak = async () => {
        if (!rakName.trim()) {
            showError('Shelf name is required');
            return;
        }

        try {
            const res = await api.post(`${API_URL}/rak/${selectedLorongId}`, {
                name: rakName,
                description: rakDescription,
                categoryIds: selectedCategoryIds
            });

            if (res.data?.status === 'success') {
                showSuccess('Shelf created successfully');
                setRakModalOpen(false);
                fetchLorongs();
            }
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to create Shelf');
        }
    };

    const handleDeleteRak = async (rakId) => {
        const confirm = await showConfirm('Delete Shelf?', 'This will permanently remove the Shelf.');
        if (!confirm.isConfirmed) return;

        try {
            const res = await api.delete(`${API_URL}/rak/${rakId}`);
            if (res.data?.status === 'success') {
                showSuccess('Shelf deleted');
                fetchLorongs();
            }
        } catch (error) {
            console.error(error);
            showError('Failed to delete Shelf');
        }
    };



    const openAssignModal = async (lorongName, rakName) => {
        setAssignTarget({ aisle: lorongName, rak: rakName });
        setIsAssigning(false);
        setSearchAssignQuery('');

        try {
            const effectiveStoreId = user?.ownerId || user?.memberOfId;
            const params = { status: 'ALL' }; // Important: fetch ALL otherwise might just get approved/pending
            const res = await getProductsByOwner(effectiveStoreId, params);

            // The API response depends on the controller and standard wrapper
            let wrappedProducts = [];
            if (Array.isArray(res)) {
                wrappedProducts = res;
            } else if (res && Array.isArray(res.products)) {
                wrappedProducts = res.products;
            } else if (res && res.data) {
                if (Array.isArray(res.data)) wrappedProducts = res.data;
                else if (Array.isArray(res.data.products)) wrappedProducts = res.data.products;
            }

            console.log('Fetched products for assignment:', wrappedProducts.length, wrappedProducts);
            setStoreProducts(wrappedProducts);

            const alreadyInRak = wrappedProducts.filter(p => p.aisle === lorongName && p.rak === rakName).map(p => p.id);
            setSelectedProductIds(alreadyInRak);

            setIsAssignModalOpen(true);
        } catch (error) {
            console.error(error);
            showError('Failed to fetch store products');
        }
    };

    const handleToggleAssignProduct = (productId) => {
        setSelectedProductIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSaveAssignments = async () => {
        setIsAssigning(true);
        try {
            const productsToUpdate = [];

            for (const p of storeProducts) {
                const isSelected = selectedProductIds.includes(p.id);
                const isCurrentlyInRak = p.aisle === assignTarget.aisle && p.rak === assignTarget.rak;

                if (isSelected && !isCurrentlyInRak) {
                    productsToUpdate.push({ id: p.id, data: { aisle: assignTarget.aisle, rak: assignTarget.rak } });
                } else if (!isSelected && isCurrentlyInRak) {
                    productsToUpdate.push({ id: p.id, data: { aisle: 'Uncategorized', rak: 'Unassigned' } });
                }
            }

            if (productsToUpdate.length > 0) {
                await Promise.all(productsToUpdate.map(update => updateProduct(update.id, update.data)));
                showSuccess('Products Assigned', `Successfully assigned ${productsToUpdate.length} products.`);
            }
            setIsAssignModalOpen(false);
        } catch (error) {
            console.error(error);
            showError('Failed to assign products');
        } finally {
            setIsAssigning(false);
        }
    };

    const assignFilteredProducts = storeProducts.filter(p => {
        if (!p || !p.name) return false;
        return p.name.toLowerCase().includes(searchAssignQuery.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-normal pb-20">
            {/* Header Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="flex mb-5" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
                        <li className="inline-flex items-center">
                            <Link to={getDashboardPath()} className="inline-flex items-center text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white transition-colors">
                                <Home className="w-4 h-4 mr-2" />
                                Home
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                <span className="ml-1 text-gray-700 hover:text-indigo-600 md:ml-2 dark:text-gray-300 dark:hover:text-white cursor-default">Management</span>
                            </div>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                <span className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page">Store Layout</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                            Store Layout Management
                        </h1>
                        <p className="text-sm font-normal text-gray-500 mt-1 dark:text-gray-400">
                            Coordinate and map your physical store layout
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setLorongModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Aisle
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4">
                {loading ? (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Mapping store layout...</span>
                        </div>
                    </div>
                ) : lorongs.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center mt-6">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-600">
                            <LayoutGrid className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Aisles Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6 text-sm">
                            You haven't set up any store layout yet. Add your first Aisle to get started.
                        </p>
                        <button
                            onClick={() => setLorongModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-all dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/50"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add First Aisle
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 w-16 text-center">No.</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Aisle Hierarchy</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">Description</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 text-center">Items</th>
                                        <th scope="col" className="p-4 text-xs font-medium text-right text-gray-500 uppercase dark:text-gray-400 text-center w-48">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                    {lorongs.map((lorong) => (
                                        <React.Fragment key={lorong.id}>
                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => toggleLorong(lorong.id)}>
                                                <td className="p-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white text-center">
                                                    <span className="text-xs font-bold text-gray-400 num-montserrat cursor-pointer hover:text-indigo-600">
                                                        {expandedLorongs[lorong.id] ? <ChevronDown className="w-5 h-5 mx-auto" /> : <ChevronRight className="w-5 h-5 mx-auto" />}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                                                            <LayoutGrid className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{lorong.name}</span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">Aisle</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {lorong.description || '-'}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-bold dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                        {lorong.raks?.length || 0} Shelves
                                                    </span>
                                                </td>
                                                <td className="p-4 flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openRakModal(lorong.id); }}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors dark:text-indigo-400 dark:hover:bg-indigo-900/30 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                                                        title="Add Shelf"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteLorong(lorong.id); }}
                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors dark:text-rose-400 dark:hover:bg-rose-900/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                                                        title="Delete Aisle"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>

                                            <AnimatePresence>
                                                {expandedLorongs[lorong.id] && lorong.raks?.map((rak) => (
                                                    <Motion.tr
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        key={rak.id}
                                                        className="bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors border-t-0"
                                                    >
                                                        <td className="p-4 border-l-2 border-indigo-200 dark:border-indigo-800 border-t border-t-gray-100 dark:border-t-gray-700"></td>
                                                        <td className="p-4 border-t border-t-gray-100 dark:border-t-gray-700 pl-8">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded bg-white dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                                                                    <Package className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500"></div>
                                                                        {rak.name}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Shelf in {lorong.name}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400 border-t border-t-gray-100 dark:border-t-gray-700">
                                                            <div className="line-clamp-2">{rak.description || '-'}</div>
                                                        </td>
                                                        <td className="p-4 border-t border-t-gray-100 dark:border-t-gray-700 text-center">
                                                            <div className="flex flex-wrap justify-center gap-1">
                                                                {rak.categories?.length > 0 ? rak.categories.map(rc => (
                                                                    <span key={rc.categoryId} className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                                                        {rc.category?.name}
                                                                    </span>
                                                                )) : (
                                                                    <span className="text-xs text-gray-400 italic">No Categories</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4 border-t border-t-gray-100 dark:border-t-gray-700 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => openAssignModal(lorong.name, rak.name)}
                                                                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30"
                                                                    title="Manage Products in Shelf"
                                                                >
                                                                    <ListPlus className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteRak(rak.id)}
                                                                    className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors dark:text-gray-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/30"
                                                                    title="Delete Shelf"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </Motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Tambah Lorong */}
            <AnimatePresence>
                {lorongModalOpen && (
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
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Aisle</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Aisle 1"
                                        value={lorongName}
                                        onChange={(e) => setLorongName(e.target.value)}
                                        className="block w-full px-3 py-2 rounded-lg text-sm border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Brief description of this aisle"
                                        value={lorongDescription}
                                        onChange={(e) => setLorongDescription(e.target.value)}
                                        className="block w-full px-3 py-2 rounded-lg text-sm border-gray-300 border focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => setLorongModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateLorong}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition"
                                >
                                    Save Aisle
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* Modal Tambah Rak */}
            <AnimatePresence>
                {rakModalOpen && (
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
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Shelf</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Snack Shelf"
                                        value={rakName}
                                        onChange={(e) => setRakName(e.target.value)}
                                        className="block w-full px-3 py-2 rounded-lg text-sm border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                                    <textarea
                                        rows={2}
                                        placeholder="What is stored here?"
                                        value={rakDescription}
                                        onChange={(e) => setRakDescription(e.target.value)}
                                        className="block w-full px-3 py-2 rounded-lg text-sm border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allowed Categories (Optional)</label>
                                    <div className="border border-gray-200 dark:border-gray-700 p-3 rounded-xl max-h-40 overflow-y-auto bg-gray-50/50 dark:bg-gray-800/50 flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => toggleCategory(cat.id)}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${selectedCategoryIds.includes(cat.id)
                                                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                        {categories.length === 0 && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">No categories defined. Configure them in POS Settings.</p>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Leave empty to allow any category in this Shelf.</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    onClick={() => setRakModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateRak}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition"
                                >
                                    Save Shelf
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>

            {/* Assign Products Modal */}
            <AnimatePresence>
                {isAssignModalOpen && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
                    >
                        <Motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-6 border-b dark:border-gray-700 bg-gray-50 flex items-center justify-between dark:bg-gray-800/50">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <ListPlus className="w-5 h-5 text-indigo-600" />
                                        Assign Products to Shelf
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                                        Select existing products from your inventory to place into {assignTarget.aisle} - {assignTarget.rak}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 border-b dark:border-gray-700">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by product name..."
                                        value={searchAssignQuery}
                                        onChange={(e) => setSearchAssignQuery(e.target.value)}
                                        className="pl-10 w-full p-2 text-sm border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 border outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {assignFilteredProducts.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        No products found in your inventory matching that search.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {assignFilteredProducts.map(product => {
                                            const isChecked = selectedProductIds.includes(product.id);
                                            return (
                                                <div
                                                    key={product.id}
                                                    onClick={() => handleToggleAssignProduct(product.id)}
                                                    className={`cursor-pointer border rounded-xl p-3 flex items-start gap-3 transition-colors ${isChecked ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700/50'}`}
                                                >
                                                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                                                        {isChecked && <Check className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 block w-full border-box">
                                                            Currently: {product.aisle || 'Uncategorized'} - {product.rak || 'Unassigned'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveAssignments}
                                    disabled={isAssigning}
                                    className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 transition-colors"
                                >
                                    {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Save Assignments
                                </button>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ManageRaksLorongs;
