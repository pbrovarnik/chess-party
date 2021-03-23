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
import GameRoom from './components/game-room/game-room.component';

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
	const [playerColor, setPlayerColor] = useState('');
	const [isGameStarted, setGameStarted] = useState(false);

	const createGame = (gameName) => {
		setPage(PAGE_WAITING);
		setPlayerColor('white');
		emitCreateGame(gameName);
	};

	const joinGame = (gameId) => {
		setPage(PAGE_WAITING);
		setPlayerColor('black');
		emitJoinGame(gameId);
	};

	const leaveGame = (gameId) => {
		emitLeaveGame(gameId);
		setGame(null);
	};

	useEffect(() => {
		if (game && game.numberOfPlayers === 2) {
			setGameStarted(game.numberOfPlayers === 2);
			setPage(PAGE_GAME);
		}
	}, [game]);

	useEffect(() => {
		const socket = initializeSocket();
		setSocket(socket);
	}, []);

	useEffect(() => {
		if (!socket) return;

		// Set available games
		socket.on('games', (games) => setGames(games.reverse()));

		// Update game
		socket.on('game-updated', (game) => setGame(game));

		// Reset props when game ends
		socket.on('end-game', () => {
			setPlayerColor('');
			setPage(PAGE_LOBBY);
			openNotification();
		});

		return () => {
			console.log('Disconnecting socket...');
			if (socket) {
				socket.disconnect();
				socket.off();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	const openNotification = () => {
		notification.info({
			message: 'Your opponent has left the game',
		});
	};

	const handleLogoClick = () => {
		if (game && page !== PAGE_LOBBY) {
			leaveGame(game.id);
			setPage(PAGE_LOBBY);
		}
	};

	return (
		<Layout>
			<Header className='layout-header'>
				<div className='logo' onClick={handleLogoClick}>
					Chess Party
				</div>
			</Header>

			<Layout.Content className='layout-content'>
				{page === PAGE_LOBBY && (
					<Lobby createGame={createGame} joinGame={joinGame} games={games} />
				)}

				{page === PAGE_WAITING && <WaitingPage game={game} leaveGame={leaveGame} />}

				{page === PAGE_GAME && isGameStarted && (
					<GameRoom
						setPage={setPage}
						socket={socket}
						playerColor={playerColor}
						game={game}
						leaveGame={leaveGame}
					/>
				)}
			</Layout.Content>

			<Footer className='layout-footer'>
				©2021 -{' '}
				<a
					target='_blank'
					rel='noopener noreferrer'
					href='https://www.pasha-brovarnik.com'
				>
					Pasha Brovarnik
				</a>
			</Footer>
		</Layout>
	);
};

export default App;
