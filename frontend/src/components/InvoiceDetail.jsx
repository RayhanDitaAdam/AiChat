import React, { useRef, useState } from 'react';
import { Phone, Mail, MapPin, Printer, Download, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../hooks/useAuth.js';
const InvoiceDetail = ({ transaction, settings, onClose }) => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const printRef = useRef();
    const [printMode, setPrintMode] = useState('standard'); // 'standard' or 'thermal'

    if (!transaction) return null;

    const formatLine = (left, right, width = 32) => {
        const leftStr = String(left);
        const rightStr = String(right);
        const space = width - leftStr.length - rightStr.length;
        return leftStr + " ".repeat(space > 0 ? space : 1) + rightStr;
    };

    const centerText = (text, width = 32) => {
        const str = String(text).toUpperCase();
        if (str.length >= width) return str.substring(0, width);
        const leftPadding = Math.floor((width - str.length) / 2);
        return " ".repeat(leftPadding) + str;
    };

    const generateThermalReceipt = () => {
        const width = user?.receiptWidth === '38mm' ? 24 : 32;
        const line = "-".repeat(width);
        const doubleLine = "=".repeat(width);

        let receipt = "";

        // Header
        receipt += centerText(settings?.storeName || "AiChat Store", width) + "\n";
        if (settings?.address) {
            // Split address if too long
            const addr = settings.address;
            if (addr.length > width) {
                receipt += centerText(addr.substring(0, width), width) + "\n";
                receipt += centerText(addr.substring(width, width * 2), width) + "\n";
            } else {
                receipt += centerText(addr, width) + "\n";
            }
        }
        if (settings?.phone) {
            receipt += centerText(settings.phone, width) + "\n";
        }
        receipt += "\n";

        // Date & TX ID
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.');
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
        const txId = transaction.id?.substring(transaction.id.length - 8).toUpperCase() || 'N/A';

        receipt += `TGL. ${dateStr}-${timeStr}  TX. ${txId}\n`;
        receipt += line + "\n";

        // Items
        transaction.items?.forEach(item => {
            const name = (item.product?.name || item.name || item.productId).toUpperCase();
            const itemTotal = (item.quantity * item.price).toLocaleString('id-ID');
            const priceStr = item.price.toLocaleString('id-ID');

            // Name on its own line
            receipt += name.substring(0, width) + "\n";
            // Qty and Price line
            const qtyLine = `${item.quantity.toString().padEnd(2)} x ${priceStr.padStart(8)}`;
            const space = width - qtyLine.length - itemTotal.length;
            receipt += qtyLine + " ".repeat(space > 0 ? space : 1) + itemTotal + "\n";
        });

        receipt += line + "\n";

        // Totals
        const subtotalValue = transaction.total + (transaction.discount || 0);
        receipt += formatLine("TOTAL", subtotalValue.toLocaleString('id-ID'), width) + "\n";
        if (transaction.discount > 0) {
            receipt += formatLine("DISKON", `-${transaction.discount.toLocaleString('id-ID')}`, width) + "\n";
        }

        receipt += doubleLine + "\n";
        receipt += formatLine("GRAND TOTAL", `Rp ${transaction.total.toLocaleString('id-ID')}`, width) + "\n";

        // Payment Info (Indomaret style usually shows Cash/Change)
        receipt += formatLine("BAYAR", (transaction.amountPaid || transaction.total).toLocaleString('id-ID'), width) + "\n";
        const change = (transaction.amountPaid || transaction.total) - transaction.total;
        receipt += formatLine("KEMBALI", change.toLocaleString('id-ID'), width) + "\n";

        if (transaction.pointsEarned) {
            receipt += line + "\n";
            receipt += formatLine("POIN BARU", `+${transaction.pointsEarned}`, width) + "\n";
            receipt += formatLine("TOTAL POIN", `${transaction.member?.points || transaction.pointsEarned}`, width) + "\n";
        }

        receipt += line + "\n";

        // Footer
        receipt += "\n" + centerText("TERIMA KASIH", width) + "\n";
        receipt += centerText("SELAMAT BELANJA KEMBALI", width) + "\n";

        return receipt;
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50,top=50,width=800,height=900');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice #${transaction.id}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Outfit', sans-serif; }
                        .num-montserrat { font-family: 'Montserrat', sans-serif; }
                        @media print {
                            .no-print { display: none; }
                            body { padding: 0; margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header Actions */}
                <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between no-print bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 italic">
                            Invoice Detail
                        </h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-200/50 p-1 rounded-xl gap-1">
                            <button
                                onClick={() => setPrintMode('standard')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${printMode === 'standard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Standard
                            </button>
                            <button
                                onClick={() => setPrintMode('thermal')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${printMode === 'thermal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Thermal
                            </button>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-600 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                        >
                            <Printer size={16} /> {t('reports.invoice.print')}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-rose-100 rounded-xl transition-all text-rose-500"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div ref={printRef} className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-white flex justify-center">
                    {printMode === 'thermal' ? (
                        <div className="bg-slate-50 p-8 rounded-2xl flex flex-col items-center">
                            <div className={`bg-white shadow-xl p-8 border-b-8 border-slate-200 relative inline-block transition-all duration-300 ${user?.receiptWidth === '38mm' ? 'min-w-[28ch]' : 'min-w-[36ch]'}`}>
                                {/* Receipt Decorative Cut */}
                                <div className="absolute -top-1 left-0 right-0 flex justify-between px-1 overflow-hidden">
                                    {[...Array(user?.receiptWidth === '38mm' ? 15 : 20)].map((_, i) => (
                                        <div key={i} className="w-4 h-2 bg-slate-50 rotate-45 -mt-1 transform origin-bottom shrink-0" />
                                    ))}
                                </div>

                                <div className="flex justify-center w-full">
                                    <div style={{
                                        width: user?.receiptWidth === '38mm' ? '24ch' : '32ch',
                                        fontFamily: '"Courier New", Courier, monospace',
                                        fontSize: user?.receiptWidth === '38mm' ? '14px' : '16px',
                                        whiteSpace: 'pre',
                                        lineHeight: '1.4',
                                        color: '#000',
                                        padding: '20px 0',
                                        fontWeight: '700',
                                        letterSpacing: '0px'
                                    }}>
                                        {generateThermalReceipt()}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center mt-4 border-t border-dashed border-slate-200 pt-4">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.origin + '/receipt/' + transaction.id)}`}
                                        alt="Receipt QR"
                                        className={`${user?.receiptWidth === '38mm' ? 'w-20 h-20' : 'w-24 h-24'} mb-2 opacity-80`}
                                    />
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Scan for Digital Receipt</p>
                                </div>

                                <div className="text-center mt-6">
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">--- Paper End ---</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white italic font-bold text-2xl shadow-xl uppercase">
                                            {(settings?.storeName?.[0] || 'A')}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold tracking-tighter uppercase italic leading-none">{settings?.storeName || 'AiChat Store'}</h2>
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mt-1">{settings?.storeTagline || 'Terminal Hub'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <MapPin size={14} className="shrink-0" />
                                            <p className="text-[11px] font-bold uppercase tracking-tight line-clamp-1">{settings?.address || 'Galaxy Street No. 42, AI City'}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Phone size={14} className="shrink-0" />
                                            <p className="text-[11px] font-bold uppercase tracking-tight">{settings?.phone || '+62 812-3456-7890'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left md:text-right">
                                    <h1 className="text-3xl font-bold tracking-tighter text-slate-900 uppercase italic leading-none mb-2">Invoice</h1>
                                    <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest num-montserrat mb-6">#{transaction.id}</p>

                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 md:inline-grid">
                                        <div className="text-left md:text-right">
                                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest leading-none">Date Issued</p>
                                            <p className="text-xs font-bold text-slate-900 mt-1 num-montserrat uppercase">
                                                {new Date(transaction.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest leading-none">Payment Method</p>
                                            <p className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-tight">{transaction.paymentMethod}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 py-8 border-y border-slate-100">
                                <div>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3 italic">Billed to:</p>
                                    <p className="text-sm font-bold text-slate-900 uppercase italic tracking-tight">{transaction.member?.name || 'Guest Customer'}</p>
                                    {transaction.member && (
                                        <>
                                            <p className="text-xs font-semibold text-slate-500 mt-1 num-montserrat">{transaction.member.email || 'customer@example.com'}</p>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-2 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                                                LOIALTY POINTS: {transaction.member.points}
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3 italic">Cashier:</p>
                                    <p className="text-sm font-bold text-slate-900 uppercase italic tracking-tight">{transaction.cashier?.name || 'System Auto'}</p>
                                    <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-widest">TID: NX-001</p>
                                </div>
                            </div>

                            <table className="w-full mb-12">
                                <thead>
                                    <tr className="border-b-2 border-slate-900">
                                        <th className="py-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-widest">Item Description</th>
                                        <th className="py-4 text-center text-[10px] font-medium text-slate-400 uppercase tracking-widest">Qty</th>
                                        <th className="py-4 text-right text-[10px] font-medium text-slate-400 uppercase tracking-widest">Price</th>
                                        <th className="py-4 text-right text-[10px] font-medium text-slate-400 uppercase tracking-widest">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {transaction.items?.map((item, i) => (
                                        <tr key={i} className="group italic font-medium">
                                            <td className="py-5">
                                                <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{item.product?.name || item.productId}</p>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{item.product?.category || 'General'}</p>
                                            </td>
                                            <td className="py-5 text-center text-xs font-bold text-slate-600 num-montserrat">{item.quantity}</td>
                                            <td className="py-5 text-right text-xs font-bold text-slate-600 num-montserrat">Rp {item.price.toLocaleString()}</td>
                                            <td className="py-5 text-right text-xs font-bold text-slate-900 num-montserrat">Rp {(item.price * item.quantity).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end pt-8 border-t border-slate-100">
                                <div className="w-full md:w-64 space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span className="num-montserrat text-slate-600">Rp {(transaction.total + (transaction.discount || 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-medium text-rose-500 uppercase tracking-widest">
                                        <span>Discount</span>
                                        <span className="num-montserrat">- Rp {(transaction.discount || 0).toLocaleString()}</span>
                                    </div>
                                    {transaction.pointsEarned && (
                                        <div className="flex justify-between items-center text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                            <span>Points Earned</span>
                                            <span className="num-montserrat">+ {transaction.pointsEarned} Pts</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-end pt-4 border-t-2 border-slate-900">
                                        <span className="text-xs font-bold text-slate-900 uppercase italic tracking-widest">Grand Total</span>
                                        <span className="text-2xl font-bold text-slate-900 tracking-tighter italic num-montserrat">Rp {transaction.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-16 pt-12 border-t border-slate-50 text-center">
                                <p className="text-xs font-bold text-slate-900 uppercase tracking-[0.3em] italic mb-3">Thank You for your visit</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                                    Please keep this receipt for warranty and return purposes. AI Chat Store, Empowering your business with Intelligence.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetail;
