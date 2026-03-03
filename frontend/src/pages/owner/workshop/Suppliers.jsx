import React, { useState, useEffect } from 'react';
import { Package, Plus, Pencil, Trash2, Loader2, Phone, MapPin, X, Check, ExternalLink } from 'lucide-react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../../services/api.js';
import { showError, showSuccess } from '../../../utils/swal.js';

const EMPTY_FORM = { name: '', contact: '', phone: '', address: '', notes: '' };

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState('');

    const fetch = async () => {
        setLoading(true);
        try { setSuppliers((await getSuppliers())?.data || []); }
        catch { showError('Failed to load suppliers'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const openAdd = () => { setForm(EMPTY_FORM); setModal({ mode: 'add' }); };
    const openEdit = (s) => { setForm({ name: s.name, contact: s.contact || '', phone: s.phone || '', address: s.address || '', notes: s.notes || '' }); setModal({ mode: 'edit', id: s.id }); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { showError('Supplier name is required'); return; }
        setSaving(true);
        try {
            if (modal.mode === 'add') { await createSupplier(form); showSuccess('Supplier added'); }
            else { await updateSupplier(modal.id, form); showSuccess('Supplier updated'); }
            setModal(null); fetch();
        } catch { showError('Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (s) => {
        if (!window.confirm(`Delete supplier "${s.name}"?`)) return;
        setActionLoading(s.id);
        try { await deleteSupplier(s.id); showSuccess('Deleted'); fetch(); }
        catch { showError('Failed to delete'); }
        finally { setActionLoading(null); }
    };

    const filtered = suppliers.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.contact?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg"><Package className="w-5 h-5 text-blue-600" /></div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Suppliers</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{suppliers.length} registered suppliers</p>
                    </div>
                </div>
                <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add Supplier
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-4 border-b border-gray-100">
                    <div className="relative">
                        <input type="text" placeholder="Search by name or contact..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Address</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Notes</th>
                                <th className="px-6 py-3 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" /></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">{search ? 'No results found' : 'No suppliers yet'}</td></tr>
                            ) : filtered.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-700 font-bold text-sm">{s.name[0]?.toUpperCase()}</div>
                                            <p className="font-medium text-gray-900">{s.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {s.contact && <p className="text-sm text-gray-700">{s.contact}</p>}
                                        {s.phone && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{s.phone}</p>}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        {s.address ? <p className="text-sm text-gray-500 truncate flex items-start gap-1"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />{s.address}</p> : <span className="text-gray-400 text-xs">—</span>}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <p className="text-sm text-gray-500 truncate">{s.notes || '—'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDelete(s)} disabled={actionLoading === s.id} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                {actionLoading === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">{modal.mode === 'add' ? 'Add Supplier' : 'Edit Supplier'}</h3>
                            <button onClick={() => setModal(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {[
                                { name: 'name', label: 'Supplier Name *', placeholder: 'e.g. Toko Maju Parts' },
                                { name: 'contact', label: 'PIC / Contact Person', placeholder: 'Contact name' },
                                { name: 'phone', label: 'Phone', placeholder: '08xx-xxxx-xxxx' },
                                { name: 'address', label: 'Address', placeholder: 'Full address' },
                            ].map(f => (
                                <div key={f.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                                    <input type="text" value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                                        placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes / PO History</label>
                                <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="Order history, terms, etc." className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
