import React, { useState, useEffect, useCallback } from 'react';
import { getPOSProducts, createTransaction, getPOSSettings, lookupPOSMember, updateProduct, getBaseURL } from '../../../services/api.js';
import {
    Search, ShoppingCart, UserPlus, Trash2,
    Banknote, CheckCircle2, QrCode, Package, X, Gift,
    ChevronUp, ArrowRight, Minus, Plus, Eye, User
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import InvoiceDetail from '../../../components/InvoiceDetail.jsx';
import { useToast } from '../../../context/ToastContext.js';

const POSPage = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
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
    const [lastTransaction, setLastTransaction] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [settings, setSettings] = useState(null);
    const [pointsToRedeem, setPointsToRedeem] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All');

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

    const syncStockToDB = async (product, delta) => {
        try {
            const newStock = product.stock - delta;
            // Optimistic update
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));

            const res = await updateProduct(product.id, { stock: newStock });
            if (res.status !== 'success') {
                fetchProducts(); // Rollback
                showToast(t('pos.sync_failed'), 'error');
            }
        } catch {
            fetchProducts(); // Rollback
            showToast(t('pos.sync_failed'), 'error');
        }
    };

    const addToCart = (product) => {
        if (product.stock <= 0) return;

        syncStockToDB(product, 1);

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
        const item = cart.find(i => i.id === id);
        if (item) {
            const product = products.find(p => p.id === id);
            if (product) syncStockToDB(product, -item.quantity);
        }
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const product = products.find(p => p.id === id);
                if (!product) return item;

                if (delta > 0 && product.stock <= 0) {
                    showToast(t('pos.stock_limit_error', { stock: product.stock }), 'error');
                    return item;
                }

                syncStockToDB(product, delta);
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const handleMemberSearch = useCallback(async () => {
        if (!memberSearch.trim()) return;
        setIsSearchingMember(true);
        setMemberError(null);
        try {
            const res = await lookupPOSMember(memberSearch);
            if (res.status === 'success' && res.data) {
                setMember(res.data);
                setPointsToRedeem(0);
                setMemberSearch(''); // Clear search on success
            } else {
                setMemberError(t('pos.member_not_found'));
            }
        } catch (err) {
            console.error(err);
            setMemberError(t('pos.sync_failed'));
        } finally {
            setIsSearchingMember(false);
        }
    }, [memberSearch, t]);

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

    // Points earned calculation
    const pointsEarningRatio = settings?.pointRatio || 10000;
    const minSpendForPoints = settings?.pointMinSpend || 50000;
    const fridayMultiplier = settings?.pointFridayMultiplier || 1;
    const isFriday = new Date().getDay() === 5;

    let estimatedPointsEarned = 0;
    if (subtotal >= minSpendForPoints) {
        estimatedPointsEarned = Math.floor(subtotal / pointsEarningRatio);
        if (isFriday) estimatedPointsEarned *= fridayMultiplier;
    }

    const total = Math.max(0, subtotal - discountFromPoints);

    const categories = ['All', ...new Set(products.map(p => p.category || 'General'))];
    const filteredProducts = products.filter(p =>
        selectedCategory === 'All' || (p.category || 'General') === selectedCategory
    );

    const memberInputRef = React.useRef(null);

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
                    price: item.price,
                    skipStockUpdate: true
                }))
            });
            if (res.status === 'success') {
                setLastTransaction(res.data);
                setShowSuccess(true);
                setCart([]);
                setMember(null);
                setPointsToRedeem(0);
                fetchProducts(); // Auto-refresh stock levels
                setTimeout(() => {
                    if (!isPrinting) {
                        setShowSuccess(false);
                        setLastTransaction(null);
                        memberInputRef.current?.focus();
                    }
                }, 5000);
            }
        } catch (err) {
            showToast(err.message || t('pos.checkout_failed'), 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-full flex flex-col md:h-[calc(100vh-theme(spacing.16))]">
            <div className="flex-1 flex flex-col md:flex-row gap-4 p-2 md:p-4 bg-slate-50/50">
                {/* Left: Product Selection */}
                <div className="flex-1 flex flex-col min-w-0">
                    <header className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">{t('pos.terminal_title')}</h1>
                            <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mt-1">{t('pos.ready_desc')}</p>
                        </div>

                        <div className="relative group w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                            <input
                                type="text"
                                className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-900 transition-all shadow-sm"
                                placeholder={t('pos.find_products')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </header>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border whitespace-nowrap shadow-sm ${selectedCategory === cat
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-indigo-100'
                                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xxl:grid-cols-5 gap-y-12 gap-x-4 pt-14">
                            {filteredProducts?.map(product => (
                                <Motion.div
                                    key={product.id}
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => addToCart(product)}
                                    className={`relative bg-white border rounded-2xl p-4 pt-12 shadow-sm transition-all group ${product.stock <= 0
                                        ? 'opacity-60 grayscale border-rose-500 cursor-not-allowed pointer-events-none ring-1 ring-rose-500/50'
                                        : 'hover:border-slate-900 cursor-pointer border-slate-200'
                                        }`}
                                >
                                    {/* The "Head" - Circular Image */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white shadow-md bg-slate-50 flex items-center justify-center overflow-hidden z-10 transition-transform group-hover:scale-110">
                                        {product.image ? (
                                            <img
                                                src={`${getBaseURL()}${product.image}`}
                                                className="w-full h-full object-cover"
                                                alt={product.name}
                                            />
                                        ) : (
                                            <Package size={24} className="text-slate-300" />
                                        )}
                                    </div>

                                    {/* The "Body" - Card Content */}
                                    <div className="text-center space-y-2 mt-2">
                                        <h5 className="text-[10px] font-bold text-slate-900 uppercase tracking-tight line-clamp-2 min-h-[2.5em]">
                                            {product.name}
                                        </h5>
                                        <div className="flex flex-col items-center gap-1">
                                            <p className="text-xs font-bold text-indigo-600 tracking-tighter num-montserrat">
                                                Rp {product.price.toLocaleString()}
                                            </p>
                                            <div className="flex flex-col items-center gap-1 mt-0.5">
                                                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                                    +{Math.floor(product.price / (settings?.pointRatio || 10000))} {t('pos.points')}
                                                </p>
                                                <div
                                                    className={`px-2 py-0.5 rounded-full text-[7px] font-bold uppercase shadow-sm border ${product.stock < 10 ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-50 text-slate-500 border-slate-200'
                                                        }`}
                                                >
                                                    {t('pos.stock')}: {product.stock}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Checkout Sidebar */}
                <div className="w-full md:w-[360px] h-full flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 relative shrink-0 overflow-hidden">
                    <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
                        <div>
                            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-900 italic">{t('pos.bill_details')}</h2>
                            <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-1">TID: NX-001</p>
                        </div>
                        <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold num-montserrat">
                            {cart.length} {t('pos.items')}
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
                                        ref={memberInputRef}
                                        type="text"
                                        placeholder={t('pos.sync_member')}
                                        className={`w-full h-10 pl-10 pr-4 bg-white border rounded-lg text-[9px] font-medium uppercase tracking-widest focus:outline-none transition-all shadow-sm ${memberError ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-slate-900'
                                            }`}
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleMemberSearch();
                                            }
                                        }}
                                    />
                                </div>
                                {memberError && (
                                    <p className="text-[8px] font-semibold uppercase text-rose-500 ml-1 tracking-widest">{memberError}</p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group">
                                <QrCode className="absolute -right-2 -bottom-2 w-16 h-16 text-white/5" />
                                <div className="relative z-10">
                                    <p className="font-medium text-[8px] uppercase tracking-widest text-indigo-400 mb-0.5">{t('pos.verified')}</p>
                                    <p className="font-semibold text-xs uppercase italic tracking-tight">{member.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest num-montserrat">{member.points} {t('pos.points')}</p>
                                        {member.points >= (settings?.pointMinRedeem || 0) && (
                                            <button
                                                onClick={() => {
                                                    const maxRedeemByPercent = Math.floor(((subtotal * (settings?.pointMaxUsagePercent || 50)) / 100) / (settings?.pointRedeemVal || 1000));
                                                    const maxPossible = Math.min(member.points, maxRedeemByPercent);
                                                    const pts = window.prompt(`${t('pos.redeem')} ${t('pos.points')} (${t('pos.redeem_limit', { percent: settings?.pointMaxUsagePercent || 50 })}: ${maxPossible}):`, maxPossible);
                                                    if (pts) {
                                                        const num = parseInt(pts);
                                                        if (num > maxPossible) {
                                                            showToast(`${t('pos.redeem_limit', { percent: settings?.pointMaxUsagePercent || 50 })}: ${maxPossible}`, 'error');
                                                        } else if (num < (settings?.pointMinRedeem || 0)) {
                                                            showToast(t('pos.min_redeem', { min: settings?.pointMinRedeem || 0 }), 'error');
                                                        } else {
                                                            setPointsToRedeem(num);
                                                        }
                                                    }
                                                }}
                                                className="text-[8px] font-semibold underline decoration-indigo-400 underline-offset-2 hover:text-white transition-colors uppercase"
                                            >
                                                {t('pos.redeem')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <button onClick={() => { setMember(null); setPointsToRedeem(0); }} className="p-2 hover:bg-rose-500 rounded-lg transition-all relative z-10 group/btn">
                                        <X size={14} className="text-white/40 group-hover/btn:text-white" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Cart Items */}
                    <section className="px-6 py-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {cart.length === 0 ? (
                                <Motion.div
                                    key="empty-cart"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-slate-200 py-10"
                                >
                                    <ShoppingCart size={40} strokeWidth={1} />
                                    <p className="text-[9px] font-medium uppercase tracking-widest mt-2">{t('pos.empty_cart')}</p>
                                </Motion.div>
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
                                        <p className="font-semibold text-[10px] truncate uppercase text-slate-900 italic tracking-tight">{item.name}</p>
                                        <p className="text-[9px] text-indigo-600 font-semibold mt-0.5 num-montserrat">Rp {item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-all">
                                            <Minus size={10} />
                                        </button>
                                        <span className="w-4 text-center text-[10px] font-semibold num-montserrat">{item.quantity}</span>
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
                    <footer className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
                        <div className="space-y-2 mb-6 text-xs font-semibold">
                            <div className="flex justify-between items-center text-slate-400 uppercase tracking-widest text-[9px]">
                                <span>{t('pos.subtotal')}</span>
                                <span className="num-montserrat">Rp {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-rose-500 uppercase tracking-widest text-[9px]">
                                <span>{t('pos.discount')}</span>
                                <span className="num-montserrat">- Rp {discountFromPoints.toLocaleString()}</span>
                            </div>
                            {member && (
                                <div className="flex justify-between items-center text-emerald-600 uppercase tracking-widest text-[9px]">
                                    <span>{t('pos.est_earn')}</span>
                                    <span className="num-montserrat">+ {estimatedPointsEarned} {t('pos.points')}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end pt-3 border-t border-slate-200">
                                <span className="text-[10px] uppercase italic font-semibold text-slate-900">{t('pos.total_payable')}</span>
                                <span className="text-2xl tracking-tighter italic font-bold text-slate-900 num-montserrat">Rp {total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {['CASH', 'QRIS'].map(method => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-3 rounded-lg text-[9px] font-medium uppercase tracking-widest transition-all border ${paymentMethod === method
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-900 hover:text-slate-900'
                                        }`}
                                >
                                    {t(`pos.payment_methods.${method.toLowerCase()}`)}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing || cart.length === 0}
                            className="w-full h-14 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-3"
                        >
                            {isProcessing ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                                <>
                                    <Banknote size={14} /> {t('pos.finish_print')}
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
                                <h2 className="text-2xl font-bold italic tracking-tighter uppercase mb-2">{t('pos.success')}</h2>
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-6">{t('pos.success_desc')}</p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsPrinting(true);
                                        }}
                                        className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-semibold uppercase tracking-widest shadow-lg flex items-center gap-2"
                                    >
                                        <Eye size={14} /> View Invoice
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSuccess(false);
                                            setLastTransaction(null);
                                            setIsPrinting(false);
                                        }}
                                        className="px-6 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-[9px] font-semibold uppercase tracking-widest hover:text-slate-900 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </Motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isPrinting && lastTransaction && (
                            <InvoiceDetail
                                transaction={lastTransaction}
                                settings={settings}
                                onClose={() => {
                                    setIsPrinting(false);
                                    setShowSuccess(false);
                                    setLastTransaction(null);
                                }}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default POSPage;
