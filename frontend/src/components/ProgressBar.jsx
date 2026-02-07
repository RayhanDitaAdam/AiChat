import React, { useEffect, useState } from 'react';

const ProgressBar = ({ targetWidth = '66%', delay = 500 }) => {
    const [width, setWidth] = useState('17%');

    useEffect(() => {
        const timer = setTimeout(() => {
            setWidth(targetWidth);
        }, delay);
        return () => clearTimeout(timer);
    }, [targetWidth, delay]);

    return (
        <div className="bg-indigo-600/20 relative h-2 w-full overflow-hidden rounded-full mt-4">
            <div
                className="bg-indigo-600 h-full transition-all duration-700 ease-out"
                style={{ width }}
            ></div>
        </div>
    );
};

export default ProgressBar;
