/**
 * Returns a Tailwind color class based on the numeric value.
 * @param {number} value - The value to check.
 * @param {string} neutralClass - The class to return if value is 0.
 * @returns {string} Tailwind CSS class.
 */
export const getValueColorClass = (value, neutralClass = 'text-slate-900') => {
    if (value > 0) return 'text-emerald-500';
    if (value < 0) return 'text-rose-500';
    return neutralClass;
};

/**
 * Formats a number as IDR currency.
 * @param {number} value 
 * @returns {string}
 */
export const formatCurrency = (value) => {
    return `Rp ${Number(value).toLocaleString('id-ID')}`;
};
