import { Move } from 'chess.js';
import { PAGE_GAME, PAGE_LOBBY, PAGE_WAITING, PLAYER_BLACK, PLAYER_WHITE } from './constants';

export type PlayerColor = typeof PLAYER_BLACK | typeof PLAYER_WHITE | typeof ADMIN;
export type Chat = {
	playerType: PlayerColor;
	text: string;
};
export type SocketWithGameId = Socket & { gameId: string };
export type Player = {
	id: string;
	playerType: PlayerColor;
	socket?: SocketWithGameId;
};
export type Game = {
	chat: Chat[];
	gameName: string;
	id: string;
	isPlayAgain: boolean;
	isResetGame: boolean;
	move?: Move;
	numberOfPlayers: number;
	players: Player[];
	turn: PlayerColor;
};
export type GameAlertType = 'info' | 'warning' | 'error' | 'success' | undefined;
export type Page = typeof PAGE_GAME | typeof PAGE_LOBBY | typeof PAGE_WAITING;
