import React, { useState } from 'react';
import { Settings, Building, Phone, MapPin, Save, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth.js';
import { showSuccess } from '../../../utils/swal.js';

// Workshop Settings is stored in OwnerConfig / displayed from user context.
// This page allows editing shop profile for invoice printing.
const WorkshopSettings = () => {
    const { user } = useAuth();
    const owner = user?.owner || user?.memberOf;

    const [form, setForm] = useState({
        shopName: owner?.name || '',
        address: owner?.address || '',
        phone: '',
        taxId: '',
        invoiceFooter: 'Terima kasih atas kepercayaan Anda!',
        primaryColor: '#2563eb',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        // Settings are stored locally in localStorage for now (no dedicated endpoint needed)
        localStorage.setItem('workshop_settings', JSON.stringify(form));
        await new Promise(r => setTimeout(r, 500));
        setSaving(false);
        setSaved(true);
        showSuccess('Settings saved');
        setTimeout(() => setSaved(false), 3000);
    };

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg"><Settings className="w-5 h-5 text-blue-600" /></div>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Workshop Settings</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Shop profile for invoices & receipts</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left — Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shop Identity */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Building className="w-4 h-4 text-gray-400" /> Shop Identity
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop / Bengkel Name</label>
                                <input type="text" name="shopName" value={form.shopName} onChange={handleChange}
                                    placeholder="e.g. Bengkel Maju Jaya" className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Address
                                </label>
                                <textarea name="address" rows={3} value={form.address} onChange={handleChange}
                                    placeholder="Full address for invoice header" className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" /> Phone
                                    </label>
                                    <input type="text" name="phone" value={form.phone} onChange={handleChange}
                                        placeholder="08xx-xxxx-xxxx" className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">NPWP / Tax ID</label>
                                    <input type="text" name="taxId" value={form.taxId} onChange={handleChange}
                                        placeholder="Optional" className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-900">Invoice & Receipt</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Footer Message</label>
                                <textarea name="invoiceFooter" rows={2} value={form.invoiceFooter} onChange={handleChange}
                                    placeholder="Message shown at bottom of invoice" className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Accent Color</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" name="primaryColor" value={form.primaryColor} onChange={handleChange}
                                        className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5" />
                                    <span className="text-sm text-gray-500">{form.primaryColor} — used as invoice header accent</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Preview + Save */}
                <div className="space-y-6">
                    {/* Invoice Preview */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice Preview</h3>
                        </div>
                        <div className="p-4">
                            <div className="border border-gray-200 rounded-lg overflow-hidden text-xs">
                                {/* Header */}
                                <div className="p-4 text-white" style={{ backgroundColor: form.primaryColor }}>
                                    <p className="font-bold text-base">{form.shopName || 'Nama Bengkel'}</p>
                                    {form.address && <p className="text-xs opacity-80 mt-1">{form.address}</p>}
                                    {form.phone && <p className="text-xs opacity-80">📞 {form.phone}</p>}
                                </div>
                                {/* Body */}
                                <div className="p-4 space-y-2 bg-white">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Invoice #</span><span className="font-mono">WO-2026-001</span>
                                    </div>
                                    <div className="flex justify-between"><span className="text-gray-500">Plat</span><span>B 1234 ABC</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Jasa</span><span>Rp 150.000</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Sparepart</span><span>Rp 85.000</span></div>
                                    <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>Rp 235.000</span></div>
                                </div>
                                {/* Footer */}
                                <div className="p-3 bg-gray-50 border-t text-center text-gray-400">{form.invoiceFooter}</div>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <button type="submit" disabled={saving}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-60"
                            style={{ backgroundColor: saving ? '#9ca3af' : form.primaryColor }}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {saved ? 'Saved!' : 'Save Settings'}
                        </button>
                        <p className="text-xs text-gray-400 text-center mt-3">Settings are applied to billing invoices</p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default WorkshopSettings;
