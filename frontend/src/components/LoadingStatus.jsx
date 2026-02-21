import React from 'react';

const LoadingStatus = ({
    label = "Processing...",
    value = "",
    description = ""
}) => {
    return (
        <article className="group/item flex items-center border text-sm rounded-md transition-colors flex-wrap outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] border-transparent bg-slate-50/50 p-4 gap-4">
            <div className="flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:size-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    role="status"
                    aria-label="Loading"
                    className="animate-spin text-indigo-500"
                >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
            </div>
            <div className="flex flex-1 flex-col gap-1">
                <h3 className="flex w-fit items-center gap-2 text-sm leading-snug font-medium line-clamp-1 text-slate-900">
                    {label}
                </h3>
                {description && (
                    <p className="text-xs text-slate-500">{description}</p>
                )}
            </div>
            {value && (
                <div className="flex flex-col gap-1 flex-none text-center">
                    <p className="text-slate-600 line-clamp-2 text-sm leading-normal font-normal text-balance">
                        {value}
                    </p>
                </div>
            )}
        </article>
    );
};

export default LoadingStatus;
