import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

export const useSocket = (): Socket => {
	const { current: socket } = useRef(io(`${import.meta.env.APP_SERVER_URL}/chess-party`, { reconnectionAttempts: 5, reconnectionDelay: 5000, autoConnect: false, transports: ['websocket'] }));

	useEffect(() => {
		return () => {
			if (socket) {
				console.info('Disconnecting socket...');
				socket.disconnect();
			}
		};
	}, [socket]);

	return socket;
};
