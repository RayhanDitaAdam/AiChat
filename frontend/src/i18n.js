import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "welcome": "Assalamualaikum, How can I help you?",
            "assistant_desc": "I'm your shopping assistant. Ask me anything about our products!",
            "call_staff": "Call Staff",
            "end_call": "End Call",
            "calling_staff": "Calling Staff",
            "voice_connected": "Voice Connected",
            "call_declined": "Call Declined",
            "staff_connecting": "Connecting to staff... Please wait.",
            "staff_ended": "Staff assistance ended. You are back chatting with AI Heart.",
            "placeholder": "Message Heart...",
            "add_to_list": "Add to List",
            "add": "Add",
            "remind": "Remind",
            "product_gallery": "Product Gallery",
            "no_image": "No Image",
            "rak": "Rak",
            "aisle": "Aisle",
            "stock": "Stock",
            "shopping_assistant": "Shopping Assistant",
            "sign_in": "Sign In",
            "register": "Register",
            "back_to_home": "Back to Home",
            "store_not_found": "Store Not Found",
            "store_not_found_desc": "The link you followed might be broken or the store domain doesn't exist in our system.",
            "connecting": "Connecting...",
            "added_to_list": "Added to your shopping list! 🛒",
            "failed_call": "Failed to call staff.",
            "failed_end_call": "Failed to end staff assistance.",
            "rate_service": "How was my help? Please give a rating!"
        }
    },
    id: {
        translation: {
            "welcome": "Assalamualaikum, ada yang bisa saya bantu?",
            "assistant_desc": "Saya adalah asisten belanja Anda. Tanya apa saja tentang produk kami!",
            "call_staff": "Panggil Staff",
            "end_call": "Akhiri Panggilan",
            "calling_staff": "Memanggil Staff",
            "voice_connected": "Suara Terhubung",
            "call_declined": "Panggilan Ditolak",
            "staff_connecting": "Menghubungkan ke staff... Mohon tunggu sebentar ya bre.",
            "staff_ended": "Bantuan staff diakhiri. Kamu kembali mengobrol dengan AI Heart.",
            "placeholder": "Kirim pesan ke Heart...",
            "add_to_list": "Tambah ke Daftar",
            "add": "Tambah",
            "remind": "Ingatkan",
            "product_gallery": "Galeri Produk",
            "no_image": "Tidak ada gambar",
            "rak": "Rak",
            "aisle": "Lorong",
            "stock": "Stok",
            "shopping_assistant": "Asisten Belanja",
            "sign_in": "Masuk",
            "register": "Daftar",
            "back_to_home": "Kembali ke Beranda",
            "store_not_found": "Toko Tidak Ditemukan",
            "store_not_found_desc": "Tautan yang Anda ikuti mungkin rusak atau domain toko tidak ada di sistem kami.",
            "connecting": "Menghubungkan...",
            "added_to_list": "Berhasil ditambah ke daftar belanja! 🛒",
            "failed_call": "Gagal memanggil staff bre.",
            "failed_end_call": "Gagal mengakhiri bantuan staff bre.",
            "rate_service": "Gimana bantuan saya? Berikan rating ya!"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'id',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
