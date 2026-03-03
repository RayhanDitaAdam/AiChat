import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, UserCircle2 } from 'lucide-react';

import StaffManagement from './StaffManagement.jsx';
import OwnerContributors from './OwnerContributors.jsx';

const TABS = [
    { id: 'staff', label: 'Staff & Team', icon: Users },
    { id: 'contributors', label: 'Contributors', icon: UserCircle2 },
];

const TeamManagementSuite = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('staff');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && TABS.find((t) => t.id === tab)) {
            if (activeTab !== tab) setActiveTab(tab);
        } else {
            navigate(`${location.pathname}?tab=staff`, { replace: true });
        }
    }, [location.search, location.pathname, navigate, activeTab]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(`${location.pathname}?tab=${tabId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8">
            {/* Header / Title */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="w-6 h-6 text-indigo-600" />
                        Team Management Suite
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage all your internal and external personnel.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6 flex gap-1 w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-indigo-50 text-indigo-700 shadow-sm border-indigo-100 border'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white">
                {activeTab === 'staff' && <StaffManagement embedded={true} />}
                {activeTab === 'contributors' && <OwnerContributors embedded={true} />}
            </div>
        </div>
    );
};

export default TeamManagementSuite;
