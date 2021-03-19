import React, { useEffect, useState, useContext } from 'react';

import ChessPartyContext from '../../context/context';

import WaitingPage from '../waiting-page/waiting-page.component';
import Board from '../board/board.component';
import VideoChat from '../video-chat/video-chat.component';

import './style.css';

const GameRoom = ({
	setPage,
	socket,
	playerColor,
	game,
	gameId,
	leaveGame,
}) => {
	const data = useContext(ChessPartyContext);

	const [isGameStarted, setGameStarted] = useState(false);

	useEffect(() => {
		setGameStarted(game.numberOfPlayers === 2);
	}, [game.numberOfPlayers]);

	useEffect(() => {
		return () => {
			leaveGame(gameId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div>
			{!isGameStarted ? (
				<WaitingPage game={game} />
			) : (
				<div className='game-room-container'>
					{/* // TODO: try to do {...props} */}
					<Board
						socket={socket}
						game={game}
						playerColor={playerColor}
						setPage={setPage}
					/>
					<VideoChat socket={socket} gameId={gameId} />
				</div>
			)}
		</div>
	);
};

export default GameRoom;
