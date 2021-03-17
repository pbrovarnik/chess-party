import React, { useEffect } from 'react';
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
	useEffect(() => {
		return () => {
			leaveGame();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isGameStarted = () => game.numberOfPlayers === 2;

	return (
		<div>
			{!isGameStarted() && <WaitingPage game={game} />}
			{isGameStarted() && (
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
