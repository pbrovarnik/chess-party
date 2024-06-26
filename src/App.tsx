import { useContext } from 'react';
import { Layout } from 'antd';

import { emitCreateGame, emitJoinGame } from '@socket-connections/connections';

import Lobby from '@components/lobby/lobby.component';
import WaitingPage from '@root/src/components/waiting-page/waiting-page.component';
import GameRoom from '@root/src/components/game-room/game-room.component';

import { PAGE_GAME, PAGE_LOBBY, PAGE_WAITING, PLAYER_BLACK, PLAYER_WHITE } from './constants';
import SocketContext from './contexts/socket/socket';

import './App.css';

const { Header, Footer } = Layout;

const App = () => {
	const { socketState, socketDispatch } = useContext(SocketContext);
	const { game, isGameStarted, page, socket } = socketState;

	const createGame = (gameName: string) => {
		socketDispatch({ type: 'update_page', payload: PAGE_WAITING });
		socketDispatch({ type: 'update_player_color', payload: PLAYER_WHITE });
		if (socket) emitCreateGame(socket, gameName);
	};

	const joinGame = (gameId: string) => {
		socketDispatch({ type: 'update_page', payload: PAGE_WAITING });
		socketDispatch({ type: 'update_player_color', payload: PLAYER_BLACK });
		if (socket) emitJoinGame(socket, gameId);
	};

	return (
		<Layout>
			<Header className="layout-header">
				<div className="logo">Chess Party</div>
			</Header>

			<Layout.Content className="layout-content">
				{page === PAGE_LOBBY && <Lobby createGame={createGame} joinGame={joinGame} />}

				{page === PAGE_WAITING && <WaitingPage gameName={game?.gameName ?? ''} />}

				{page === PAGE_GAME && isGameStarted && <GameRoom />}
			</Layout.Content>

			<Footer className="layout-footer">
				<a target="_blank" rel="noopener noreferrer" href="pbrovarnik.github.io/portfolio/">
					Pasha Brovarnik
				</a>
			</Footer>
		</Layout>
	);
};

export default App;
