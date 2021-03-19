import io from 'socket.io-client';
import { v4 as uuid } from 'uuid';

const SOCKET_URL = process.env.REACT_APP_SERVER_URL || 'http://127.0.0.1:5000';

let socket;

export const initializeSocket = () => {
	socket = io.connect(SOCKET_URL);
	return socket;
};

export const emitCreateGame = (gameName) => {
	socket.emit('create-game', gameName, uuid());
};

export const emitJoinGame = (gameId) => {
	socket.emit('join-game', gameId);
};

export const emitMovePiece = (move) => {
	socket.emit('move-piece', move);
};

export const emitLeaveGame = (gameId) => {
	socket.emit('leave-game', gameId);
};

export const emitMakeCall = () => {
	socket.emit('make-call');
};

export const emitCallUser = (signalData) => {
	socket.emit('call-user', signalData);
};

export const emitAcceptCall = (signalData) => {
	socket.emit('accept-call', signalData);
};
