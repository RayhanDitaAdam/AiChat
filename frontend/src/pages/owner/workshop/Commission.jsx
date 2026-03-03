import React, { useState, useEffect } from 'react';
import { DollarSign, Loader2, Award, RefreshCw, TrendingUp, ClipboardList, ChevronDown } from 'lucide-react';
import { getMechanicCommissions } from '../../../services/api.js';
import { format } from 'date-fns';
import { showError } from '../../../utils/swal.js';

const Commission = ({ embedded = false }) => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));

    const fetch = async () => {
        setLoading(true);
        try { setCommissions((await getMechanicCommissions(month))?.data || []); }
        catch { showError('Failed to load commission data'); }
        finally { setLoading(false); }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetch(); }, [month]);

    const totalCommission = commissions.reduce((s, m) => s + m.commission, 0);
    const totalRevenue = commissions.reduce((s, m) => s + m.totalRevenue, 0);
    const totalJobs = commissions.reduce((s, m) => s + m.jobCount, 0);

    return (
        <div className={embedded ? "p-4" : "bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8"}>
            {/* Header */}
            <div className={`mb-6 flex items-center ${embedded ? 'justify-end' : 'justify-between'}`}>
                {!embedded && (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg"><DollarSign className="w-5 h-5 text-blue-600" /></div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Commission Report</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Auto-calculated from completed & paid work orders</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <input type="month" value={month} onChange={e => setMonth(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button onClick={fetch} className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Total Commission', value: `Rp ${totalCommission.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500' },
                    { label: 'Service Revenue', value: `Rp ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-blue-500' },
                    { label: 'Jobs Completed', value: totalJobs, icon: ClipboardList, color: 'bg-purple-500' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
                        <div className={`p-3 ${color} rounded-xl`}><Icon className="w-4 h-4 text-white" /></div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Commission Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900 text-sm">
                        Per Mechanic — {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Mechanic</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Specialization</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Jobs Done</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Revenue</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-center">Rate</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Commission</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-16 text-center"><Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" /></td></tr>
                            ) : commissions.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-400">No data for this period</td></tr>
                            ) : commissions.map(m => (
                                <tr key={m.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold text-sm">{m.name[0]?.toUpperCase()}</div>
                                            <p className="font-medium text-gray-900">{m.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{m.specialization || '—'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-bold">{m.jobCount}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-700">Rp {m.totalRevenue.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                                            <Award className="w-3 h-3" /> {m.commissionRate}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-lg font-bold text-green-700">Rp {m.commission.toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {!loading && commissions.length > 0 && (
                            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                                <tr>
                                    <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-gray-700 text-right">Total Commission to Pay</td>
                                    <td className="px-6 py-3 text-right text-lg font-bold text-green-700">Rp {totalCommission.toLocaleString()}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* Note */}
            <p className="mt-4 text-xs text-gray-400 text-center">
                Commission is calculated from <strong>DONE + Paid</strong> work orders in the selected month.
                Commission = Revenue × Rate%
            </p>
        </div>
    );
};

export default Commission;
