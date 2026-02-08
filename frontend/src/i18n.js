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
            "rate_service": "How was my help? Please give a rating!",
            "ai_searching": "Hold on, searching for you...",
            "ai_typing": "AI Heart is typing...",
            "feedback_title": "Tell us why",
            "feedback_desc": "We want to improve. Please tell us what we can do better.",
            "feedback_placeholder": "Write your feedback here...",
            "rating_submitted": "Rating submitted! Thank you.",
            "cancel": "Cancel",
            "submit": "Submit",

            // Dashboard & Navigation
            "nav": {
                "dashboard": "Dashboard",
                "analytics": "Analytics",
                "stores": "Stores & Approval",
                "live_chat": "Configure Live Chat",
                "missing_requests": "Missing Requests",
                "system_config": "System Config",
                "menu_management": "Menu Management",
                "inventory": "Inventory",
                "ai_audit_logs": "AI Audit Logs",
                "chat_assistant": "Chat Assistant",
                "live_support": "Live Support",
                "store_settings": "Store Settings",
                "facility_tasks": "Facility Tasks",
                "staff_management": "Staff Management",
                "profile": "Profile",
                "pos_system": "POS System",
                "members": "Members",
                "sales_reports": "Sales Reports",
                "loyalty_rewards": "Loyalty Rewards",
                "health_intel": "Health Intel",
                "select_store": "Select Store",
                "shopping_queue": "Shopping Queue",
                "wallet": "Wallet",
                "task_reporting": "Task Reporting",
                "billing": "Billing",
                "settings": "Settings",
                "keyboard_shortcuts": "Keyboard Shortcuts",
                "sign_out": "Sign Out",
                "logout": "Logout",
                "support": "Support",
                "api": "API"
            },
            "common": {
                "my_account": "My Account",
                "pending_approval": "Account Pending Approval",
                "pending_approval_desc": "Your store access is currently being reviewed by our administrators. You'll be able to manage your inventory once approved.",
                "contact_support": "Contact support if this takes more than 24h",
                "active_store": "Active Store",
                "new_chat": "New Chat",
                "delete_session_confirm": "Delete this session?"
            }
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
            "rate_service": "Gimana bantuan saya? Berikan rating ya!",
            "ai_searching": "oke sebentar ya lagi nyari nih.....",
            "ai_typing": "AI Heart sedang mengetik...",
            "feedback_title": "Ada masukan untuk kami?",
            "feedback_desc": "Bantu kami jadi lebih baik. Ceritakan apa yang kurang ya.",
            "feedback_placeholder": "Tulis masukanmu di sini...",
            "rating_submitted": "Rating terkirim! Terima kasih.",
            "cancel": "Batal",
            "submit": "Kirim",

            // Dashboard & Navigation
            "nav": {
                "dashboard": "Dashboard",
                "analytics": "Analitik",
                "stores": "Toko & Persetujuan",
                "live_chat": "Konfigurasi Live Chat",
                "missing_requests": "Permintaan Hilang",
                "system_config": "Konfigurasi Sistem",
                "menu_management": "Manajemen Menu",
                "inventory": "Inventaris",
                "ai_audit_logs": "Log Audit AI",
                "chat_assistant": "Asisten Chat",
                "live_support": "Dukungan Langsung",
                "store_settings": "Pengaturan Toko",
                "facility_tasks": "Tugas Fasilitas",
                "staff_management": "Manajemen Staf",
                "profile": "Profil",
                "pos_system": "Sistem POS",
                "members": "Member",
                "sales_reports": "Laporan Penjualan",
                "loyalty_rewards": "Hadiah Loyalitas",
                "health_intel": "Intel Kesehatan",
                "select_store": "Pilih Toko",
                "shopping_queue": "Antrian Belanja",
                "wallet": "Dompet",
                "task_reporting": "Laporan Tugas",
                "billing": "Tagihan",
                "settings": "Pengaturan",
                "keyboard_shortcuts": "Shortcut Keyboard",
                "sign_out": "Keluar",
                "logout": "Log Out",
                "support": "Bantuan",
                "api": "API"
            },
            "common": {
                "my_account": "Akun Saya",
                "pending_approval": "Menunggu Persetujuan",
                "pending_approval_desc": "Akses toko Anda sedang ditinjau oleh administrator kami. Anda dapat mengelola inventaris setelah disetujui.",
                "contact_support": "Hubungi bantuan jika ini memakan waktu lebih dari 24 jam",
                "active_store": "Toko Aktif",
                "new_chat": "Chat Baru",
                "delete_session_confirm": "Hapus sesi ini?"
            }
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
