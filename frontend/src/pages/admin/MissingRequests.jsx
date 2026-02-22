import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminMissingRequests } from '../../services/api.js';
import { Search, AlertCircle, TrendingUp, Package, ChevronRight, Globe } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const MissingRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await getAdminMissingRequests();
                if (res.status === 'success') {
                    setRequests(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch missing requests:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
    );

    return (
        <div className="space-y-12">

            <header className="space-y-1">
                <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Missed Opportunities<span className="text-rose-500">.</span></h1>
                <p className="text-slate-500 font-medium">Aggregated product requests not found in store databases.</p>
            </header>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100">Product Name</th>
                                <th className="px-8 py-5 text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Requests</th>
                                <th className="px-8 py-5 text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100">Store Context</th>
                                <th className="px-8 py-5 text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {requests.map((req, idx) => (
                                <Motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={req.id}
                                    className="hover:bg-slate-50/30 transition-colors group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                                                <AlertCircle className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <span className="font-bold text-slate-900">{req.product_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-4 py-1.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-700">
                                            {req.count}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-slate-900 text-sm">{req.owner?.name}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                <Globe className="w-3 h-3" /> {req.owner?.domain}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </Motion.tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium">
                                        No missing requests found yet. Platform is well-stocked!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MissingRequests;
