
export class SSEService {
    constructor() {
        this.clients = new Set();
    }

    /**
     * Register a new SSE client
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     */
    addClient(req, res) {
        const userId = req.query.userId;
        const guestId = req.query.guestId;
        const clientId = userId || guestId || `guest_${Date.now()}`;

        // SSE Headers - Using setHeader to avoid overwriting CORS headers from middleware
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders(); // Send headers immediately

        // Send an initial "connected" event
        const initialData = JSON.stringify({ status: 'connected', clientId });
        res.write(`data: ${initialData}\n\n`);

        const newClient = {
            id: clientId,
            userId,
            guestId,
            res,
            rooms: new Set([clientId]) // Default room is the client ID itself
        };

        this.clients.add(newClient);

        console.log(`[SSE] Client connected: ${clientId}. Total clients: ${this.clients.size}`);

        // Broadcast "online" status of the user to everyone
        if (userId) {
            this.broadcastToAll('user_status_change', { userId, status: 'online' });
        }

        req.on('close', () => {
            console.log(`[SSE] Client disconnected: ${clientId}`);
            this.clients.delete(newClient);

            // Broadcast "offline" status of the user to everyone
            if (userId) {
                // Check if user has other active connections (e.g. other tabs)
                const isStillConnected = Array.from(this.clients).some(c => c.userId === userId);
                if (!isStillConnected) {
                    this.broadcastToAll('user_status_change', { userId, status: 'offline' });
                }
            }
        });

        return newClient;
    }

    /**
     * Join a room (similar to socket.join)
     * @param {string} clientId 
     * @param {string} roomName 
     */
    joinRoom(clientId, roomName) {
        for (const client of this.clients) {
            if (client.id === clientId) {
                client.rooms.add(roomName);
                console.log(`[SSE] Client ${clientId} joined room ${roomName}`);
                break;
            }
        }
    }

    /**
     * Broadcast an event to every connected client
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    broadcastToAll(event, data) {
        const payload = JSON.stringify({ event, data });
        for (const client of this.clients) {
            client.res.write(`data: ${payload}\n\n`);
        }
    }

    /**
     * Broadcast an event to a room
     * @param {string} room - Room name or client ID
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    broadcast(room, event, data) {
        const payload = JSON.stringify({ event, data });
        let count = 0;

        for (const client of this.clients) {
            if (client.rooms.has(room) || client.id === room) {
                client.res.write(`data: ${payload}\n\n`);
                count++;
            }
        }

        // Also check for specific store rooms (e.g., store_OWNERID)
        // If the room name matches a pattern, we might need more logic
        // but for now, simple room matching works.

        // console.log(`[SSE] Broadcasted '${event}' to room '${room}' (${count} clients)`);
    }

    /**
     * Get list of online user IDs
     * @returns {string[]}
     */
    getOnlineUserIds() {
        const userIds = new Set();
        for (const client of this.clients) {
            if (client.userId) {
                userIds.add(client.userId);
            }
        }
        return Array.from(userIds);
    }
}

export const sseService = new SSEService();
