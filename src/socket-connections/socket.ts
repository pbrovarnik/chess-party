import { io } from 'socket.io-client';

const SOCKET_URL = `${import.meta.env.APP_SERVER_URL}/chess-party`;

export const socket = io(SOCKET_URL, {
	autoConnect: false,
	transports: ['websocket'],
});
