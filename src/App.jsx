import React, { useState, useEffect } from 'react';
import { Layout, notification } from 'antd';

import {
	initializeSocket,
	emitCreateGame,
	emitJoinGame,
	emitLeaveGame,
} from './socket-connections/sockets';

import Lobby from './components/lobby/lobby.component';
import WaitingPage from './components/waiting-page/waiting-page.component';
import GameRoom from './components/game/game-room.component';

import { ReactComponent as SadFace } from './assets/sad-face.svg';

import './App.css';

const { Header, Footer } = Layout;

const PAGE_LOBBY = 'Lobby';
const PAGE_WAITING = 'Waiting';
const PAGE_GAME = 'Game';

const App = () => {
	const [socket, setSocket] = useState(null);
	const [page, setPage] = useState(PAGE_LOBBY);
	const [game, setGame] = useState(null);
	const [games, setGames] = useState([]);
	const [gameId, setGameId] = useState(null);
	const [playerColor, setPlayerColor] = useState('');
	const [isGameStarted, setGameStarted] = useState(false);

	const createGame = (gameName) => {
		setPage(PAGE_WAITING);
		setPlayerColor('white');
		emitCreateGame(gameName);
	};

	const joinGame = (gameId) => {
		setPage(PAGE_WAITING);
		setGameId(gameId);
		setPlayerColor('black');
		emitJoinGame(gameId);
	};

	const leaveGame = (gameId) => {
		emitLeaveGame(gameId);
		setGame(null);
	};

	useEffect(() => {
		if (game) {
			setGameStarted(game.numberOfPlayers === 2);
		}
	}, [game]);

	useEffect(() => {
		const game = games.find((g) => g.id === gameId);
		if (game) setGame(game);
	}, [games, gameId]);

	useEffect(() => {
		const socket = initializeSocket();
		setSocket(socket);
	}, []);

	useEffect(() => {
		if (!socket) return;
		// Set available games
		socket.on('games', (games) => setGames(games));

		// Set new game id
		socket.on('your-game-created', (gameId) => setGameId(gameId));

		// Player joined game. Show game
		socket.on('game-joined', () => {
			setPage(PAGE_GAME);
		});

		// Reset props when game ends
		socket.on('end-game', () => {
			setGameId(null);
			setPlayerColor('');
			setPage(PAGE_LOBBY);
			openNotification();
		});

		return () => {
			console.log('Disconnecting socket...');
			if (socket) {
				leaveGame(gameId);
				socket.disconnect();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

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

				{page === PAGE_WAITING && <WaitingPage game={game} />}

				{page === PAGE_GAME && isGameStarted && (
					<GameRoom
						setPage={setPage}
						socket={socket}
						playerColor={playerColor}
						game={game}
						gameId={gameId}
						leaveGame={leaveGame}
					/>
				)}
			</Layout.Content>

			<Footer className='layout-footer'>Pasha Brovarnik ©2021</Footer>
		</Layout>
	);
};

export default App;
