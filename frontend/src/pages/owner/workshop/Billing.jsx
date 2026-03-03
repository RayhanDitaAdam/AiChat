import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Plus, Trash2, Loader2, Receipt, CheckCircle2, Car, Bike, Truck, BanknoteIcon, CreditCard, Smartphone, ClipboardList, ChevronLeft } from 'lucide-react';
import { getWorkOrders, updateWorkOrder, addWorkOrderItem, deleteWorkOrderItem } from '../../../services/api.js';
import { format } from 'date-fns';
import { showError, showSuccess } from '../../../utils/swal.js';
import { PATHS } from '../../../routes/paths.js';

const VEHICLE_ICON = { MOTORCYCLE: Bike, CAR: Car, TRUCK: Truck };

const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Cash', icon: BanknoteIcon, color: 'text-green-600' },
    { value: 'TRANSFER', label: 'Transfer', icon: CreditCard, color: 'text-blue-600' },
    { value: 'QRIS', label: 'QRIS', icon: Smartphone, color: 'text-purple-600' },
];

const Billing = ({ embedded = false }) => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const preselectedId = params.get('id');

    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [newItem, setNewItem] = useState({ type: 'PART', name: '', quantity: 1, unitPrice: '' });
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const data = await getWorkOrders('DONE');
            const list = data?.data || data || [];
            setOrders(list);
            if (preselectedId) {
                const found = list.find(o => o.id === preselectedId);
                if (found) setSelectedOrder(found);
            }
        } catch {
            showError('Failed to load orders');
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleAddItem = async () => {
        if (!selectedOrder || !newItem.name || !newItem.unitPrice) return;
        setActionLoading('add_item');
        try {
            await addWorkOrderItem(selectedOrder.id, { ...newItem, quantity: Number(newItem.quantity), unitPrice: Number(newItem.unitPrice) });
            showSuccess('Item added');
            setNewItem({ type: 'PART', name: '', quantity: 1, unitPrice: '' });
            await refreshSelected();
        } catch {
            showError('Failed to add item');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!selectedOrder) return;
        setActionLoading('del_' + itemId);
        try {
            await deleteWorkOrderItem(selectedOrder.id, itemId);
            showSuccess('Item removed');
            await refreshSelected();
        } catch {
            showError('Failed to remove item');
        } finally {
            setActionLoading(null);
        }
    };

    const handleMarkPaid = async () => {
        if (!selectedOrder) return;
        if (!window.confirm(`Mark this order as paid via ${paymentMethod}?`)) return;
        setActionLoading('pay');
        try {
            await updateWorkOrder(selectedOrder.id, { isPaid: true, paymentMethod });
            showSuccess('Order marked as paid!');
            await fetchOrders();
            setSelectedOrder(null);
        } catch {
            showError('Failed to mark as paid');
        } finally {
            setActionLoading(null);
        }
    };

    const refreshSelected = async () => {
        const data = await getWorkOrders('DONE');
        const list = data?.data || data || [];
        setOrders(list);
        const updated = list.find(o => o.id === selectedOrder?.id);
        if (updated) setSelectedOrder(updated);
    };

    const VIcon = VEHICLE_ICON[selectedOrder?.vehicleType] || Car;
    const totalCost = selectedOrder?.totalCost || 0;
    const unpaidOrders = orders.filter(o => !o.isPaid);
    const paidOrders = orders.filter(o => o.isPaid);

    return (
        <div className={embedded ? "p-4" : "bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8"}>
            {/* Page Header */}
            {!embedded && (
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Receipt className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Billing</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Manage invoices for completed work orders</p>
                        </div>
                    </div>
                    <Link to={PATHS.OWNER_WORKSHOP_QUEUE} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back to Queue
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left — Order List */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900 text-sm">Completed Orders</h2>
                            <span className="text-xs text-gray-500">{unpaidOrders.length} unpaid</span>
                        </div>

                        {loadingOrders ? (
                            <div className="py-12 flex justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="py-12 text-center px-4">
                                <ClipboardList className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No completed orders</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 max-h-[calc(100vh-240px)] overflow-y-auto">
                                {/* Unpaid */}
                                {unpaidOrders.length > 0 && (
                                    <>
                                        <div className="px-4 py-2 bg-gray-50">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Awaiting Payment</p>
                                        </div>
                                        {unpaidOrders.map(order => (
                                            <button
                                                key={order.id}
                                                onClick={() => { setSelectedOrder(order); setPaymentMethod('CASH'); }}
                                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${selectedOrder?.id === order.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}
                                            >
                                                <p className="font-semibold text-sm text-gray-900 tracking-wide">{order.vehiclePlate}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{order.customerName}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs text-gray-400">{format(new Date(order.createdAt), 'dd MMM')}</span>
                                                    <span className="text-xs font-medium text-gray-700">Rp {(order.totalCost || 0).toLocaleString()}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                )}

                                {/* Paid */}
                                {paidOrders.length > 0 && (
                                    <>
                                        <div className="px-4 py-2 bg-gray-50">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Paid</p>
                                        </div>
                                        {paidOrders.map(order => (
                                            <button
                                                key={order.id}
                                                onClick={() => { setSelectedOrder(order); }}
                                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${selectedOrder?.id === order.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-sm text-gray-900 tracking-wide">{order.vehiclePlate}</p>
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        <CheckCircle2 className="w-3 h-3" /> Paid
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{order.customerName}</p>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Invoice Detail */}
                <div className="xl:col-span-2">
                    {!selectedOrder ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-24">
                            <Receipt className="w-10 h-10 text-gray-200 mb-3" />
                            <p className="text-sm font-medium text-gray-500">Select an order to view invoice</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Order Summary Card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <VIcon className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-gray-900">{selectedOrder.vehiclePlate}</h2>
                                            <p className="text-xs text-gray-500">{selectedOrder.customerName} · {selectedOrder.customerPhone}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">{format(new Date(selectedOrder.createdAt), 'dd MMM yyyy')}</p>
                                        {selectedOrder.isPaid && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 mt-1">
                                                <CheckCircle2 className="w-3 h-3" /> Paid · {selectedOrder.paymentMethod}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Complaints */}
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Complaints</p>
                                    <p className="text-sm text-gray-700">{selectedOrder.complaints}</p>
                                </div>

                                {/* Line Items Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Qty</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Subtotal</th>
                                                {!selectedOrder.isPaid && <th className="px-6 py-3"></th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(selectedOrder.items || []).length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">No items added yet</td>
                                                </tr>
                                            ) : selectedOrder.items.map(item => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-3">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${item.type === 'PART' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                                            {item.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-gray-900">{item.name}</td>
                                                    <td className="px-6 py-3 text-center text-gray-500">{item.quantity}</td>
                                                    <td className="px-6 py-3 text-right text-gray-600">Rp {item.unitPrice.toLocaleString()}</td>
                                                    <td className="px-6 py-3 text-right font-medium text-gray-900">Rp {(item.unitPrice * item.quantity).toLocaleString()}</td>
                                                    {!selectedOrder.isPaid && (
                                                        <td className="px-6 py-3 text-right">
                                                            <button
                                                                onClick={() => handleDeleteItem(item.id)}
                                                                disabled={actionLoading === 'del_' + item.id}
                                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                {actionLoading === 'del_' + item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                        {(selectedOrder.items || []).length > 0 && (
                                            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                                                <tr>
                                                    <td colSpan={selectedOrder.isPaid ? 4 : 5} className="px-6 py-3 text-sm font-semibold text-gray-700 text-right">Total</td>
                                                    <td className="px-6 py-3 text-right text-base font-bold text-gray-900">Rp {totalCost.toLocaleString()}</td>
                                                    {!selectedOrder.isPaid && <td></td>}
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>

                                {/* Add Item Row */}
                                {!selectedOrder.isPaid && (
                                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Add Item</p>
                                        <div className="flex gap-2 flex-wrap">
                                            <select
                                                value={newItem.type}
                                                onChange={e => setNewItem(p => ({ ...p, type: e.target.value }))}
                                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="PART">Part</option>
                                                <option value="LABOR">Labor</option>
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Item description"
                                                value={newItem.name}
                                                onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                                                className="flex-1 min-w-[140px] px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                min={1}
                                                value={newItem.quantity}
                                                onChange={e => setNewItem(p => ({ ...p, quantity: e.target.value }))}
                                                className="w-16 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Unit price"
                                                value={newItem.unitPrice}
                                                onChange={e => setNewItem(p => ({ ...p, unitPrice: e.target.value }))}
                                                className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={handleAddItem}
                                                disabled={!newItem.name || !newItem.unitPrice || actionLoading === 'add_item'}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors"
                                            >
                                                {actionLoading === 'add_item' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Payment Card */}
                            {!selectedOrder.isPaid && (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Payment</h3>
                                    <div className="flex items-center gap-3 mb-4">
                                        {PAYMENT_METHODS.map(pm => (
                                            <button
                                                key={pm.value}
                                                type="button"
                                                onClick={() => setPaymentMethod(pm.value)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${paymentMethod === pm.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                <pm.icon className={`w-4 h-4 ${paymentMethod === pm.value ? 'text-blue-600' : pm.color}`} />
                                                {pm.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Total to collect</p>
                                            <p className="text-2xl font-bold text-gray-900">Rp {totalCost.toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={handleMarkPaid}
                                            disabled={actionLoading === 'pay'}
                                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 rounded-lg transition-colors"
                                        >
                                            {actionLoading === 'pay' ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="w-4 h-4" />
                                            )}
                                            Mark as Paid
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Billing;
