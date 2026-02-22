import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Store, Send, CheckCircle, AlertCircle, Loader2, Clock, XCircle, BadgeCheck, Building2, UserPlus, Trash2 } from 'lucide-react';
import { requestContributor, getMyContributorRequests, cancelContributorRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useTranslation } from 'react-i18next';

const ContributorRequest = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [myRequests, setMyRequests] = useState([]);
    const [fetchingRequests, setFetchingRequests] = useState(true);
    const [requesting, setRequesting] = useState(null);
    const [cancelling, setCancelling] = useState(null);

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        setFetchingRequests(true);
        try {
            const requests = await getMyContributorRequests();
            setMyRequests(requests);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setFetchingRequests(false);
        }
    };

    const handleRequest = async (ownerId) => {
        setRequesting(ownerId);
        try {
            await requestContributor(ownerId);
            showToast('Request sent successfully!', 'success');
            fetchMyRequests();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to send request', 'error');
        } finally {
            setRequesting(null);
        }
    };

    const handleCancel = async (requestId) => {
        if (!confirm('Are you sure you want to cancel this request?')) return;
        setCancelling(requestId);
        try {
            await cancelContributorRequest(requestId);
            showToast('Request cancelled successfully', 'success');
            fetchMyRequests();
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to cancel request', 'error');
        } finally {
            setCancelling(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-50 text-green-600 border-green-100';
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="space-y-8 pb-20 p-4 md:p-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                        {t('nav.become_contributor') || 'Become a Contributor'}
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">
                        Collaborate with stores to manage their inventory and operations.
                    </p>
                </div>
                <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center border border-indigo-100">
                    <UserPlus className="w-8 h-8 text-indigo-600" />
                </div>
            </header>

            {/* Current Store Section */}
            {user?.memberOf && (
                <Motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                                <Building2 className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Active Store</h2>
                                <p className="text-indigo-600 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">{user.memberOf.name}</p>
                            </div>
                        </div>
                        {!myRequests.some(r => r.ownerId === user.memberOf.id) ? (
                            <button
                                onClick={() => handleRequest(user.memberOf.id)}
                                disabled={requesting === user.memberOf.id}
                                className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {requesting === user.memberOf.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Send Request</>}
                            </button>
                        ) : (
                            <div className="px-6 py-3 bg-green-50 text-green-600 rounded-2xl font-bold text-xs uppercase tracking-widest border border-green-100 flex items-center gap-2">
                                <BadgeCheck className="w-4 h-4" /> Already Requested
                            </div>
                        )}
                    </div>
                </Motion.section>
            )}

            {/* My Requests Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">My Requests</h3>
                </div>

                {fetchingRequests ? (
                    <div className="flex flex-col items-center py-12 space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching requests...</p>
                    </div>
                ) : myRequests.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem] py-12 text-center">
                        <p className="text-slate-400 font-bold italic">No requests submitted yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myRequests.map(req => (
                            <Motion.div
                                key={req.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white border border-slate-100 rounded-[2rem] p-6 flex items-center justify-between shadow-sm group hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{req.owner?.name}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{req.owner?.domain}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tighter border ${getStatusStyle(req.status)}`}>
                                        {req.status}
                                    </div>
                                    {req.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleCancel(req.id)}
                                            disabled={cancelling === req.id}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Cancel Request"
                                        >
                                            {cancelling === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                            </Motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default ContributorRequest;
