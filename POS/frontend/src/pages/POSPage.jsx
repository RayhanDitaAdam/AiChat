import React, { useState, useEffect, useCallback } from 'react';
import { getProducts, getMembers, createTransaction, getSettings } from '../services/api';
import {
    Search, ShoppingCart, UserPlus, Trash2,
    Banknote, CheckCircle2, QrCode, Package, X, Gift,
    ChevronUp
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
    const [showSuccess, setShowSuccess] = useState(false);
    const [settings, setSettings] = useState(null);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await getProducts({ search });
            if (res.status === 'success') setProducts(res.data);
        } catch (err) { console.error(err); }
    }, [search]);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await getSettings();
            if (res.status === 'success') setSettings(res.data);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

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

    const handleMemberSearch = async () => {
        try {
            const res = await getMembers({ search: memberSearch });
            if (res.status === 'success' && res.data.length > 0) {
                setMember(res.data[0]);
                setPointsToRedeem(0);
            }
        } catch (err) { console.error(err); }
    };

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
        <div className="flex h-full gap-8 relative overflow-hidden bg-white">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col min-w-0 space-y-6">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input
                        type="text"
                        className="w-full h-14 pl-12 pr-4 bg-gray-50 border-2 border-transparent rounded-2xl text-lg focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-300 font-bold"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                    <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {products.map(product => (
                            <Motion.div
                                key={product.id}
                                whileHover={{ y: -4 }}
                                onClick={() => addToCart(product)}
                                className="bg-white border-2 border-gray-50 rounded-2xl cursor-pointer group active:scale-[0.98] transition-all hover:border-black hover:shadow-2xl hover:shadow-black/5"
                            >
                                <section className="p-3">
                                    <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 mb-3 group-hover:bg-black group-hover:text-white transition-all duration-300 overflow-hidden">
                                        {product.image ? (
                                            <img src={`http://localhost:5000${product.image}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : <Package size={24} strokeWidth={1} />}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-[10px] leading-tight line-clamp-1 uppercase tracking-tight opacity-70 group-hover:opacity-100 transition-opacity">{product.name}</h3>
                                        <div className="flex justify-between items-baseline">
                                            <p className="font-black text-sm tracking-tighter text-black">Rp {product.price.toLocaleString()}</p>
                                            <span className="text-[7px] font-black opacity-40 uppercase tracking-widest">{product.stock} STK</span>
                                        </div>
                                    </div>
                                </section>
                            </Motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Checkout Sidebar */}
            <div className="w-[420px] shrink-0">
                <div className="h-full flex flex-col bg-white border-l-2 border-gray-100 relative">
                    <header className="px-8 py-10">
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none text-black">Billing</h2>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mt-3">Order Summary</p>
                    </header>

                    <section className="px-8 py-6 space-y-4 shrink-0">
                        {!member ? (
                            <div className="flex gap-2">
                                <div className="relative flex-1 group">
                                    <input
                                        type="text"
                                        placeholder="LINK MEMBER..."
                                        className="w-full h-12 pl-4 pr-4 bg-gray-50 border-2 border-transparent rounded-xl text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-gray-300"
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleMemberSearch()}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-black text-white p-5 rounded-2xl flex items-center justify-between shadow-2xl shadow-black/20">
                                <div className="min-w-0">
                                    <p className="font-black text-xs truncate uppercase italic tracking-widest">{member.name}</p>
                                    <p className="text-[8px] font-black uppercase opacity-50 mt-1 tracking-widest">{member.points} PTS</p>
                                </div>
                                <button onClick={() => { setMember(null); setPointsToRedeem(0); }} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="flex-1 overflow-y-auto custom-scrollbar px-8 py-2 space-y-2">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-200 space-y-2 py-20 grayscale">
                                    <ShoppingCart size={48} strokeWidth={1} />
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em]">No Items Added</p>
                                </div>
                            ) : cart.map(item => (
                                <Motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center gap-4 py-3 group border-b border-gray-50 last:border-0"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-[10px] truncate uppercase tracking-tight italic text-black">{item.name}</p>
                                        <p className="text-[9px] text-gray-400 font-black mt-0.5 tracking-widest opacity-60">Rp {item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center border-2 border-gray-100 hover:bg-black hover:text-white hover:border-black rounded-md font-black text-[10px] transition-all">-</button>
                                        <span className="w-4 text-center text-[10px] font-black text-black">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center border-2 border-gray-100 hover:bg-black hover:text-white hover:border-black rounded-md font-black text-[10px] transition-all">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-black transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </Motion.div>
                            ))}
                        </AnimatePresence>
                    </section>

                    <footer className="p-8 space-y-8 bg-white border-t border-gray-50">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">Total Value</span>
                                <span className="text-sm font-black tracking-tighter text-black">Rp {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end pt-6 border-t-2 border-black">
                                <span className="font-black text-[9px] text-gray-400 uppercase tracking-[0.4em] mb-1">Due Amount</span>
                                <span className="text-4xl font-black tracking-tighter italic text-black">Rp {total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {['CASH', 'QRIS'].map(method => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all border-2 ${paymentMethod === method ? 'bg-black text-white border-black shadow-xl shadow-black/10' : 'bg-transparent text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing || cart.length === 0}
                            className="w-full h-16 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] italic shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale"
                        >
                            {isProcessing ? <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto" /> : 'Settle Now'}
                        </button>
                    </footer>

                    {/* New Success Overlay focused only on sidebar */}
                    <AnimatePresence>
                        {showSuccess && (
                            <Motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center text-center p-10 text-white"
                            >
                                <Motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 rotate-12 shadow-2xl"
                                >
                                    <CheckCircle2 size={40} className="text-white" />
                                </Motion.div>
                                <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase italic">Success</h2>
                                <p className="opacity-60 font-black uppercase tracking-widest text-[9px]">Transaction Logged</p>
                            </Motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};


export default POSPage;
