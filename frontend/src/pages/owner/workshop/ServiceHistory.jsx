import React, { useState } from 'react';
import { Search, History, ChevronDown, ChevronUp, Loader2, Car, Bike, Truck, FileText, CheckCircle2, XCircle, Clock, Wrench } from 'lucide-react';
import { getVehicleHistory } from '../../../services/api.js';
import { format } from 'date-fns';
import { showError } from '../../../utils/swal.js';

const VEHICLE_ICON = { MOTORCYCLE: Bike, CAR: Car, TRUCK: Truck };

const STATUS_CONFIG = {
    QUEUED: { label: 'Queued', color: 'bg-yellow-100 text-yellow-800 ring-yellow-200', icon: Clock },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 ring-blue-200', icon: Wrench },
    DONE: { label: 'Done', color: 'bg-green-100 text-green-800 ring-green-200', icon: CheckCircle2 },
    CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600 ring-gray-200', icon: XCircle },
};

const ServiceHistory = ({ embedded = false }) => {
    const [plate, setPlate] = useState('');
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!plate.trim()) return;
        setLoading(true);
        setSearched(false);
        try {
            const data = await getVehicleHistory(plate.trim().toUpperCase());
            setResults(data?.data || data || []);
            setSearched(true);
            setExpanded(null);
        } catch {
            showError('Failed to fetch history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={embedded ? "p-4" : "bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8"}>
            {/* Page Header */}
            {!embedded && (
                <div className="mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <History className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Service History</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Search past service records by vehicle plate</p>
                    </div>
                </div>
            )}

            {/* Search Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={plate}
                            onChange={e => setPlate(e.target.value.toUpperCase())}
                            placeholder="Enter license plate, e.g. B 1234 ABC"
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase tracking-widest"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !plate.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Search
                    </button>
                </form>
            </div>

            {/* Results */}
            {searched && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">
                            Results for <span className="text-blue-600 font-mono">{plate}</span>
                        </h2>
                        <span className="text-sm text-gray-500">{results.length} record{results.length !== 1 ? 's' : ''}</span>
                    </div>

                    {results.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-500">No service records found</p>
                            <p className="text-xs text-gray-400 mt-1">Try checking the plate number</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {results.map((order) => {
                                const VIcon = VEHICLE_ICON[order.vehicleType] || Car;
                                const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.DONE;
                                const StatusIcon = statusCfg.icon;
                                const isOpen = expanded === order.id;

                                return (
                                    <div key={order.id}>
                                        {/* Row */}
                                        <button
                                            onClick={() => setExpanded(isOpen ? null : order.id)}
                                            className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                                        >
                                            <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                                <VIcon className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="font-semibold text-gray-900 tracking-wide">{order.vehiclePlate}</span>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${statusCfg.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusCfg.label}
                                                    </span>
                                                    {order.isPaid && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                            Paid
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                    <span>{order.customerName}</span>
                                                    <span>•</span>
                                                    <span>{format(new Date(order.createdAt), 'dd MMM yyyy')}</span>
                                                    {order.totalCost != null && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-medium text-gray-700">Rp {order.totalCost.toLocaleString()}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {isOpen ? (
                                                <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            )}
                                        </button>

                                        {/* Expanded Detail */}
                                        {isOpen && (
                                            <div className="px-6 pb-6 bg-gray-50 border-t border-gray-100">
                                                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Left - Complaints & Notes */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Complaints</p>
                                                            <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">{order.complaints}</p>
                                                        </div>
                                                        {order.notes && (
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notes</p>
                                                                <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">{order.notes}</p>
                                                            </div>
                                                        )}
                                                        {order.mechanic && (
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mechanic</p>
                                                                <p className="text-sm text-gray-700">{order.mechanic}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right - Parts/Labor */}
                                                    {order.items && order.items.length > 0 && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Parts & Labor</p>
                                                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                                <table className="w-full text-sm">
                                                                    <thead className="bg-gray-50">
                                                                        <tr>
                                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                                                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-100">
                                                                        {order.items.map(item => (
                                                                            <tr key={item.id}>
                                                                                <td className="px-3 py-2">
                                                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-xs mr-2 ${item.type === 'PART' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                                                        {item.type}
                                                                                    </span>
                                                                                    {item.name}
                                                                                </td>
                                                                                <td className="px-3 py-2 text-center text-gray-500">{item.quantity}</td>
                                                                                <td className="px-3 py-2 text-right font-medium text-gray-700">Rp {(item.unitPrice * item.quantity).toLocaleString()}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                    <tfoot className="bg-gray-50 border-t border-gray-200">
                                                                        <tr>
                                                                            <td colSpan={2} className="px-3 py-2 text-sm font-semibold text-gray-700">Total</td>
                                                                            <td className="px-3 py-2 text-right text-sm font-bold text-gray-900">Rp {(order.totalCost || 0).toLocaleString()}</td>
                                                                        </tr>
                                                                    </tfoot>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ServiceHistory;
