import { Move } from 'chess.js';
import { Socket } from 'socket.io-client';
import { v4 as uuid } from 'uuid';

export const emitCreateGame = (socket: Socket, gameName: string) => {
	socket.emit('create-game', gameName, uuid());
};

export const emitJoinGame = (socket: Socket, gameId: string) => {
	socket.emit('join-game', gameId);
};

export const emitMovePiece = (socket: Socket, move: Move) => {
	socket.emit('move-piece', move);
};

export const emitLeaveGame = (socket: Socket, gameId: string) => {
	socket.emit('leave-game', gameId);
};

export const emitOffer = (socket: Socket, offer: RTCSessionDescriptionInit) => {
	socket.emit('offer', offer);
};

export const emitAnswerOffer = (socket: Socket, answer: RTCSessionDescriptionInit) => {
	socket.emit('answer', answer);
};

export const emitCandidate = (socket: Socket, candidate: RTCIceCandidate) => {
	socket.emit('candidate', candidate);
};

export const emitAcceptCall = (socket: Socket) => {
	socket.emit('accept-call');
};

export const emitCancelCall = (socket: Socket) => {
	socket.emit('cancel-call');
};

export const emitEndCall = (socket: Socket) => {
	socket.emit('end-call');
};

export const emitPlayAgain = (socket: Socket, gameId: string) => {
	socket.emit('play-again', gameId);
};

export const emitCancelPlayAgain = (socket: Socket, gameId: string) => {
	socket.emit('cancel-play-again', gameId);
};

export const emitResetGame = (socket: Socket, gameId: string) => {
	socket.emit('reset-game', gameId);
};

export const emitSendMessage = (socket: Socket, message: string) => {
	socket.emit('send-message', message);
};
