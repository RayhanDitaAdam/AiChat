import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Loader2, Save, Trash2, ChevronRight, Settings, MessageSquare, Package, LayoutDashboard, Users, ClipboardList, Headset } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { getStaffRoles, createStaffRole, updateStaffRole, deleteStaffRole } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';

const PERMISSION_MODULES = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
        id: 'pos',
        label: 'Commerce Suite',
        icon: Settings,
        subModules: [
            { id: 'pos_transactions', label: 'Transactions' },
            { id: 'pos_members', label: 'Member Management' },
            { id: 'pos_reports', label: 'Sales Reports' },
            { id: 'pos_rewards', label: 'Loyalty Rewards' },
            { id: 'pos_settings', label: 'Point Rules' }
        ]
    },
    { id: 'products', label: 'Inventory / Products', icon: Package },
    { id: 'chat_history', label: 'Chat History', icon: MessageSquare },
    { id: 'live_support', label: 'Live Support', icon: Headset },
    { id: 'tasks', label: 'Facility Tasks', icon: ClipboardList },
    { id: 'team', label: 'Staff & Team', icon: Users }
];

const OwnerRoleManagement = ({ onClose }) => {
    const { showToast } = useToast();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState({});
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchRoles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await getStaffRoles();
            if (res.status === 'success') {
                setRoles(res.roles);
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to fetch roles', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRole = (role) => {
        setSelectedRole(role);
        setRoleName(role.name);
        setPermissions(role.permissions || {});
        setIsCreating(false);
    };

    const handleNewRole = () => {
        setSelectedRole(null);
        setRoleName('');
        setPermissions({});
        setIsCreating(true);
    };

    const togglePermission = (moduleId, parentId = null) => {
        setPermissions(prev => {
            const newPerms = { ...prev, [moduleId]: !prev[moduleId] };

            // If toggling off a parent, toggle off all its sub-modules
            if (parentId === null && !newPerms[moduleId]) {
                const moduleDef = PERMISSION_MODULES.find(m => m.id === moduleId);
                if (moduleDef?.subModules) {
                    moduleDef.subModules.forEach(sub => {
                        newPerms[sub.id] = false;
                    });
                }
            }

            // If toggling ON a sub-module, ensure the parent is ON
            if (parentId && newPerms[moduleId]) {
                newPerms[parentId] = true;
            }

            return newPerms;
        });
    };

    const handleSave = async () => {
        if (!roleName.trim()) {
            showToast('Role name is required', 'error');
            return;
        }

        setIsSaving(true);
        try {
            if (isCreating) {
                const res = await createStaffRole({ name: roleName, permissions });
                if (res.status === 'success') {
                    showToast('Role created successfully', 'success');
                    setRoles([...roles, res.role]);
                    handleSelectRole(res.role);
                }
            } else {
                const res = await updateStaffRole(selectedRole.id, { name: roleName, permissions });
                if (res.status === 'success') {
                    showToast('Role updated successfully', 'success');
                    setRoles(roles.map(r => r.id === selectedRole.id ? res.role : r));
                }
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save role', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;
        try {
            await deleteStaffRole(id);
            showToast('Role deleted', 'success');
            setRoles(roles.filter(r => r.id !== id));
            if (selectedRole?.id === id) {
                handleNewRole();
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to delete role', 'error');
        }
    };

    return (
        <div className="flex flex-col h-[600px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100/50">
                        <Shield size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Role & Permissions</h3>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Governance & Authorization Matrix</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Role List */}
                <div className="w-64 border-r dark:border-gray-700 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/20">
                    <div className="p-3">
                        <button
                            onClick={handleNewRole}
                            className={`w-full text-left p-3 rounded-xl mb-2 transition-all flex items-center justify-between font-medium ${isCreating ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}
                        >
                            <span>+ Create New Role</span>
                        </button>

                        <div className="space-y-1 mt-4">
                            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Existing Roles</p>
                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                </div>
                            ) : roles.length === 0 ? (
                                <p className="text-xs text-gray-500 px-3 italic">No custom roles yet</p>
                            ) : (
                                roles.map(role => (
                                    <button
                                        key={role.id}
                                        onClick={() => handleSelectRole(role)}
                                        className={`w-full text-left p-3 rounded-xl transition-all group flex items-center justify-between ${selectedRole?.id === role.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold border-indigo-200 dark:border-indigo-800 border' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    >
                                        <span className="truncate">{role.name}</span>
                                        <ChevronRight size={14} className={selectedRole?.id === role.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'} />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content - Editor */}
                <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
                    {(selectedRole || isCreating) ? (
                        <div className="space-y-8">
                            <section>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Role Name</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="e.g. Sales Associate"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        className="flex-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                    />
                                    {selectedRole && (
                                        <button
                                            onClick={() => handleDelete(selectedRole.id)}
                                            className="p-3 text-rose-600 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 rounded-xl transition-colors"
                                            title="Delete Role"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Modular Permissions</label>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-100/50 dark:border-indigo-800/50">
                                        {Object.values(permissions).filter(Boolean).length} Active Matrix
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {PERMISSION_MODULES.map(module => (
                                        <div key={module.id} className="flex flex-col gap-2">
                                            <button
                                                onClick={() => togglePermission(module.id)}
                                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${permissions[module.id] ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-900/20 border-gray-100 dark:border-gray-700 grayscale hover:grayscale-0'}`}
                                            >
                                                <div className={`p-2 rounded-lg ${permissions[module.id] ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                                    <module.icon size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-bold ${permissions[module.id] ? 'text-indigo-900 dark:text-indigo-300' : 'text-gray-500'}`}>{module.label}</p>
                                                    <p className="text-[10px] text-gray-400">Can view & interact with {module.label}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${permissions[module.id] ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
                                                    {permissions[module.id] && <Check size={12} strokeWidth={4} />}
                                                </div>
                                            </button>

                                            {/* Sub-modules rendering */}
                                            {module.subModules && permissions[module.id] && (
                                                <div className="pl-14 pr-2 space-y-2 pb-2">
                                                    {module.subModules.map(sub => (
                                                        <button
                                                            key={sub.id}
                                                            onClick={() => togglePermission(sub.id, module.id)}
                                                            className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left ${permissions[sub.id] ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/50' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}
                                                        >
                                                            <span className={`text-xs font-medium ${permissions[sub.id] ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-500'}`}>
                                                                {sub.label}
                                                            </span>
                                                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${permissions[sub.id] ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300'}`}>
                                                                {permissions[sub.id] && <Check size={10} strokeWidth={3} />}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <div className="pt-6 border-t dark:border-gray-700 mt-6">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !roleName.trim()}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                                >
                                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                    <span>{isCreating ? 'Finalize Role Creation' : 'Commit Authorization Update'}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                <Shield size={40} className="text-gray-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Role Editor</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Select a role from the sidebar or create a new one to manage its permissions.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerRoleManagement;
