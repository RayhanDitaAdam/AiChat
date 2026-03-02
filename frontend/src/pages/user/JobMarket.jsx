import React, { useState, useEffect, useCallback } from 'react';
import {
    Briefcase, Search, MapPin, Phone, DollarSign,
    ChevronRight, CheckCircle2, Clock, XCircle,
    Info, Building2, Send, Bookmark, Share2, Users,
    Calendar, Filter, PenSquare
} from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
    getPublicVacancies, applyToVacancy, getUserApplications
} from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import Button from '../../components/Button.jsx';

const JobMarket = () => {
    const { showToast } = useToast();
    const [vacancies, setVacancies] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-applications'
    const [selectedJob, setSelectedJob] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [vacanciesRes, applicationsRes] = await Promise.all([
                getPublicVacancies(),
                getUserApplications()
            ]);

            if (vacanciesRes.status === 'success') {
                setVacancies(vacanciesRes.vacancies);
            }
            if (applicationsRes.status === 'success') {
                setMyApplications(applicationsRes.applications);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
            showToast('Failed to load data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [applyModal, setApplyModal] = useState(null); // stores vacancy object
    const [applyReason, setApplyReason] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    const handleApplyClick = (vacancy) => {
        setApplyModal(vacancy);
        setApplyReason('');
    };

    const submitApplication = async () => {
        if (!applyReason.trim() || applyReason.length < 10) {
            showToast('Reason must be at least 10 characters', 'error');
            return;
        }

        setIsApplying(true);
        try {
            const res = await applyToVacancy(applyModal.id, applyReason);
            if (res.status === 'success') {
                showToast('Application submitted successfully', 'success');
                fetchData();
                setApplyModal(null);
                setSelectedJob(null);
            }
        } catch (err) {
            console.error('Failed to apply:', err);
            showToast(err.response?.data?.message || 'Failed to submit application.', 'error');
        } finally {
            setIsApplying(false);
        }
    };

    const isApplied = (vacancyId) => {
        return myApplications.some(app => app.vacancyId === vacancyId);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'REVIEWED': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ACCEPTED': return <CheckCircle2 size={12} />;
            case 'REJECTED': return <XCircle size={12} />;
            case 'REVIEWED': return <Info size={12} />;
            default: return <Clock size={12} />;
        }
    };

    const filteredVacancies = vacancies.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-50/30 overflow-hidden">
            <div className="p-4 md:p-6 space-y-6 shrink-0">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="hover:text-slate-600 transition-colors cursor-pointer">Home</span>
                    <ChevronRight size={10} />
                    <span className="text-slate-900">Job Market</span>
                </nav>

                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-3 italic uppercase text-indigo-600">
                            <Briefcase className="w-8 h-8" />
                            Job Market
                        </h1>
                        <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Find the best career opportunities in our ecosystem</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'browse' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Browse Jobs
                        </button>
                        <button
                            onClick={() => setActiveTab('my-applications')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'my-applications' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            My Applications ({myApplications.length})
                        </button>
                    </div>
                </header>

                {activeTab === 'browse' && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search positions, companies, or locations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-12 pl-12 pr-6 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-600/10 transition-all outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 custom-scrollbar">
                {activeTab === 'browse' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 animate-pulse space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-100 rounded w-3/4" />
                                            <div className="h-3 bg-slate-100 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="h-20 bg-slate-50 rounded-2xl" />
                                    <div className="flex justify-between">
                                        <div className="h-8 bg-slate-100 rounded-full w-24" />
                                        <div className="h-10 bg-slate-100 rounded-xl w-32" />
                                    </div>
                                </div>
                            ))
                        ) : filteredVacancies.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                <Search className="w-16 h-16 text-slate-200 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 uppercase italic tracking-tight">No jobs found</h3>
                                <p className="text-slate-400 text-sm mt-1">No listings match your search criteria.</p>
                            </div>
                        ) : (
                            filteredVacancies.map((job) => (
                                <Motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={job.id}
                                    className="bg-white rounded-[2rem] border border-slate-100 p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white shadow-inner">
                                                <Building2 size={28} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 uppercase italic leading-tight group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{job.companyName}</p>
                                            </div>
                                        </div>
                                        <button className="text-slate-300 hover:text-indigo-600 transition-colors">
                                            <Bookmark size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-3 mb-6 flex-1">
                                        <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed">
                                            {job.detail}
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                <MapPin size={12} className="text-indigo-600" />
                                                {job.address}
                                            </div>
                                            {job.salary && (
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                                                    <DollarSign size={12} />
                                                    {job.salary}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                <Users size={12} className="text-indigo-400" />
                                                {job._count?.applications || 0} applicants
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                                        <div className="text-[9px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                                            <Calendar size={12} />
                                            {format(new Date(job.createdAt), 'dd MMM yyyy')}
                                        </div>
                                        {isApplied(job.id) ? (
                                            <div className="px-5 py-2.5 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-100 flex items-center gap-2">
                                                <CheckCircle2 size={14} />
                                                Applied
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedJob(job)}
                                                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                                            >
                                                View Details
                                            </button>
                                        )}
                                    </div>
                                </Motion.div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {myApplications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Send className="w-16 h-16 text-slate-200 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 uppercase italic tracking-tight">No applications yet</h3>
                                <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold text-[10px]">Start browsing jobs and apply now!</p>
                                <button
                                    onClick={() => setActiveTab('browse')}
                                    className="mt-6 text-indigo-600 font-bold uppercase tracking-widest text-xs flex items-center gap-2"
                                >
                                    Browse Jobs <ChevronRight size={14} />
                                </button>
                            </div>
                        ) : (
                            myApplications.map((app) => (
                                <div key={app.id} className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner">
                                            <Building2 size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 uppercase italic leading-tight">{app.vacancy.title}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{app.vacancy.companyName}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                    <Calendar size={12} />
                                                    Applied on {format(new Date(app.createdAt), 'dd MMM yyyy')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center md:items-end gap-3">
                                        <div className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${getStatusStyle(app.status)}`}>
                                            {getStatusIcon(app.status)}
                                            {app.status}
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            {app.status === 'PENDING' ? 'Awaiting Review' : (app.status === 'REVIEWED' ? 'Under HR Review' : 'Final Decision')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Job Detail Side Panel */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end">
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedJob(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <Motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white h-full w-full max-w-xl shadow-2xl relative z-10 flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900 uppercase italic tracking-tight">Job Details</h2>
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
                                        <Building2 size={48} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-slate-900 uppercase italic leading-tight">{selectedJob.title}</h3>
                                        <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mt-1.5">{selectedJob.companyName}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 line-clamp-1">
                                            <MapPin size={14} className="text-indigo-600" />
                                            {selectedJob.address}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estimated Salary</p>
                                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 capitalize">
                                            <DollarSign size={14} />
                                            {selectedJob.salary || 'Competitive'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Description & Qualifications</h4>
                                    <div className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100/50 italic">
                                        {selectedJob.detail}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Contact Information</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                            <Phone size={14} className="text-emerald-500" />
                                            {selectedJob.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                                <button
                                    onClick={() => handleApplyClick(selectedJob)}
                                    className="w-full h-16 rounded-2xl bg-indigo-600 text-white font-bold uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Send size={20} />
                                    Apply Now
                                </button>
                                <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4">Make sure your profile is complete before applying</p>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Application Modal */}
            <AnimatePresence>
                {applyModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isApplying && setApplyModal(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <Motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 bg-indigo-600 text-white relative">
                                <button
                                    disabled={isApplying}
                                    onClick={() => setApplyModal(null)}
                                    className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                                >
                                    <XCircle size={20} />
                                </button>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Application Confirmation</p>
                                    <h3 className="text-2xl font-bold uppercase italic tracking-tight">{applyModal.title}</h3>
                                    <p className="text-xs font-bold opacity-90 flex items-center gap-1.5 uppercase tracking-widest pt-1">
                                        <Building2 size={12} /> {applyModal.companyName}
                                    </p>
                                </div>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <PenSquare size={14} className="text-indigo-500" />
                                            Why are you applying? <span className="text-rose-500">*</span>
                                        </label>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${applyReason.length < 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {applyReason.length}/10 min
                                        </span>
                                    </div>
                                    <textarea
                                        autoFocus
                                        value={applyReason}
                                        onChange={(e) => setApplyReason(e.target.value)}
                                        disabled={isApplying}
                                        placeholder="Write a brief cover letter or reason for applying. This helps the employer understand your motivation..."
                                        className="w-full h-44 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-sm font-medium text-slate-700 focus:border-indigo-500 focus:bg-white transition-all outline-none resize-none placeholder:text-slate-300 custom-scrollbar"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        loading={isApplying}
                                        onClick={submitApplication}
                                        className="w-full h-16 rounded-[1.5rem] bg-indigo-600 text-white shadow-xl shadow-indigo-100 uppercase tracking-[0.2em] font-bold"
                                    >
                                        <Send size={18} />
                                        Submit Application
                                    </Button>
                                    <button
                                        disabled={isApplying}
                                        onClick={() => setApplyModal(null)}
                                        className="w-full py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors disabled:opacity-50"
                                    >
                                        I've changed my mind, take me back
                                    </button>
                                </div>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobMarket;
