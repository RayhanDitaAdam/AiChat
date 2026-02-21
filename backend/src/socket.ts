import { Server, Socket } from 'socket.io';

export let io: Server;
export const onlineUsers = new Map<string, string>(); // userId -> socketId

export const initializeSocket = (socketIo: Server) => {
    io = socketIo;

    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        const userId = socket.handshake.query.userId as string;
        const guestId = socket.handshake.query.guestId as string;

        if (userId && userId !== 'undefined' && userId !== 'null') {
            onlineUsers.set(userId, socket.id);
            socket.join(userId); // Join own private room
            io.emit('user_status_change', { userId, status: 'online' });
        } else if (guestId && guestId !== 'undefined' && guestId !== 'null') {
            socket.join(guestId); // Join guest room for AI streaming
            console.log(`Guest ${guestId} joined private room.`);
        }

        socket.on('join_store', (storeId: string) => {
            const roomName = `store_${storeId}`;
            socket.join(roomName);
            console.log(`User ${socket.id} joined store room ${roomName}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            if (userId) {
                onlineUsers.delete(userId);
                io.emit('user_status_change', { userId, status: 'offline' });
            }
        });
    });
};

export const getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
};
