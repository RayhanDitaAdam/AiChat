import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
            {children}
        </div>
    );
};

export default Layout;
