import React, { useState, useEffect } from 'react';
import { getTransactions, getSalesAnalytics, getTopSellingProducts, getStockAlerts } from '../services/api';
import {
    BarChart3, Download, Calendar, Filter,
    ArrowUpRight, ShoppingBag, CreditCard,
    TrendingUp, Package
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

const ReportsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [stockAlerts, setStockAlerts] = useState([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [period, setPeriod] = useState('daily');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tRes, sRes, tpRes, saRes] = await Promise.all([
                    getTransactions(dateRange),
                    getSalesAnalytics(period),
                    getTopSellingProducts(5),
                    getStockAlerts(10)
                ]);

                if (tRes.status === 'success') setTransactions(tRes.data);
                if (sRes.status === 'success') setSalesData(sRes.data);
                if (tpRes.status === 'success') setTopProducts(tpRes.data);
                if (saRes.status === 'success') setStockAlerts(saRes.data);
            } catch (err) { console.error(err); }
        };

        fetchData();
    }, [dateRange, period]);

    const exportToExcel = () => {
        const data = transactions.map(t => ({
            ID: t.id,
            Date: new Date(t.createdAt).toLocaleString(),
            Cashier: t.cashier?.name,
            Member: t.member?.name || 'Guest',
            Payment: t.paymentMethod,
            Discount: t.discount,
            Total: t.total
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
        XLSX.writeFile(wb, `Sales_Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Sales Report", 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

        const tableColumn = ["ID", "Date", "Cashier", "Member", "Total"];
        const tableRows = transactions.map(t => [
            t.id.slice(0, 8).toUpperCase(),
            new Date(t.createdAt).toLocaleDateString(),
            t.cashier?.name,
            t.member?.name || 'Guest',
            `Rp ${t.total.toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: 35,
            head: [tableColumn],
            body: tableRows,
        });

        doc.save(`Sales_Report_PDF_${new Date().toLocaleDateString()}.pdf`);
    };

    const totalRevenue = transactions.reduce((acc, curr) => acc + curr.total, 0);

    return (
        <div className="space-y-8 p-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
                    <p className="text-muted-foreground">Comprehensive sales and performance logs</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportToPDF} className="btn-outline">
                        <Download size={16} /> PDF
                    </button>
                    <button onClick={exportToExcel} className="btn">
                        <Download size={16} /> Excel
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="card">
                        <header>
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Filter Period</h2>
                        </header>
                        <section className="space-y-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPeriod('daily')}
                                    className={`flex-1 btn-sm ${period === 'daily' ? '' : 'btn-ghost'}`}
                                >
                                    Daily
                                </button>
                                <button
                                    onClick={() => setPeriod('monthly')}
                                    className={`flex-1 btn-sm ${period === 'monthly' ? '' : 'btn-ghost'}`}
                                >
                                    Monthly
                                </button>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Start Date</label>
                                <input
                                    type="date"
                                    className="input w-full"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">End Date</label>
                                <input
                                    type="date"
                                    className="input w-full"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="card bg-foreground text-background">
                        <header>
                            <h2 className="text-sm font-semibold uppercase tracking-wider opacity-70">Period Revenue</h2>
                        </header>
                        <section>
                            <h3 className="text-3xl font-bold">Rp {totalRevenue.toLocaleString()}</h3>
                        </section>
                        <footer className="opacity-70 text-xs">
                            <ArrowUpRight className="inline mr-1" size={12} /> From selected date range
                        </footer>
                    </div>

                    <div className="card">
                        <header>
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Top Selling</h2>
                        </header>
                        <section className="px-0">
                            {topProducts.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b last:border-0">
                                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden">
                                        {p.image ? <img src={`http://localhost:5000${p.image}`} className="w-full h-full object-cover" /> : <Package size={16} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{p.name}</p>
                                        <p className="text-xs text-muted-foreground">{p.totalSold} sold</p>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>

                    <div className="card">
                        <header>
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-destructive flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> Low Stock
                            </h2>
                        </header>
                        <section className="px-0">
                            {stockAlerts.length > 0 ? stockAlerts.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 hover:bg-destructive/5 transition-colors border-b last:border-0 border-destructive/10">
                                    <div className="w-8 h-8 bg-destructive text-destructive-foreground rounded flex items-center justify-center shrink-0 font-bold text-xs">
                                        {p.stock}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{p.name}</p>
                                        <p className="text-xs text-muted-foreground">Remaining</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-sm text-muted-foreground py-4">All stocks properly filled</p>
                            )}
                        </section>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="card">
                        <header>
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Revenue Trend</h2>
                        </header>
                        <section className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(value) => `Rp${value / 1000}k`} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="total" fill="#000" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </section>
                    </div>

                    <div className="card overflow-hidden">
                        <header className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Transaction Logs</h2>
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-muted-foreground" />
                                <span className="text-xs font-semibold text-muted-foreground">{transactions.length} records</span>
                            </div>
                        </header>
                        <section className="px-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-muted text-muted-foreground">
                                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Receipt ID</th>
                                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Cashier</th>
                                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Method</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {transactions.map(t => (
                                            <tr key={t.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs">#{t.id.slice(0, 8).toUpperCase()}</td>
                                                <td className="px-6 py-4 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-xs font-medium">{t.cashier?.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.member ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                                                        {t.member?.name || 'Guest'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{t.paymentMethod}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-sm">Rp {t.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
