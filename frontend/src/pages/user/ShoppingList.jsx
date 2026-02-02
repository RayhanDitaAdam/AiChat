import React, { useState, useEffect } from 'react';
import { getShoppingList, removeFromShoppingList, printShoppingList } from '../../services/api.js';
import { ShoppingBag, Trash2, MapPin, Package, ArrowRight, Loader2, Printer, X, Globe, Server } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../context/ToastContext.js';

const ShoppingList = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const fetchList = async () => {
        try {
            const res = await getShoppingList();
            if (res.status === 'success') {
                setList(res.list);
            }
        } catch (err) {
            console.error('Failed to load shopping list:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    const handleRemove = async (itemId) => {
        try {
            await removeFromShoppingList(itemId);
            await fetchList();
        } catch {
            showToast('Failed to remove item', 'error');
        }
    };

    const handlePrintIP = async () => {
        setIsPrinting(true);
        try {
            const res = await printShoppingList();
            if (res.status === 'success') {
                showToast('Print job sent to thermal printer! 🖨️', 'success');
                setIsPrintModalOpen(false);
            } else {
                showToast(res.message || 'Failed to print', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to print. Check your printer settings in Profile.', 'error');
        } finally {
            setIsPrinting(false);
        }
    };

    const handleBrowserPrint = () => {
        setIsPrintModalOpen(false);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const handleSendToPhone = () => {
        if (!user?.phone) {
            showToast('Please add your phone number in Profile first!', 'warning');
            return;
        }

        const items = list?.items || [];
        if (items.length === 0) return;

        let message = `*DAFTAR BELANJA SAYA*\n`;
        message += `==========================\n\n`;

        items.forEach((item, idx) => {
            message += `${idx + 1}. *${item.product.name}*\n`;
            message += `   Jumlah: ${item.quantity}\n`;
            message += `   Lokasi: Lorong ${item.product.aisle} - Rak ${item.product.rak}\n\n`;
        });

        message += `==========================\n`;
        message += `Dikirim dari Heart Assistant`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${user.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const items = list?.items || [];

    return (
        <div className="max-w-4xl space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Shopping Queue<span className="text-indigo-600">.</span></h1>
                    <p className="text-slate-400 font-bold text-sm tracking-wide uppercase">Items you've added from Heart assistant</p>
                </div>
                {items.length > 0 && (
                    <button
                        onClick={() => setIsPrintModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <Printer className="w-5 h-5 text-indigo-600" />
                        Print Options
                    </button>
                )}
            </header>

            {/* Print Settings Modal */}
            <AnimatePresence>
                {isPrintModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 overflow-hidden">
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPrintModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl mx-4"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select Print Method</h2>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">How would you like to print your list?</p>
                                </div>
                                <button
                                    onClick={() => setIsPrintModalOpen(false)}
                                    className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={handlePrintIP}
                                    disabled={isPrinting}
                                    className="group flex flex-col items-center text-center p-8 bg-indigo-50/50 hover:bg-indigo-50 rounded-[2rem] border-2 border-transparent hover:border-indigo-200 transition-all duration-300"
                                >
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <Server className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    <h4 className="font-black text-slate-900 mb-1">Print via IP</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Network Thermal Printer (POS)</p>
                                </button>

                                <button
                                    onClick={handleBrowserPrint}
                                    className="group flex flex-col items-center text-center p-8 bg-emerald-50/50 hover:bg-emerald-50 rounded-[2rem] border-2 border-transparent hover:border-emerald-200 transition-all duration-300"
                                >
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <Globe className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <h4 className="font-black text-slate-900 mb-1">Browser Print</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">System Dialog (Standard A4/Letter)</p>
                                </button>
                            </div>

                            <div className="p-8 bg-slate-50 border-t border-slate-100 italic text-[10px] text-slate-400 font-medium text-center">
                                Tip: Set your network printer IP in Profile settings for direct thermal printing.
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Hidden Printable Area */}
            <div className="print-area fixed top-0 left-[-9999px] w-full p-8 bg-white text-black font-sans pointer-events-none opacity-0">
                <div className="text-center mb-8 pb-8 border-b-2 border-black/10">
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">Shopping List</h1>
                    <p className="text-sm font-bold opacity-60 uppercase tracking-widest">Heart AI Assistant • {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                <div className="space-y-6">
                    {items.map((item, idx) => (
                        <div key={item.id} className="flex items-start gap-6 pb-6 border-b border-dashed border-black/10">
                            <span className="text-xl font-black opacity-20">{String(idx + 1).padStart(2, '0')}</span>
                            <div className="flex-1">
                                <h3 className="text-xl font-black leading-none mb-2">{item.product.name}</h3>
                                <div className="flex gap-4 text-sm font-bold opacity-60">
                                    <span>Qty: {item.quantity}</span>
                                    <span>•</span>
                                    <span>Lorong {item.product.aisle}</span>
                                    <span>•</span>
                                    <span>Rak {item.product.rak}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-black">Rp {item.product.price.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t-2 border-black flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Items</p>
                        <p className="text-xl font-black">{items.length}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Estimated Total</p>
                        <p className="text-3xl font-black">
                            Rp {items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>

                <div className="mt-20 text-center opacity-40">
                    <p className="text-xs font-bold uppercase tracking-[0.3em]">Thank you for shopping with Heart</p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-20 text-center shadow-sm">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <ShoppingBag className="w-10 h-10 text-indigo-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">No Items Found</h3>
                    <p className="text-slate-400 font-medium max-w-xs mx-auto">Your list is empty. Ask Heart about products to start adding them here!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {items.map((item) => (
                            <Motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={item.id}
                                className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-100 transition-all shadow-sm flex items-center gap-6 group"
                            >
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                                    <Package className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                </div>

                                <div className="flex-1 text-left">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-black text-xl text-slate-900">{item.product.name}</h3>
                                        <span className="bg-slate-900 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">x{item.quantity}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3 text-rose-400" />
                                            <span>Lorong {item.product.aisle} • Rak {item.product.rak}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-indigo-500">Rp {item.product.price.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRemove(item.id)}
                                    className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors"
                                    title="Remove from list"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </Motion.div>
                        ))}
                    </AnimatePresence>

                    <div
                        onClick={handleSendToPhone}
                        className="mt-8 p-10 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer hover:bg-black transition-colors"
                    >
                        <div className="space-y-1 text-center md:text-left">
                            <h4 className="text-2xl font-black tracking-tight">Ready to shop?</h4>
                            <p className="text-slate-400 font-bold text-sm tracking-wide uppercase">Take this list to your nearest store</p>
                        </div>
                        <div className="flex items-center gap-4 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] group-hover:gap-6 transition-all">
                            Send to Phone <ArrowRight className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShoppingList;
