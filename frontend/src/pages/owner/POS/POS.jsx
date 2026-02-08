import React, { useState, useEffect, useCallback } from 'react';
import { getPOSProducts, getPOSMembers, createTransaction, getPOSSettings } from '../../../services/api.js';
import {
    Search, ShoppingCart, UserPlus, Trash2,
    Banknote, CheckCircle2, QrCode, Package, X, Gift,
    ChevronUp, ArrowRight, Minus, Plus
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const POSPage = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [member, setMember] = useState(null);
    const [memberSearch, setMemberSearch] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSearchingMember, setIsSearchingMember] = useState(false);
    const [memberError, setMemberError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [settings, setSettings] = useState(null);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await getPOSProducts({ search });
            if (res.status === 'success') setProducts(res.data || []);
        } catch (err) { console.error(err); }
    }, [search]);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await getPOSSettings();
            if (res.status === 'success') setSettings(res.data);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchSettings();
    }, [fetchProducts, fetchSettings]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleMemberSearch = useCallback(async () => {
        if (!memberSearch.trim()) return;
        setIsSearchingMember(true);
        setMemberError(null);
        try {
            const res = await getPOSMembers({ search: memberSearch });
            if (res.status === 'success' && res.data.length > 0) {
                setMember(res.data[0]);
                setPointsToRedeem(0);
                setMemberSearch(''); // Clear search on success
            } else if (res.status === 'success') {
                setMemberError('Sync ID not found');
            }
        } catch (err) {
            console.error(err);
            setMemberError('Sync Failed');
        } finally {
            setIsSearchingMember(false);
        }
    }, [memberSearch]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (memberSearch.trim().length >= 3) {
                handleMemberSearch();
            } else {
                setMemberError(null);
            }
        }, 600);
        return () => clearTimeout(timeoutId);
    }, [memberSearch, handleMemberSearch]);

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountFromPoints = pointsToRedeem * (settings?.pointRedeemVal || 0);
    const total = Math.max(0, subtotal - discountFromPoints);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        try {
            const res = await createTransaction({
                total,
                discount: discountFromPoints,
                paymentMethod,
                memberId: member?.id,
                pointsToRedeem,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            });
            if (res.status === 'success') {
                setShowSuccess(true);
                setCart([]);
                setMember(null);
                setPointsToRedeem(0);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (err) {
            alert(err.message || 'Checkout failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-full flex flex-col">
            <div className="flex-1 flex h-full gap-4 p-4 bg-slate-50/50">
                {/* Left: Product Selection */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Terminal v1.0</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready for transaction</p>
                        </div>

                        <div className="relative group w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                            <input
                                type="text"
                                className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-slate-900 transition-all shadow-sm"
                                placeholder="Find products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xxl:grid-cols-5 gap-3">
                            {products?.map(product => (
                                <Motion.div
                                    key={product.id}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => addToCart(product)}
                                    className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-slate-900 transition-all cursor-pointer group"
                                >
                                    <div className="aspect-square bg-slate-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-slate-100 relative">
                                        {product.image ? (
                                            <img
                                                src={`http://localhost:4000${product.image}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                alt={product.name}
                                            />
                                        ) : (
                                            <Package size={20} className="text-slate-300" />
                                        )}
                                        <div className="absolute top-1.5 right-1.5">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm border ${product.stock < 10 ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-slate-900 border-slate-200'
                                                }`}>
                                                STK: {product.stock}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-tight line-clamp-1">
                                            {product.name}
                                        </h5>
                                        <p className="text-xs font-black text-indigo-600 tracking-tighter">
                                            Rp {product.price.toLocaleString()}
                                        </p>
                                    </div>
                                </Motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Checkout Sidebar */}
                <div className="w-[380px] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
                    <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 italic">Bill Details</h2>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">TID: NX-001</p>
                        </div>
                        <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black">
                            {cart.length} ITEMS
                        </div>
                    </header>

                    {/* Member Sync */}
                    <section className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        {!member ? (
                            <div className="space-y-2">
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        {isSearchingMember ? (
                                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <UserPlus className="w-4 h-4 text-slate-400" />
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Sync Member ID / Name..."
                                        className={`w-full h-10 pl-10 pr-4 bg-white border rounded-lg text-[9px] font-black uppercase tracking-widest focus:outline-none transition-all shadow-sm ${memberError ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-slate-900'
                                            }`}
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                    />
                                </div>
                                {memberError && (
                                    <p className="text-[8px] font-black uppercase text-rose-500 ml-1 tracking-widest">{memberError}</p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group">
                                <QrCode className="absolute -right-2 -bottom-2 w-16 h-16 text-white/5" />
                                <div className="relative z-10">
                                    <p className="font-bold text-[8px] uppercase tracking-widest text-indigo-400 mb-0.5">Verified</p>
                                    <p className="font-black text-xs uppercase italic tracking-tight">{member.name}</p>
                                    <p className="text-[9px] font-bold text-white/40 mt-1 uppercase tracking-widest">{member.points} pts</p>
                                </div>
                                <button onClick={() => { setMember(null); setPointsToRedeem(0); }} className="p-2 hover:bg-rose-500 rounded-lg transition-all relative z-10 group/btn">
                                    <X size={14} className="text-white/40 group-hover/btn:text-white" />
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Cart Items */}
                    <section className="px-6 py-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-200 py-10">
                                    <ShoppingCart size={40} strokeWidth={1} />
                                    <p className="text-[9px] font-black uppercase tracking-widest mt-2">EMPTY CART</p>
                                </div>
                            ) : cart.map(item => (
                                <Motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-900 transition-all group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-[10px] truncate uppercase text-slate-900 italic tracking-tight">{item.name}</p>
                                        <p className="text-[9px] text-indigo-600 font-black mt-0.5">Rp {item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-all">
                                            <Minus size={10} />
                                        </button>
                                        <span className="w-4 text-center text-[10px] font-black">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-all">
                                            <Plus size={10} />
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-slate-300 hover:text-rose-500">
                                        <Trash2 size={12} />
                                    </button>
                                </Motion.div>
                            ))}
                        </AnimatePresence>
                    </section>

                    {/* Footer Totals */}
                    <footer className="p-6 bg-slate-50 border-t border-slate-100">
                        <div className="space-y-2 mb-6 text-xs font-black">
                            <div className="flex justify-between items-center text-slate-400 uppercase tracking-widest text-[9px]">
                                <span>Subtotal</span>
                                <span>Rp {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-rose-500 uppercase tracking-widest text-[9px]">
                                <span>Discount</span>
                                <span>- Rp {discountFromPoints.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end pt-3 border-t border-slate-200">
                                <span className="text-[10px] uppercase italic text-slate-900">Total Payable</span>
                                <span className="text-2xl tracking-tighter italic text-slate-900">Rp {total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {['CASH', 'QRIS'].map(method => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${paymentMethod === method
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-900 hover:text-slate-900'
                                        }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing || cart.length === 0}
                            className="w-full h-14 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-3"
                        >
                            {isProcessing ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                                <>
                                    <Banknote size={14} /> Finish & Print
                                </>
                            )}
                        </button>
                    </footer>

                    {/* Overlay Success */}
                    <AnimatePresence>
                        {showSuccess && (
                            <Motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-white/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-center p-6"
                            >
                                <Motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mb-4 shadow-xl shadow-slate-200"
                                >
                                    <CheckCircle2 size={32} />
                                </Motion.div>
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Success</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Transaction logged successfully</p>
                            </Motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default POSPage;
