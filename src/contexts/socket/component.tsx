import { FC, PropsWithChildren, useEffect, useReducer, useState } from 'react';
import { SocketContextProvider, SocketReducer, defaultSocketContextState } from './socket';
import { useSocket } from '@src/hooks/useSocket';
import { Chat, Game } from '@src/types';
import { PAGE_GAME, PAGE_LOBBY } from '@root/src/constants';
import { notification } from 'antd';

export interface SocketContextComponentProps extends PropsWithChildren {}
const SocketContextComponent: FC<SocketContextComponentProps> = ({ children }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [socketState, socketDispatch] = useReducer(SocketReducer, defaultSocketContextState);

	const socket = useSocket();

	useEffect(() => {
		// Connect to the websockt
		socket.connect();

		// Save the socket in state
		socketDispatch({ type: 'update_socket', payload: socket });

		// Start the event listeners
		startListeners();

		// Set available games
		const onGames = (games: Game[]) => {
			console.info('Updated list of games received');
			socketDispatch({ type: 'update_games', payload: games });
		};
		socket.on('games', onGames);

		// Start game
		const onStartGame = (game: Game) => {
			socketDispatch({ type: 'update_game', payload: game });
			socketDispatch({ type: 'update_is_game_started', payload: true });
			socketDispatch({ type: 'update_page', payload: PAGE_GAME });
		};
		socket.on('start-game', onStartGame);

		// Update game
		const onUpdateGame = (game: Game) => {
			socketDispatch({ type: 'update_game', payload: game });
		};
		socket.on('game-updated', onUpdateGame);

		// Reset props when game ends
		const onEndGame = () => {
			socketDispatch({ type: 'update_player_color', payload: null });
			socketDispatch({ type: 'update_page', payload: PAGE_LOBBY });
			socketDispatch({ type: 'update_game', payload: null });
			socketDispatch({ type: 'update_is_game_started', payload: false });
			socketDispatch({ type: 'remove_game', payload: socketState.game?.id });

			openNotification();
		};
		socket.on('end-game', onEndGame);

		// Update chat
		const onChatUpdated = (chat: Chat[]) => {
			socketDispatch({ type: 'update_chat', payload: [...chat] });
		};
		socket.on('chat-updated', onChatUpdated);

		// User connected
		const onUserConnected = ({ users, games }: { users: string[]; games: Game[] }) => {
			console.info('User connected message received');
			socketDispatch({ type: 'update_users', payload: users });
			socketDispatch({ type: 'update_games', payload: games });
		};
		socket.on('user_connected', onUserConnected);

		// User disconnected
		const onUserDisconnected = (uid: string) => {
			console.info('User disconnected message received');
			socketDispatch({ type: 'remove_user', payload: uid });
			// ***maybe add remove for games and game***
		};
		socket.on('user_disconnected', onUserDisconnected);

		// Connection error
		const onUCnnectedError = (err: Error) => {
			console.error(err.message);
		};
		socket.on('connect_error', onUCnnectedError);

		// Send handshake
		sendHandshake();

		return () => {
			console.info('Remove socket listeners...');
			socket.off('games', onGames);
			socket.off('start-game', onStartGame);
			socket.off('game-updated', onUpdateGame);
			socket.off('end-game', onEndGame);
			socket.off('chat-updated', onChatUpdated);
			socket.off('user_connected', onUserConnected);
			socket.off('user_disconnected', onUserDisconnected);
			socket.off('connect_error', onUCnnectedError);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	const startListeners = () => {
		// Connection / reconnection listeners
		socket.io.on('reconnect', (attempt) => {
			console.info('Reconnected on attempt:', attempt);
			sendHandshake();
		});

		socket.io.on('reconnect_attempt', (attempt) => {
			console.info('Reconnection attempt:', attempt);
		});

		socket.io.on('reconnect_error', (error) => {
			console.info('Reconnection error:', error);
		});

		socket.io.on('reconnect_failed', () => {
			console.info('Reconnection failure');
			alert('We are unable to connect you to the server');
		});
	};

	const sendHandshake = () => {
		console.info('Sending handshake to server...');

		socket.emit('handshake', async (uid: string, users: string[], games: Game[]) => {
			console.info('User handshake callback message received');
			socketDispatch({ type: 'update_users', payload: users });
			socketDispatch({ type: 'update_uid', payload: uid });
			socketDispatch({ type: 'update_games', payload: games });
		});

		setIsLoading(false);
	};

	const openNotification = () => {
		notification.info({
			message: 'Your opponent has left the game',
		});
	};

	if (isLoading) return <p>Loading Socket IO...</p>;

	return <SocketContextProvider value={{ socketState, socketDispatch }}>{children}</SocketContextProvider>;
};

export default SocketContextComponent;
