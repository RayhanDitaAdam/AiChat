import { Server } from 'socket.io';
export declare let io: Server;
export declare const onlineUsers: Map<string, string>;
export declare const initializeSocket: (socketIo: Server) => void;
export declare const getOnlineUsers: () => string[];
//# sourceMappingURL=socket.d.ts.map