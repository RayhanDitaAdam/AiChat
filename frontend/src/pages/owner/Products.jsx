import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getProductsByOwner, createProduct, updateProduct, deleteProduct, uploadProducts } from '../../services/api.js';
import { Plus, Edit2, Trash2, XCircle, Package, MapPin, BadgeCheck, FileUp, Download, ArrowRight, Loader2, Image as ImageIcon, Layers, Tag, Info } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/Button.jsx';
import { useToast } from '../../context/ToastContext.js';

const Products = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { category: activeCategory } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        aisle: '',
        rak: '',
        category: '',
        halal: true,
        description: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

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
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (imageFile) {
                data.append('image', imageFile);
            }

            if (editingProduct) {
                await updateProduct(editingProduct.id, data);
            } else {
                await createProduct(data);
            }

            await fetchProducts();
            setIsFormOpen(false);
            setEditingProduct(null);
            setFormData({ name: '', price: '', stock: '', aisle: '', rak: '', category: '', halal: true, description: '' });
            setImageFile(null);
            setImagePreview(null);
            showToast('Produk berhasil disimpan! ✨', 'success');
        } catch {
            showToast('Gagal menyimpan produk bre.', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await deleteProduct(id);
            await fetchProducts();
            showToast('Produk berhasil dihapus! 🗑️', 'success');
        } catch {
            showToast('Gagal menghapus produk bre.', 'error');
        }
    };

    const openEdit = (p) => {
        setEditingProduct(p);
        setFormData({
            name: p.name,
            price: p.price.toString(),
            stock: p.stock.toString(),
            aisle: p.aisle,
            rak: p.rak,
            category: p.category || '',
            halal: p.halal,
            description: p.description || ''
        });
        setImagePreview(p.image ? `http://localhost:4000${p.image}` : null);
        setIsFormOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const res = await uploadProducts(file);
            showToast(res.message || 'Import successful!', 'success');
            await fetchProducts();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to upload Excel', 'error');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const downloadTemplate = () => {
        const headers = "Name,Price,Stock,Halal,Aisle,Rak,Category,Description\n";
        const exampleRow = "Contoh Produk,15000,50,true,A,1,General,Deskripsi contoh\n";
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

    // Category Logic
    const categories = ['All', ...new Set(products.map(p => p.category || 'General'))];
    const filteredProducts = activeCategory && activeCategory !== 'All'
        ? products.filter(p => (p.category || 'General') === activeCategory)
        : products;

    return (
        <div className="min-h-full p-8 bg-[#f9f9f9]/50">
            <div className="space-y-12">

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-100">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Inventory Hub<span className="text-indigo-600">.</span></h1>
                        <p className="text-slate-500 font-medium mt-1">Manage your storefront catalog and availability.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all"
                            title="Download Template Format"
                        >
                            <Download className="w-4 h-4" /> Template
                        </button>
                        <div className="relative">
                            <input
                                type="file"
                                id="excel-upload"
                                className="hidden"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleImportExcel}
                                disabled={isUploading}
                            />
                            <label
                                htmlFor="excel-upload"
                                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all font-bold text-sm cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                {isUploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <FileUp className="w-5 h-5" />
                                )}
                                Import Excel
                            </label>
                        </div>
                        <Button
                            onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                            className="bg-black text-white flex items-center gap-2 px-8 py-3.5 rounded-xl shadow-lg hover:bg-slate-800 transition-all font-bold"
                        >
                            <Plus className="w-5 h-5" /> Add New Item
                        </Button>
                    </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((p, idx) => (
                        <Motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                            key={p.id}
                            className="card overflow-hidden group border-slate-100 hover:border-indigo-200 transition-all duration-300"
                        >
                            <header className="flex justify-between items-start mb-0 pb-4">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 leading-tight">{p.name}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        {p.category || 'General'}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(p)} className="p-2 hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 rounded-xl transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </header>

                            <section className="px-0 relative aspect-video bg-slate-50 overflow-hidden">
                                {p.image ? (
                                    <img
                                        src={`http://localhost:4000${p.image}`}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 border-y border-slate-50">
                                        <Package className="w-10 h-10 mb-2 opacity-20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">No Image Preview</span>
                                    </div>
                                )}
                                {p.halal && (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-green-100">
                                        <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
                                        <span className="text-[10px] font-black text-green-600 uppercase tracking-tighter">HALAL</span>
                                    </div>
                                )}
                            </section>

                            <footer className="flex items-center gap-2 pt-5">
                                <span className="badge-outline bg-slate-50/50 flex items-center gap-1.5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all border-slate-100">
                                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-[10px] font-bold">L{p.aisle}-R{p.rak}</span>
                                </span>
                                <span className="badge-outline bg-slate-50/50 flex items-center gap-1.5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all border-slate-100">
                                    <Tag className="w-3.5 h-3.5 text-rose-500" />
                                    <span className="text-[10px] font-bold">Stock: {p.stock}</span>
                                </span>
                                <span className="ml-auto font-black text-slate-900 tracking-tight text-lg">
                                    Rp {p.price?.toLocaleString('id-ID')}
                                </span>
                            </footer>
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
                                className="bg-white w-full max-w-4xl rounded-2xl p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar"
                            >
                                <button onClick={() => { setIsFormOpen(false); setImageFile(null); setImagePreview(null); }} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 rounded-lg transition-colors">
                                    <XCircle className="w-6 h-6" />
                                </button>
                                <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                                    <Plus className="w-6 h-6 text-indigo-600" />
                                    {editingProduct ? 'Update Product Details' : 'Register New Inventory'}
                                </h2>

                                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Media</label>
                                            <div className="relative group aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-black transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer">
                                                {imagePreview ? (
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <ImageIcon className="w-10 h-10 text-slate-300 group-hover:text-black transition-colors mb-2" />
                                                        <span className="text-[10px] font-black text-slate-400 group-hover:text-black transition-colors uppercase tracking-widest">Upload Product Image</span>
                                                    </>
                                                )}
                                                <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Produk</label>
                                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-[#f9f9f9] border border-slate-200 px-6 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-bold text-slate-900"
                                                placeholder="Mis: Indomie Goreng" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Produk (Optional)</label>
                                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                rows="4"
                                                className="w-full bg-[#f9f9f9] border border-slate-200 px-6 py-3.5 rounded-2xl focus:outline-none focus:border-black transition-all font-bold text-slate-900 resize-none"
                                                placeholder="Ketik deskripsi produk lengkap di sini..." />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                                                <input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full bg-[#f9f9f9] border border-slate-200 px-6 py-3.5 rounded-2xl focus:outline-none focus:border-black transition-all font-bold text-slate-900"
                                                    placeholder="Mis: Instant Food" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga (Rp)</label>
                                                <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full bg-[#f9f9f9] border border-slate-200 px-6 py-3.5 rounded-2xl focus:outline-none focus:border-black transition-all font-bold text-slate-900" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stok</label>
                                                <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                                    className="w-full bg-[#f9f9f9] border border-slate-200 px-6 py-3.5 rounded-2xl focus:outline-none focus:border-black transition-all font-bold text-slate-900" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lorong</label>
                                                <input required value={formData.aisle} onChange={e => setFormData({ ...formData, aisle: e.target.value })}
                                                    className="w-full bg-[#f9f9f9] border border-slate-200 px-6 py-3.5 rounded-2xl focus:outline-none focus:border-black transition-all font-bold text-slate-900" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rak</label>
                                                <input required value={formData.rak} onChange={e => setFormData({ ...formData, rak: e.target.value })}
                                                    className="w-full bg-[#f9f9f9] border border-slate-200 px-6 py-3.5 rounded-2xl focus:outline-none focus:border-black transition-all font-bold text-slate-900" />
                                            </div>
                                        </div>

                                        <div className="flex items-center bg-[#f9f9f9] p-6 rounded-2xl border border-slate-100">
                                            <div className="flex items-center flex-1">
                                                <input type="checkbox" id="halal" checked={formData.halal} onChange={e => setFormData({ ...formData, halal: e.target.checked })}
                                                    className="w-5 h-5 rounded-lg border-slate-300 text-black focus:ring-black transition-all cursor-pointer" />
                                                <label htmlFor="halal" className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-4 cursor-pointer select-none">Sertifikasi Halal</label>
                                            </div>
                                            {formData.halal && <BadgeCheck className="w-6 h-6 text-green-500 animate-in fade-in zoom-in" />}
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <button type="submit" className="w-full bg-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3">
                                                <span>{editingProduct ? 'Save Product Changes' : 'Publish Product'}</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </Motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Products;
