import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { Store, Check, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { PATHS } from '../routes/paths';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const SelectStore = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Use environment variable for API URL (handling Vite's way)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    useEffect(() => {
        // If user already has a store, redirect to dashboard
        if (user?.memberOf) {
            navigate(PATHS.USER_DASHBOARD);
            return;
        }

        const fetchStores = async () => {
            try {
                // Remove trailing /api if present to avoid duplication if someone configured it with /api
                // But standard practice: VITE_API_URL should be base. 
                // Let's assume VITE_API_URL is "http://localhost:4000/api" or "http://localhost:4000".
                // Safest to just use relative path if proxy is set up or assume full URL.
                // Given the error was network error on localhost, we'll try to use the env var standard.

                const response = await axios.get(`${API_URL}/auth/stores`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setStores(response.data.stores);
            } catch (err) {
                console.error('Failed to fetch stores:', err);
                setError('Failed to load stores. Please reload.');
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, [user, navigate, API_URL]);

    const handleJoinStore = async () => {
        if (!selectedStore) return;

        setSubmitting(true);
        setError(null);

        try {
            await axios.post(`${API_URL}/auth/join-store`,
                { storeId: selectedStore.id },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            // User requested to force re-login after joining to ensure cookies/tokens are clean
            // and security is maintained.
            logout();
            navigate(PATHS.LOGIN, {
                state: { message: 'Successfully joined store. Please log in again to continue.' }
            });

        } catch (err) {
            console.error('Failed to join store:', err);
            const errorMessage = err.response?.data?.message || 'Failed to join store';

            // If user is already assigned to a store (but frontend state was out of sync),
            // force logout so they can login and get the correct state.
            if (errorMessage.includes("already assigned")) {
                logout();
                navigate(PATHS.LOGIN, {
                    state: { message: 'Account status updated. Please log in again.' }
                });
                return;
            }

            setError(errorMessage);
            setSubmitting(false);
        }
    };

    // Removed full page loader to show skeleton instead

    return (
        <div className="min-h-screen bg-white text-slate-800 flex flex-col md:flex-row font-sans">
            {/* Left Side - Hero/Info - Light Grey Background */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-slate-50 p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200">
                <div className="mb-8">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-100 border border-slate-100">
                        <Store className="w-7 h-7 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-slate-900 tracking-tight">
                        Select a Store
                    </h1>
                    <p className="text-slate-500 leading-relaxed text-sm">
                        Please select the store regarding your visit. This helps us customize your chat assistant and shopping experience.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
                            <Check className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm mb-1 text-slate-800">One-time Selection</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">Your account will be linked to this store permanently for this session context.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Store List */}
            <div className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar bg-white">
                <div className="max-w-7xl mx-auto">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl flex items-center gap-3 text-sm font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            <>
                                <SkeletonLoader count={1} />
                                <SkeletonLoader count={1} />
                                <SkeletonLoader count={1} />
                                <SkeletonLoader count={1} />
                                <SkeletonLoader count={1} />
                                <SkeletonLoader count={1} />
                            </>
                        ) : (
                            stores.map((store) => (
                                <button
                                    key={store.id}
                                    onClick={() => setSelectedStore(store)}
                                    className={`group relative p-6 rounded-2xl border text-left transition-all duration-300 hover:shadow-lg ${selectedStore?.id === store.id
                                        ? 'bg-indigo-600 border-indigo-600 shadow-indigo-500/30'
                                        : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${selectedStore?.id === store.id
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                                            }`}>
                                            {store.name.charAt(0)}
                                        </div>
                                        {selectedStore?.id === store.id && (
                                            <div className="bg-white/20 p-1.5 rounded-full">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <h3 className={`font-bold text-lg mb-1 truncate ${selectedStore?.id === store.id ? 'text-white' : 'text-slate-900 group-hover:text-indigo-700'
                                        }`}>
                                        {store.name}
                                    </h3>

                                    <p className={`text-xs truncate mb-4 font-mono ${selectedStore?.id === store.id ? 'text-indigo-200' : 'text-slate-400'
                                        }`}>
                                        {store.domain}
                                    </p>

                                    {store.address && (
                                        <div className={`flex items-start gap-1.5 text-xs line-clamp-2 ${selectedStore?.id === store.id ? 'text-indigo-100' : 'text-slate-500'
                                            }`}>
                                            <MapPin className={`w-3 h-3 shrink-0 mt-0.5 ${selectedStore?.id === store.id ? 'text-indigo-200' : 'text-slate-400'
                                                }`} />
                                            {store.address}
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-8 flex justify-end sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t border-slate-100 md:border-none md:p-0 md:static">
                        <button
                            onClick={handleJoinStore}
                            disabled={!selectedStore || submitting}
                            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg ${selectedStore && !submitting
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/25 hover:-translate-y-0.5'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Joining...</span>
                                </>
                            ) : (
                                <>
                                    <span>Confirm Selection</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectStore;
