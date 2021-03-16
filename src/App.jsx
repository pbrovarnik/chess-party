import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Layout } from 'antd';

import Lobby from './components/lobby/lobby.component';
import GameRoom from './components/game/game-room.component';

const { Header, Footer } = Layout;

const PAGE_GAME = 'Game';
const PAGE_LOBBY = 'Lobby';

const App = () => {
	const [socket, setSocket] = useState(null);
	const [page, setPage] = useState(PAGE_LOBBY);
	const [games, setGames] = useState([]);
	const [gameId, setGameId] = useState(null);
	const [game, setGame] = useState({ chat: [] });
	const [playerColor, setPlayerColor] = useState('');

	const createGame = (gameName) => {
		socket.emit('create-game', gameName);
		setPage(PAGE_GAME);
	};

	const joinGame = (gameId) => {
		socket.emit('join-game', gameId);
		setPage(PAGE_GAME);
		setGameId(gameId);
	};

	const movePiece = (move) => {
		socket.emit('move-piece', move);
	};

	useEffect(() => {
		// Create a socket connection
		const newSocket = io('https://chess-party-server.herokuapp.com');

		console.log('CHECKING SOCKET', newSocket);

		// Set available games
		newSocket.on('games', (games) => setGames(games));

		// Set new game id
		newSocket.on('your-game-created', (gameId) => setGameId(gameId));

		// Set player color
		newSocket.on('color', (color) => setPlayerColor(color));

		// Set new socket
		setSocket(newSocket);

		return () => {
			console.log('Disconnecting socket...');
			if (socket) socket.disconnect();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const game = games.find((g) => g.id === gameId);
		if (!game) {
			setGame({
				board: [],
			});
		} else {
			setGame(game);
		}
	}, [games, gameId]);

	return (
		<Layout>
			<Header>
				<div style={{ color: '#fff', fontSize: '20px' }} className='logo'>
					Chess Party
				</div>
			</Header>

			<Layout.Content style={{ padding: '0 50px' }}>
				{page === PAGE_LOBBY && (
					<Lobby createGame={createGame} joinGame={joinGame} games={games} />
				)}
				{page === PAGE_GAME && game && (
					<GameRoom playerColor={playerColor} game={game} movePiece={movePiece} />
				)}
			</Layout.Content>

			<Footer style={{ textAlign: 'center' }}>Pasha Brovarnik ©2020</Footer>
		</Layout>
	);
};

export default App;
