import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Pencil, Trash2, Loader2, Wrench, Phone, Award, ToggleLeft, ToggleRight, X, Check
} from 'lucide-react';
import { getMechanics, createMechanic, updateMechanic, deleteMechanic } from '../../../services/api.js';
import { showError, showSuccess } from '../../../utils/swal.js';

const EMPTY_FORM = { name: '', phone: '', specialization: '', commissionRate: 0 };

const Mechanics = ({ embedded = false }) => {
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', data }
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const fetch = async () => {
        setLoading(true);
        try { setMechanics((await getMechanics())?.data || []); }
        catch { showError('Failed to load mechanics'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const openAdd = () => { setForm(EMPTY_FORM); setModal({ mode: 'add' }); };
    const openEdit = (m) => { setForm({ name: m.name, phone: m.phone || '', specialization: m.specialization || '', commissionRate: m.commissionRate }); setModal({ mode: 'edit', id: m.id }); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { showError('Name is required'); return; }
        setSaving(true);
        try {
            if (modal.mode === 'add') {
                await createMechanic({ ...form, commissionRate: Number(form.commissionRate) });
                showSuccess('Mechanic added');
            } else {
                await updateMechanic(modal.id, { ...form, commissionRate: Number(form.commissionRate) });
                showSuccess('Mechanic updated');
            }
            setModal(null);
            fetch();
        } catch { showError('Failed to save mechanic'); }
        finally { setSaving(false); }
    };

    const handleToggleActive = async (m) => {
        setActionLoading(m.id + '_toggle');
        try {
            await updateMechanic(m.id, { isActive: !m.isActive });
            fetch();
        } catch { showError('Failed to update status'); }
        finally { setActionLoading(null); }
    };

    const handleDelete = async (m) => {
        if (!window.confirm(`Delete mechanic "${m.name}"?`)) return;
        setActionLoading(m.id + '_del');
        try { await deleteMechanic(m.id); showSuccess('Deleted'); fetch(); }
        catch { showError('Failed to delete'); }
        finally { setActionLoading(null); }
    };

    const active = mechanics.filter(m => m.isActive);
    const inactive = mechanics.filter(m => !m.isActive);

    return (
        <div className={embedded ? "p-4" : "bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8"}>
            {/* Header */}
            <div className={`mb-6 flex items-center ${embedded ? 'justify-end' : 'justify-between'}`}>
                {!embedded && (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Mechanics</h1>
                            <p className="text-sm text-gray-500 mt-0.5">{mechanics.length} registered</p>
                        </div>
                    </div>
                )}
                <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Add Mechanic
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mechanic</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialization</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commission</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-16 text-center"><Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" /></td></tr>
                            ) : mechanics.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-16 text-center text-sm text-gray-400">No mechanics yet. Add your first one.</td></tr>
                            ) : [...active, ...inactive].map(m => (
                                <tr key={m.id} className={`hover:bg-gray-50 transition-colors ${!m.isActive ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold text-sm">
                                                {m.name[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{m.name}</p>
                                                {m.phone && <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" />{m.phone}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {m.specialization ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200">
                                                <Wrench className="w-3 h-3" /> {m.specialization}
                                            </span>
                                        ) : <span className="text-gray-400 text-xs">—</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                                            <Award className="w-3 h-3" /> {m.commissionRate}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${m.isActive ? 'bg-green-100 text-green-700 ring-green-200' : 'bg-gray-100 text-gray-500 ring-gray-200'}`}>
                                            {m.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleToggleActive(m)} disabled={actionLoading === m.id + '_toggle'} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                {actionLoading === m.id + '_toggle' ? <Loader2 className="w-4 h-4 animate-spin" /> : m.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(m)} disabled={actionLoading === m.id + '_del'} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                {actionLoading === m.id + '_del' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">{modal.mode === 'add' ? 'Add Mechanic' : 'Edit Mechanic'}</h3>
                            <button onClick={() => setModal(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {[
                                { name: 'name', label: 'Name *', placeholder: 'Full name' },
                                { name: 'phone', label: 'Phone', placeholder: '08xx-xxxx-xxxx' },
                                { name: 'specialization', label: 'Specialization', placeholder: 'e.g. Engine, Electrical, Body' },
                            ].map(f => (
                                <div key={f.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                                    <input type="text" value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                                        placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Commission Rate (%)</label>
                                <input type="number" min={0} max={100} step={0.5} value={form.commissionRate}
                                    onChange={e => setForm(p => ({ ...p, commissionRate: e.target.value }))}
                                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <p className="text-xs text-gray-400 mt-1">% of total job revenue paid to mechanic</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {modal.mode === 'add' ? 'Add' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mechanics;
