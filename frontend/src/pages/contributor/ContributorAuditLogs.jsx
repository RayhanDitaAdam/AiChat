import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, RefreshCw, Box } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import axios from 'axios';

const ContributorAuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/contributor/audit-logs');
            setLogs(response.data.logs || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            setError('Gagal mengambil log audit. Silakan coba lagi nanti.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-medium text-gray-900">AI Audit Logs</h1>
                    <p className="text-gray-500">Daftar produk yang dicari user tapi belum ada di toko (Missing Products).</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                    ))
                ) : logs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Belum ada missing requests</h3>
                        <p className="text-gray-500">Semua yang dicari user sudah tersedia atau belum ada data tercatat.</p>
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <Motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={log.id}
                            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                    <Search className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 capitalize">{log.query}</h3>
                                    <p className="text-sm text-gray-500">Permintaan ini dicari sebanyak <span className="font-medium text-indigo-600">{log.count}</span> kali.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center px-3 py-1 bg-amber-50 text-amber-600 text-xs font-medium rounded-full uppercase tracking-wider border border-amber-100">
                                    Missing
                                </span>
                                <p className="text-xs text-gray-400 mt-2">Terakhir: {new Date(log.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </Motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ContributorAuditLogs;
