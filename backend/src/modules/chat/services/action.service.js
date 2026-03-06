import { OwnerService } from '../../owner/owner.service.js';

export class ActionService {
    

    constructor() {
        this.ownerService = new OwnerService();
    }

    // Handle specific intents that map directly to API calls or strict logic
    async execute(intent, message, userId, ownerId) {
        const lowerMsg = message.toLowerCase();

        switch (intent) {
            case 'order_status':
                return this.handleOrderStatus(lowerMsg, userId, ownerId);
            case 'refund_request':
                return 'Untuk proses refund, silakan masuk ke menu "Pesanan", pilih pesanan Anda, dan klik tombol "Ajukan Refund" dalam waktu 1x24 jam setelah barang diterima. Tim kami akan segera memproses pengajuan Anda.';
            case 'complaint':
                return 'Kami sangat menyesal atas ketidaknyamanan yang Anda alami. Keluhan Anda telah kami rekam. Apakah Anda ingin langsung dihubungkan dengan staf lapangan kami? Anda bisa menggunakan tombol "Panggil Staff" di layar Anda.';
            default:
                return null;
        }
    }

     async handleOrderStatus(message, userId, ownerId) {
        // Basic extraction of order ID using Regex for quick parsing
        // Example: "cek pesanan TRX-12345"
        const trxRegex = /trx-\w+/i;
        const match = message.match(trxRegex);

        if (match) {
            // In reality, this would query Prisma.
            // const trx = await prisma.transaction.findUnique({ where: { id: match[0].toUpperCase() } });
            return `Pesanan Anda dengan nomor ${match[0].toUpperCase()} sedang dalam proses pengiriman. Silakan tunggu update selanjutnya.`;
        }

        return 'Tentu, saya bisa bantu cek pesanan. Mohon informasikan nomor pesanan Anda (dimulai dengan TRX-...).';
    }
}
