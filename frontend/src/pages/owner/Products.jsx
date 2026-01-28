import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../../layouts/MainLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { getProductsByOwner, createProduct, updateProduct, deleteProduct } from '../../services/api.js';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Package, MapPin, BadgeCheck } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/Button.jsx';

const Products = () => {
    const { user } = useAuth();
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

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory Hub 📦</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage your storefront catalog and availability.</p>
                    </div>
                    <Button
                        onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                        className="bg-indigo-600 text-white flex items-center gap-2 px-8 py-4 rounded-2xl shadow-sm hover:bg-indigo-700 transition-colors font-black"
                    >
                        <Plus className="w-5 h-5" /> Add New Item
                    </Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((p, idx) => (
                        <Motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                            key={p.id}
                            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(p)} className="p-3 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors border border-slate-100">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors border border-slate-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">{p.category || 'General'}</span>
                                    <h3 className="font-black text-2xl text-slate-900 leading-tight mt-1">{p.name}</h3>
                                </div>

                                <p className="text-indigo-600 font-black text-2xl">Rp {p.price?.toLocaleString('id-ID')}</p>

                                <div className="flex flex-wrap gap-2">
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-[10px] font-bold text-slate-500">
                                        <MapPin className="w-3.5 h-3.5 text-rose-400" /> RA {p.aisle} • SEC {p.section}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-[10px] font-bold text-slate-500">
                                        STOCK: {p.stock}
                                    </div>
                                    {p.halal && (
                                        <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 text-[10px] font-bold text-green-600">
                                            <BadgeCheck className="w-3.5 h-3.5" /> HALAL
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {isFormOpen && (
                        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                            <Motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="bg-white w-full max-w-4xl rounded-3xl p-8 md:p-10 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto"
                            >
                                <button onClick={() => setIsFormOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-colors">
                                    <XCircle className="w-6 h-6" />
                                </button>
                                <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">{editingProduct ? 'Edit Product' : 'New Product'}</h2>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Produk</label>
                                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-bold text-slate-800"
                                                placeholder="Mis: Kol Organik" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                                            <input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-bold text-slate-800"
                                                placeholder="Mis: Sayuran" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga (Rp)</label>
                                            <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-bold text-slate-800" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stok</label>
                                            <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-bold text-slate-800" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aisle (Rak)</label>
                                            <input required value={formData.aisle} onChange={e => setFormData({ ...formData, aisle: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-bold text-slate-800" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1 space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section</label>
                                            <input required value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl focus:outline-none focus:border-indigo-500 transition-all font-bold text-slate-800" />
                                        </div>
                                        <div className="md:col-span-2 flex items-center bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 md:mt-5">
                                            <input type="checkbox" id="halal" checked={formData.halal} onChange={e => setFormData({ ...formData, halal: e.target.checked })}
                                                className="w-5 h-5 rounded border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" />
                                            <label htmlFor="halal" className="text-sm font-bold text-slate-700 ml-3 cursor-pointer select-none">Produk ini teruji Halal</label>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button type="submit" className="w-full md:w-fit bg-indigo-600 text-white px-10 h-14 rounded-2xl text-base font-black shadow-sm hover:bg-indigo-700 transition-colors">
                                            {editingProduct ? 'Update Product Details' : 'Initialize Product'}
                                        </Button>
                                    </div>
                                </form>
                            </Motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </MainLayout>
    );
};

export default Products;
