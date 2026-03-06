import net from 'net';

export class PrintService {
    async sendToPrinter(ip, port, content) {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();

            const timeout = setTimeout(() => {
                client.destroy();
                resolve({ success: false, message: 'Connection timeout' });
            }, 5000);

            client.connect(port, ip, () => {
                clearTimeout(timeout);
                // Basic thermal printer formatting (ESC/POS) could be added here
                // For now, we'll just send raw text
                client.write(content + '\n\n\n\n'); // Add some padding for the cutter
                client.end();
                resolve({ success: true, message: 'Print job sent successfully' });
            });

            client.on('error', (err) => {
                clearTimeout(timeout);
                resolve({ success: false, message: `Printer error: ${err.message}` });
            });
        });
    }

    formatShoppingList(userName, items) {
        const separator = '--------------------------------\n';
        let content = `\n     AI SHOPPING ASSISTANT\n`;
        content += `     User: ${userName}\n`;
        content += `     Date: ${new Date().toLocaleString()}\n`;
        content += separator;
        content += `   Item            Qty   Price\n`;
        content += separator;

        let total = 0;
        items.forEach(item => {
            const name = item.product.name.padEnd(15).substring(0, 15);
            const qty = item.quantity.toString().padStart(3);
            const price = (item.product.price * item.quantity).toFixed(2).padStart(8);
            content += ` ${name} ${qty} ${price}\n`;
            total += item.product.price * item.quantity;
        });

        content += separator;
        content += ` Total:           ${total.toFixed(2).padStart(12)}\n`;
        content += separator;
        content += `\n     Thank you for using\n`;
        content += `     AI Shopping Assistant!\n\n\n`;

        return content;
    }
}

export default new PrintService();
