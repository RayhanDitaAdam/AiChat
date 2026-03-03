import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, Wrench, UserPlus, ClipboardList, Clock, Receipt } from 'lucide-react';
import { PATHS } from '../../../routes/paths.js';
import { Link } from 'react-router-dom';

import CheckIn from './CheckIn.jsx';
import WorkOrderQueue from './WorkOrderQueue.jsx';
import ServiceHistory from './ServiceHistory.jsx';
import Billing from './Billing.jsx';

const WorkshopOperations = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const activeTab = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('tab') || 'checkin';
    }, [location.search]);

    const handleTabChange = (tabId) => {
        navigate(`${location.pathname}?tab=${tabId}`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'queue':
                return <WorkOrderQueue embedded={true} />;
            case 'history':
                return <ServiceHistory embedded={true} />;
            case 'billing':
                return <Billing embedded={true} />;
            case 'checkin':
            default:
                return <CheckIn embedded={true} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden font-normal">
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {/* Breadcrumb */}
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
                                <span className="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page">Operations Center</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 shrink-0 shadow-sm border border-orange-200/50 dark:border-orange-800">
                            <Wrench size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">Workshop Operations Center</h1>
                            <p className="text-sm font-normal text-gray-500 mt-1 dark:text-gray-400">Integrated vehicle servicing and order fulfillment</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mt-8 overflow-x-auto hide-scrollbar">
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1.5 rounded-2xl w-max">
                        <button
                            onClick={() => handleTabChange('checkin')}
                            className={`flex items-center px-6 py-2.5 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'checkin' ? 'bg-white dark:bg-gray-800 text-orange-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            <UserPlus className="w-4 h-4 mr-2" /> Check-In
                        </button>
                        <button
                            onClick={() => handleTabChange('queue')}
                            className={`flex items-center px-6 py-2.5 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'queue' ? 'bg-white dark:bg-gray-800 text-orange-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            <ClipboardList className="w-4 h-4 mr-2" /> Orders
                        </button>
                        <button
                            onClick={() => handleTabChange('history')}
                            className={`flex items-center px-6 py-2.5 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'history' ? 'bg-white dark:bg-gray-800 text-orange-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            <Clock className="w-4 h-4 mr-2" /> History
                        </button>
                        <button
                            onClick={() => handleTabChange('billing')}
                            className={`flex items-center px-6 py-2.5 text-sm font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'billing' ? 'bg-white dark:bg-gray-800 text-orange-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                        >
                            <Receipt className="w-4 h-4 mr-2" /> Billing
                        </button>
                    </div>
                </div>
            </div>

            {/* Embedded Content Area */}
            <div className="relative z-0">
                {renderContent()}
            </div>
        </div>
    );
};

export default WorkshopOperations;
