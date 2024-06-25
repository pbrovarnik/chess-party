import { Dispatch, createContext } from 'react';
import { Socket } from 'socket.io-client';
import { Chat, Game, Page, PlayerColor } from '@src/types';
import { PAGE_LOBBY } from '@root/src/constants';

export type SocketContextState = {
	chat: Chat[];
	game: Game | null;
	games: Game[];
	isGameStarted: boolean;
	page: Page;
	playerColor: PlayerColor | null;
	socket: Socket | undefined;
	uid: string;
	users: string[];
};

export const defaultSocketContextState: SocketContextState = {
	chat: [],
	game: null,
	games: [],
	isGameStarted: false,
	page: PAGE_LOBBY,
	playerColor: null,
	socket: undefined,
	uid: '',
	users: [],
};

export type SocketActionType =
	| 'update_chat'
	| 'update_game'
	| 'update_games'
	| 'update_is_game_started'
	| 'update_page'
	| 'update_player_color'
	| 'update_socket'
	| 'update_uid'
	| 'update_users'
	| 'remove_game'
	| 'remove_user';
export type SocketPayload = boolean | Game | Game[] | string | string[] | Page | PlayerColor | Socket;

export type SocketContextAction = {
	type: SocketActionType;
	payload: SocketPayload;
};

export const SocketReducer = (state: SocketContextState, action: SocketContextAction) => {
	console.info('Message recieved - Action: ' + action.type + ' - Payload: ', action.payload);

	switch (action.type) {
		case 'update_chat':
			return { ...state, chat: action.payload as Chat[] };
		case 'update_game':
			return { ...state, game: action.payload as Game };
		case 'update_games':
			return { ...state, games: action.payload as Game[] };
		case 'update_is_game_started':
			return { ...state, isGameStarted: action.payload as boolean };
		case 'update_page':
			return { ...state, page: action.payload as Page };
		case 'update_player_color':
			return { ...state, playerColor: action.payload as PlayerColor };
		case 'update_socket':
			return { ...state, socket: action.payload as Socket };
		case 'update_uid':
			return { ...state, uid: action.payload as string };
		case 'update_users':
			return { ...state, users: action.payload as string[] };
		case 'remove_game':
			return { ...state, games: state.games.filter((game) => game.id !== (action.payload as string)) };
		case 'remove_user':
			return { ...state, users: state.users.filter((uid) => uid !== (action.payload as string)) };
		default:
			return state;
	}
};

export interface SocketContextProps {
	socketState: SocketContextState;
	socketDispatch: Dispatch<SocketContextAction>;
}

const SocketContext = createContext<SocketContextProps>({
	socketState: defaultSocketContextState,
	socketDispatch: () => {},
});

export const SocketContextConsumer = SocketContext.Consumer;
export const SocketContextProvider = SocketContext.Provider;

export default SocketContext;
