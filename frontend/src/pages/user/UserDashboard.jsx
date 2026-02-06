import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { PATHS } from '../../routes/paths.js';
import ChatView from '../../components/ChatView.jsx';
import { Store } from 'lucide-react';

const UserDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (user?.memberOf) {
        return <ChatView />;
    }

    return (
        <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg p-6 text-center text-balance md:p-12">
            <header className="flex max-w-sm flex-col items-center gap-3 text-center">
                <div className="mb-2 flex items-center justify-center bg-slate-100 p-4 rounded-full">
                    <Store className="size-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">No Store Selected</h3>
                <p className="text-muted-foreground text-sm/relaxed">
                    You haven't joined a store yet. Please select a store to access the AI Chat Assistant and other features.
                </p>
            </header>
            <section className="flex w-full max-w-sm min-w-0 flex-col items-center gap-3">
                <button
                    onClick={() => navigate(PATHS.SELECT_STORE)}
                    className="btn bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                    Select Store
                </button>
            </section>
        </div>
    );
};

export default UserDashboard;
