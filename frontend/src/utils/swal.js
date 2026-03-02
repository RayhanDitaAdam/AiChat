import Swal from 'sweetalert2';

/**
 * Custom SweetAlert2 instance with project-specific styling
 */
const MySwal = Swal.mixin({
    customClass: {
        container: 'font-outfit',
        popup: 'rounded-2xl border-none shadow-2xl bg-white',
        title: 'text-xl font-bold text-slate-900',
        htmlContainer: 'text-sm text-slate-600',
        confirmButton: 'px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mx-2',
        cancelButton: 'px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-all focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 mx-2',
        actions: 'pt-4',
    },
    buttonsStyling: false,
    showClass: {
        popup: 'animate__animated animate__fadeInUp animate__faster'
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutDown animate__faster'
    }
});

/**
 * Show a simple alert modal
 */
export const showAlert = (title, text, icon = 'info') => {
    return MySwal.fire({
        title,
        text,
        icon,
        confirmButtonText: 'OK'
    });
};

/**
 * Show a success alert
 */
export const showSuccess = (title, text = '') => {
    return MySwal.fire({
        title,
        text,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
};

/**
 * Show an error alert
 */
export const showError = (title, text = 'Something went wrong') => {
    return MySwal.fire({
        title,
        text,
        icon: 'error',
        confirmButtonText: 'Got it'
    });
};

/**
 * Show a confirmation modal
 * @returns {Promise<boolean>}
 */
export const showConfirm = async (title, text, confirmText = 'Confirm', cancelText = 'Cancel', icon = 'warning') => {
    const result = await MySwal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        reverseButtons: true
    });
    return result.isConfirmed;
};

export default MySwal;
