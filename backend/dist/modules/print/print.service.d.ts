export declare class PrintService {
    sendToPrinter(ip: string, port: number, content: string): Promise<{
        success: boolean;
        message: string;
    }>;
    formatShoppingList(userName: string, items: any[]): string;
}
declare const _default: PrintService;
export default _default;
//# sourceMappingURL=print.service.d.ts.map