import React from 'react';
import ChatView from '../../components/ChatView.jsx';

const UserDashboard = () => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 bg-white">
                <ChatView />
            </div>
        </div>
    );
};

export default UserDashboard;
