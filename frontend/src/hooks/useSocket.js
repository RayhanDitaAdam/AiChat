import { useContext } from 'react';
import { SSEContext } from '../context/SSEContext.js';

export const useSocket = () => {
    const context = useContext(SSEContext);
    if (!context) {
        throw new Error('useSocket must be used within a SSEProvider');
    }

    // Polyfill for backward compatibility with components using socket.on/off
    return {
        ...context,
        socket: {
            on: (event, callback) => context.subscribe(event, callback),
            off: (event, callback) => context.unsubscribe(event, callback),
            emit: (_event, _data) => {
                console.warn(`[SSE] socket.emit('${_event}') called but SSE is one-way. Use HTTP POST instead.`);
            }
        }
    };
};

export default useSocket;
