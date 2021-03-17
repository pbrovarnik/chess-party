import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Layout, notification } from 'antd';
import { v4 as uuid } from 'uuid';

import Lobby from './components/lobby/lobby.component';
import GameRoom from './components/game/game-room.component';

import { ReactComponent as SadFace } from './assets/sad-face.svg';

import './App.css';

const { Header, Footer } = Layout;

const API_URL = process.env.REACT_APP_SERVER_URL || 'http://127.0.0.1:5000';

const PAGE_GAME = 'Game';
const PAGE_LOBBY = 'Lobby';

const App = () => {
	const [socket, setSocket] = useState(null);
	const [page, setPage] = useState(PAGE_LOBBY);
	const [game, setGame] = useState(null);
	const [games, setGames] = useState([]);
	const [gameId, setGameId] = useState(null);
	const [playerColor, setPlayerColor] = useState('');

	const createGame = (gameName) => {
		socket.emit('create-game', gameName, uuid());
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

	const leaveGame = () => {
		setGame(null);
		socket.emit('leave-game');
	};

	useEffect(() => {
		// Create a socket connection
		const newSocket = io(API_URL);

		// Set available games
		newSocket.on('games', (games) => setGames(games));

		// Set new game id
		newSocket.on('your-game-created', (gameId) => setGameId(gameId));

		// Set player color
		newSocket.on('color', (color) => setPlayerColor(color));

		// Reset props when game ends
		newSocket.on('end-game', () => {
			setGameId(null);
			setPlayerColor('');
			setPage(PAGE_LOBBY);
			openNotification();
		});

		// Set new socket
		setSocket(newSocket);

		return () => {
			console.log('Disconnecting socket...');
			if (socket) {
				leaveGame();
				socket.disconnect();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const game = games.find((g) => g.id === gameId);
		if (game) setGame(game);
	}, [games, gameId]);

	const openNotification = () => {
		notification.open({
			message: 'Game over!',
			description: 'Your opponent has left the game',
			icon: <SadFace style={{ width: '24px', height: '24px', fill: '#108ee9' }} />,
		});
	};

	return (
		<Layout>
			<Header className='layout-header'>
				<div className='logo' onClick={() => setPage(PAGE_LOBBY)}>
					Chess Party
				</div>
			</Header>

			<Layout.Content style={{ padding: '0 50px' }}>
				{page === PAGE_LOBBY && (
					<Lobby createGame={createGame} joinGame={joinGame} games={games} />
				)}
				{page === PAGE_GAME && game && (
					<GameRoom
						setPage={setPage}
						socket={socket}
						playerColor={playerColor}
						game={game}
						movePiece={movePiece}
						leaveGame={leaveGame}
					/>
				)}
			</Layout.Content>

			<Footer className='layout-footer'>Pasha Brovarnik ©2021</Footer>
		</Layout>
	);
};

export default App;
