import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Bike, Truck, User, Phone, FileText, Wrench, ArrowLeft, Loader2, ClipboardList, Home, ChevronRight } from 'lucide-react';
import { createWorkOrder } from '../../../services/api.js';
import { PATHS } from '../../../routes/paths.js';
import { showError, showSuccess } from '../../../utils/swal.js';

const VEHICLE_TYPES = [
    { value: 'MOTORCYCLE', label: 'Motorcycle', icon: Bike },
    { value: 'CAR', label: 'Car', icon: Car },
    { value: 'TRUCK', label: 'Truck', icon: Truck },
];

const CheckIn = ({ embedded = false }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        vehiclePlate: '',
        vehicleType: 'MOTORCYCLE',
        customerName: '',
        customerPhone: '',
        complaints: '',
        mechanic: '',
        notes: '',
    });

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.vehiclePlate || !form.customerName || !form.complaints) {
            showError('Please fill in vehicle plate, customer name, and complaints.');
            return;
        }
        setLoading(true);
        try {
            await createWorkOrder({ ...form, vehiclePlate: form.vehiclePlate.toUpperCase() });
            showSuccess('Check-in successful! Work order created.');
            navigate(PATHS.OWNER_WORKSHOP_QUEUE);
        } catch {
            showError('Failed to create work order');
        } finally {
            setLoading(false);
        }
    };

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
                                    <span className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page">Vehicle Check-In</span>
                                </div>
                            </li>
                        </ol>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm border border-indigo-200/50 dark:border-indigo-800">
                            <Car size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">Vehicle Check-In</h1>
                            <p className="text-sm font-normal text-gray-500 mt-1 dark:text-gray-400">Register new customer, vehicle, and diagnostic notes</p>
                        </div>
                    </div>
                </div>
            )}

            <div className={embedded ? "p-4" : "p-4 sm:p-6 lg:p-8"}>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Vehicle Info Card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Car className="w-4 h-4 text-gray-400" />
                                        Vehicle Information
                                    </h2>
                                </div>
                                <div className="p-6 space-y-5">
                                    {/* Vehicle Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                                        <div className="flex gap-3">
                                            {VEHICLE_TYPES.map(({ value, label, icon: Icon }) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setForm(prev => ({ ...prev, vehicleType: value }))}
                                                    className={`flex-1 flex flex-col items-center gap-2 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all ${form.vehicleType === value
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* License Plate */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            License Plate <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="vehiclePlate"
                                            value={form.vehiclePlate}
                                            onChange={handleChange}
                                            placeholder="e.g. B 1234 ABC"
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Complaints Card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-gray-400" />
                                        Complaints & Notes
                                    </h2>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Complaints / Issues <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="complaints"
                                            value={form.complaints}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Describe the vehicle issues or requested service..."
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes</label>
                                        <textarea
                                            name="notes"
                                            value={form.notes}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Internal notes for mechanics..."
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Customer + Actions */}
                        <div className="space-y-6">
                            {/* Customer Info */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        Customer
                                    </h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Customer Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={form.customerName}
                                            onChange={handleChange}
                                            placeholder="Full name"
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            name="customerPhone"
                                            value={form.customerPhone}
                                            onChange={handleChange}
                                            placeholder="08xx-xxxx-xxxx"
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Mechanic Assignment */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Wrench className="w-4 h-4 text-gray-400" />
                                        Assignment
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Assigned Mechanic</label>
                                        <input
                                            type="text"
                                            name="mechanic"
                                            value={form.mechanic}
                                            onChange={handleChange}
                                            placeholder="Mechanic name (optional)"
                                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                                    ) : (
                                        <><ClipboardList className="w-4 h-4" /> Create Work Order</>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(PATHS.OWNER_WORKSHOP_QUEUE)}
                                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckIn;
