import React from 'react';

const Button = ({ children, onClick, className = '', disabled = false, type = 'button' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`px-6 py-3 font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
