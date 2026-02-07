import React from 'react';

const SkeletonLoader = ({ count = 1 }) => {
    return (
        <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="bg-slate-200 animate-pulse size-10 shrink-0 rounded-full"></div>
                    <div className="grid gap-2">
                        <div className="bg-slate-200 animate-pulse rounded-md h-4 w-[150px]"></div>
                        <div className="bg-slate-200 animate-pulse rounded-md h-4 w-[100px]"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SkeletonLoader;
