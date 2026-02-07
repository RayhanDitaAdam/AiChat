import React, { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../services/api';
import {
    Plus, Search, Edit3, Trash2,
    Package, Filter, X, Save, AlertCircle
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const InventoryPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({ name: '', price: '', stock: '', barcode: '', categoryId: '' });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [pRes, cRes] = await Promise.all([
                getProducts({ search }),
                getCategories()
            ]);
            if (pRes.status === 'success') setProducts(pRes.data);
            if (cRes.status === 'success') setCategories(cRes.data);
        } catch (err) { console.error(err); }
    }, [search]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('price', formData.price);
            payload.append('stock', formData.stock);
            payload.append('barcode', formData.barcode);
            payload.append('categoryId', formData.categoryId);
            if (imageFile) {
                payload.append('image', imageFile);
            }

            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
            } else {
                await createProduct(payload);
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData({ name: '', price: '', stock: '', barcode: '', categoryId: '' });
            setImageFile(null);
            setPreviewUrl(null);
            fetchData();
        } catch (err) { alert(err.message); }
    };

    const handleEdit = (p) => {
        setEditingProduct(p);
        setFormData({
            name: p.name,
            price: p.price,
            stock: p.stock,
            barcode: p.barcode,
            categoryId: p.categoryId
        });
        setPreviewUrl(p.image ? `http://localhost:5000${p.image}` : null);
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await deleteProduct(id);
            fetchData();
        } catch (err) { alert(err.message); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inventory Manager</h1>
                    <p className="text-muted-foreground text-sm">Manage products and stock levels</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({ name: '', price: '', stock: '', barcode: '', categoryId: '' });
                        setImageFile(null);
                        setPreviewUrl(null);
                        setIsModalOpen(true);
                    }}
                    className="btn"
                >
                    <Plus size={16} /> Add Product
                </button>
            </div>

            <div className="card overflow-hidden">
                <header className="px-8 py-6 bg-muted/20 border-b">
                    <div className="relative w-full max-w-sm group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                        <input
                            type="text"
                            placeholder="Search product name or barcode..."
                            className="input pl-11 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </header>
                <section className="px-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-muted text-muted-foreground">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Product Info</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Stock</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Price</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {products.map(p => (
                                    <tr key={p.id} className="hover:bg-foreground hover:text-background transition-all duration-300 group cursor-pointer">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden transition-colors group-hover:bg-background group-hover:text-foreground shadow-sm">
                                                    {p.image ? (
                                                        <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : <Package size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{p.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono transition-colors group-hover:text-background/50">SKU: {p.barcode || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-muted rounded-full text-[9px] font-black tracking-widest text-muted-foreground uppercase transition-colors group-hover:bg-background group-hover:text-foreground">
                                                {p.category?.name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`text-sm font-bold transition-colors ${p.stock < 10 ? 'text-destructive group-hover:text-rose-300' : 'text-foreground group-hover:text-background'}`}>
                                                {p.stock} <span className="text-[9px] opacity-40 ml-1 uppercase">Units</span>
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-sm tracking-tight">
                                            Rp {p.price.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(p)} className="w-10 h-10 flex items-center justify-center hover:bg-background hover:text-foreground rounded-xl transition-all shadow-sm">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} className="w-10 h-10 flex items-center justify-center text-destructive hover:bg-destructive hover:text-white rounded-xl transition-all shadow-sm">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <Motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <Motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg relative z-10"
                        >
                            <div className="card shadow-2xl">
                                <header className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                                    <button onClick={() => setIsModalOpen(false)} className="btn-sm-icon-ghost"><X size={18} /></button>
                                </header>
                                <section>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="flex justify-center">
                                            <label htmlFor="product-image" className="cursor-pointer group block">
                                                <div className="w-24 h-24 rounded border-2 border-dashed flex items-center justify-center overflow-hidden hover:border-foreground transition-colors bg-muted">
                                                    {previewUrl ? (
                                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center text-muted-foreground">
                                                            <Package size={24} />
                                                            <span className="text-[10px] font-bold uppercase mt-1">Photo</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <input id="product-image" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Name</label>
                                                <input
                                                    type="text" required
                                                    className="input w-full"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">SKU</label>
                                                <input
                                                    type="text"
                                                    className="input w-full"
                                                    value={formData.barcode}
                                                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Category</label>
                                                <select
                                                    required
                                                    className="select w-full"
                                                    value={formData.categoryId}
                                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Stock</label>
                                                <input
                                                    type="number" required
                                                    className="input w-full"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Price (IDR)</label>
                                            <input
                                                type="number" required
                                                className="input w-full text-lg font-bold"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>

                                        <button className="btn w-full mt-4 h-12">
                                            <Save size={16} /> Save Product
                                        </button>
                                    </form>
                                </section>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventoryPage;
