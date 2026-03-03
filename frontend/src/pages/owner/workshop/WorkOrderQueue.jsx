import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Search, RefreshCw, Wrench, Clock, CheckCircle2, XCircle,
    Car, Bike, Truck, Trash2, ChevronRight, Loader2, ClipboardList, Home
} from 'lucide-react';
import { getWorkOrders, updateWorkOrder, deleteWorkOrder } from '../../../services/api.js';
import { format } from 'date-fns';
import { showError, showSuccess } from '../../../utils/swal.js';
import { PATHS } from '../../../routes/paths.js';

const VEHICLE_ICON = { MOTORCYCLE: Bike, CAR: Car, TRUCK: Truck };

const STATUS_CONFIG = {
    QUEUED: { label: 'Queued', color: 'bg-yellow-100 text-yellow-800 ring-yellow-200' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 ring-blue-200' },
    DONE: { label: 'Done', color: 'bg-green-100 text-green-800 ring-green-200' },
    CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600 ring-gray-200' },
};

const NEXT_STATUS = { QUEUED: 'IN_PROGRESS', IN_PROGRESS: 'DONE' };

const WorkOrderQueue = ({ embedded = false }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getWorkOrders();
            setOrders(data?.data || data || []);
        } catch {
            showError('Failed to load work orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleAdvanceStatus = async (order) => {
        const next = NEXT_STATUS[order.status];
        if (!next) return;
        setActionLoading(order.id + '_advance');
        try {
            await updateWorkOrder(order.id, { status: next });
            showSuccess(`Status updated to ${STATUS_CONFIG[next].label}`);
            fetchOrders();
        } catch {
            showError('Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (order) => {
        if (!window.confirm(`Delete work order for ${order.vehiclePlate}?`)) return;
        setActionLoading(order.id + '_delete');
        try {
            await deleteWorkOrder(order.id);
            showSuccess('Work order deleted');
            setOrders(prev => prev.filter(o => o.id !== order.id));
        } catch {
            showError('Failed to delete work order');
        } finally {
            setActionLoading(null);
        }
    };

    const filtered = orders.filter(o => {
        const matchSearch = !search || o.vehiclePlate.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const counts = { ALL: orders.length, QUEUED: 0, IN_PROGRESS: 0, DONE: 0, CANCELLED: 0 };
    orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

    return (
        <div className={embedded ? "" : "min-h-screen bg-gray-50 dark:bg-gray-900 font-normal overflow-x-hidden"}>
            {!embedded && (
                <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex mb-5" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
                            <li className="inline-flex items-center">
                                <Link to={PATHS.OWNER_DASHBOARD} className="inline-flex items-center text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white">
                                    <Home className="w-4 h-4 mr-2" />
                                    Home
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                    <span className="ml-1 text-gray-700 hover:text-indigo-600 md:ml-2 dark:text-gray-300 dark:hover:text-white cursor-default">Workshop</span>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                    <span className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page">Work Orders</span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm border border-indigo-200/50 dark:border-indigo-800">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">Work Order Queue</h1>
                                <p className="text-sm font-normal text-gray-500 mt-1 dark:text-gray-400">Manage ongoing repairs and vehicle statuses</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                {[
                                    { value: 'ALL', label: 'All Orders' },
                                    { value: 'PENDING', label: 'Pending' },
                                    { value: 'IN_PROGRESS', label: 'Progress' }
                                ].map(t => (
                                    <button
                                        key={t.value}
                                        onClick={() => setFilterStatus(t.value)}
                                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${filterStatus === t.value ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {embedded && (
                <div className="p-4 pb-0">
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
                        {[
                            { value: 'ALL', label: 'All Orders' },
                            { value: 'PENDING', label: 'Pending' },
                            { value: 'IN_PROGRESS', label: 'Progress' }
                        ].map(t => (
                            <button
                                key={t.value}
                                onClick={() => setFilterStatus(t.value)}
                                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${filterStatus === t.value ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-4">
                {/* Page Header - This section is now conditionally rendered above or removed if embedded */}
                {!embedded && (
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <ClipboardList className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Work Orders</h1>
                                <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
                            </div>
                        </div>
                        <Link
                            to={PATHS.OWNER_WORKSHOP_CHECKIN}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Check-In
                        </Link>
                    </div>
                )}

                {/* Main Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    {/* Toolbar */}
                    <div className="px-4 py-4 sm:px-6 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by plate or customer..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['ALL', 'QUEUED', 'IN_PROGRESS', 'DONE', 'CANCELLED'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${filterStatus === s
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    {STATUS_CONFIG[s]?.label || 'All'} {counts[s] > 0 && `(${counts[s]})`}
                                </button>
                            ))}
                            <button onClick={fetchOrders} className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Complaints</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">Loading work orders...</p>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-500">No work orders found</p>
                                            <p className="text-xs text-gray-400 mt-1">Try adjusting the search or filter</p>
                                        </td>
                                    </tr>
                                ) : filtered.map(order => {
                                    const VIcon = VEHICLE_ICON[order.vehicleType] || Car;
                                    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.QUEUED;
                                    const nextSt = NEXT_STATUS[order.status];
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <VIcon className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 tracking-wide">{order.vehiclePlate}</p>
                                                        <p className="text-xs text-gray-400 capitalize">{order.vehicleType?.toLowerCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{order.customerName}</p>
                                                {order.customerPhone && <p className="text-xs text-gray-400">{order.customerPhone}</p>}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="text-gray-600 text-sm truncate">{order.complaints}</p>
                                                {order.mechanic && <p className="text-xs text-gray-400 mt-0.5">🔧 {order.mechanic}</p>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${statusCfg.color}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                                                {format(new Date(order.createdAt), 'dd MMM yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Advance Status */}
                                                    {nextSt && (
                                                        <button
                                                            onClick={() => handleAdvanceStatus(order)}
                                                            disabled={actionLoading === order.id + '_advance'}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {actionLoading === order.id + '_advance' ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : nextSt === 'IN_PROGRESS' ? (
                                                                <Wrench className="w-3 h-3" />
                                                            ) : (
                                                                <CheckCircle2 className="w-3 h-3" />
                                                            )}
                                                            {STATUS_CONFIG[nextSt]?.label}
                                                        </button>
                                                    )}
                                                    {/* Billing link for DONE */}
                                                    {order.status === 'DONE' && (
                                                        <Link
                                                            to={`${PATHS.OWNER_WORKSHOP_BILLING}?id=${order.id}`}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                                                        >
                                                            <ChevronRight className="w-3 h-3" />
                                                            Billing
                                                        </Link>
                                                    )}
                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDelete(order)}
                                                        disabled={actionLoading === order.id + '_delete'}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    >
                                                        {actionLoading === order.id + '_delete' ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer count */}
                    {!loading && filtered.length > 0 && (
                        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-500">
                            Showing {filtered.length} of {orders.length} work orders
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkOrderQueue;
