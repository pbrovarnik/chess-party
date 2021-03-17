import React, { useEffect, useState } from 'react';
import WaitingPage from '../waiting-page/waiting-page.component';
import Board from '../board/board.component';

import './style.css';

const GameRoom = ({
	setPage,
	socket,
	playerColor,
	game,
	movePiece,
	leaveGame,
}) => {
	const [isGameStarted, setGameStarted] = useState(false);

	useEffect(() => {
		setGameStarted(game.numberOfPlayers === 2);
	}, [game.numberOfPlayers]);

	useEffect(() => {
		return () => {
			leaveGame();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div>
			{!isGameStarted ? (
				<WaitingPage game={game} />
			) : (
				// TODO: try to do {...props}
				<Board
					setPage={setPage}
					socket={socket}
					playerColor={playerColor}
					game={game}
					movePiece={movePiece}
				/>
			)}
		</div>
	);
};

export default GameRoom;
