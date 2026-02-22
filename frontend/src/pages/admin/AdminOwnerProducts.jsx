import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductsByOwner } from '../../services/api.js';
import { Package, BadgeCheck, Layers, Tag, ArrowLeft, Loader2 } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const AdminOwnerProducts = () => {
    const { ownerId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [owner, setOwner] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        if (!ownerId) return;
        try {
            const data = await getProductsByOwner(ownerId);
            setProducts(data.products || []);
            setOwner(data.owner);
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    }, [ownerId]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-sky-500" />
        </div>
    );

    return (
        <div className="min-h-full bg-[#f9f9f9]/50">
            <div className="space-y-8 p-4 md:p-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-900 shadow-sm hover:shadow-md"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                {owner?.name || 'Store Menu'}<span className="text-sky-500">.</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-sm italic">Reviewing inventory and product catalog.</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((p, idx) => (
                        <Motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                            key={p.id}
                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-sky-100 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase leading-tight">{p.name}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        {p.category || 'General'}
                                    </p>
                                </div>
                            </div>

                            <div className="aspect-video bg-slate-50 rounded-2xl overflow-hidden mb-4 relative">
                                {p.image ? (
                                    <img
                                        src={p.image.startsWith('http') ? p.image : `http://localhost:4000${p.image}`}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                        <Package className="w-10 h-10 mb-2 opacity-20" />
                                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">No Image</span>
                                    </div>
                                )}
                                {p.halal && (
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm flex items-center gap-1 border border-green-100">
                                        <BadgeCheck className="w-3 h-3 text-green-500" />
                                        <span className="text-[8px] font-bold text-green-600 uppercase tracking-tighter">Halal</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                                <span className="bg-slate-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-slate-100 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                    <Layers className="w-3 h-3 text-sky-500" />
                                    <span className="text-[10px] font-bold text-slate-600">
                                        {owner?.businessCategory === 'HOTEL' ? `${p.aisle} • Room ${p.rak}` : `${p.aisle}-${p.rak}`}
                                    </span>
                                </span>
                                <span className="bg-slate-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-slate-100 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                    <Tag className="w-3 h-3 text-rose-500" />
                                    <span className="text-[10px] font-bold text-slate-600">{p.stock} Qty</span>
                                </span>
                                <span className="ml-auto font-bold text-slate-900 tracking-tight text-lg">
                                    Rp {p.price?.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </Motion.div>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[2rem] border border-dashed border-slate-200">
                            <Package className="w-12 h-12 mb-4 opacity-10" />
                            <p className="font-bold text-sm">No products found for this store.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOwnerProducts;
