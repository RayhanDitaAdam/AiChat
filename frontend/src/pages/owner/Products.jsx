import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getProductsByOwner, createProduct, updateProduct, deleteProduct } from '../../services/api.js';
import { Plus, Edit2, Trash2, XCircle, Package, MapPin, BadgeCheck } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/Button.jsx';

const Products = () => {
    const { user } = useAuth();
    const { category: activeCategory } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        aisle: '',
        section: '',
        category: '',
        halal: true
    });

    const fetchProducts = useCallback(async () => {
        const ownerId = user?.ownerId;
        if (!ownerId) return;

        try {
            const data = await getProductsByOwner(ownerId);
            setProducts(data.products || []);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        }
    }, [user]);

    useEffect(() => {
        let isCancelled = false;
        const loadProducts = async () => {
            if (!isCancelled) await fetchProducts();
        };
        loadProducts();
        return () => { isCancelled = true; };
    }, [fetchProducts]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock)
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
            } else {
                await createProduct(payload);
            }

            await fetchProducts();
            setIsFormOpen(false);
            setEditingProduct(null);
            setFormData({ name: '', price: '', stock: '', aisle: '', section: '', category: '', halal: true });
        } catch {
            alert('Failed to save product');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await deleteProduct(id);
            await fetchProducts();
        } catch {
            alert('Failed to delete');
        }
    };

    const openEdit = (p) => {
        setEditingProduct(p);
        setFormData({
            name: p.name,
            price: p.price.toString(),
            stock: p.stock.toString(),
            aisle: p.aisle,
            section: p.section,
            category: p.category || '',
            halal: p.halal
        });
        setIsFormOpen(true);
    };

    // Category Logic
    const categories = ['All', ...new Set(products.map(p => p.category || 'General'))];
    const filteredProducts = activeCategory && activeCategory !== 'All'
        ? products.filter(p => (p.category || 'General') === activeCategory)
        : products;

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-100">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory Hub<span className="text-indigo-600">.</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your storefront catalog and availability.</p>
                </div>
                <Button
                    onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                    className="bg-black text-white flex items-center gap-2 px-8 py-3.5 rounded-xl shadow-lg hover:bg-slate-800 transition-all font-bold"
                >
                    <Plus className="w-5 h-5" /> Add New Item
                </Button>
            </header>

            {/* Category Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => navigate(cat === 'All' ? '/owner/products' : `/owner/products/${cat}`)}
                        className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${(activeCategory === cat || (!activeCategory && cat === 'All'))
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p, idx) => (
                    <Motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                        key={p.id}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:border-indigo-100 transition-all group relative"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <Package className="w-5 h-5" />
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(p)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{p.category || 'General'}</span>
                                <h3 className="font-bold text-xl text-slate-900 leading-tight mt-0.5">{p.name}</h3>
                            </div>

                            <p className="font-black text-xl text-slate-900">Rp {p.price?.toLocaleString('id-ID')}</p>

                            <div className="flex flex-wrap gap-2 pt-2">
                                <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-500">
                                    <MapPin className="w-3 h-3 text-rose-400" /> Lorong {p.aisle} • Bagian {p.section}
                                </div>
                                <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-500">
                                    STOCK: {p.stock}
                                </div>
                                {p.halal && (
                                    <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full text-[10px] font-bold text-green-600">
                                        <BadgeCheck className="w-3 h-3" /> HALAL
                                    </div>
                                )}
                            </div>
                        </div>
                    </Motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                        <Motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-2xl p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <button onClick={() => setIsFormOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 rounded-lg transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">{editingProduct ? 'Edit Product' : 'New Product'}</h2>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Produk</label>
                                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-[#f9f9f9] border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-medium text-slate-900"
                                            placeholder="Mis: Kol Organik" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                                            <input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-[#f9f9f9] border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:border-black transition-all font-medium text-slate-900"
                                                placeholder="Mis: Sayuran" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga (Rp)</label>
                                            <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full bg-[#f9f9f9] border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:border-black transition-all font-medium text-slate-900" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stok</label>
                                            <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                                className="w-full bg-[#f9f9f9] border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:border-black transition-all font-medium text-slate-900" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lorong</label>
                                            <input required value={formData.aisle} onChange={e => setFormData({ ...formData, aisle: e.target.value })}
                                                className="w-full bg-[#f9f9f9] border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:border-black transition-all font-medium text-slate-900" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bagian</label>
                                            <input required value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })}
                                                className="w-full bg-[#f9f9f9] border border-slate-200 px-4 py-2.5 rounded-xl focus:outline-none focus:border-black transition-all font-medium text-slate-900" />
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-[#f9f9f9] p-4 rounded-xl border border-slate-100">
                                        <input type="checkbox" id="halal" checked={formData.halal} onChange={e => setFormData({ ...formData, halal: e.target.checked })}
                                            className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black transition-all cursor-pointer" />
                                        <label htmlFor="halal" className="text-sm font-medium text-slate-700 ml-3 cursor-pointer select-none">Produk ini teruji Halal</label>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="w-full bg-black text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">
                                        {editingProduct ? 'Save Changes' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Products;
