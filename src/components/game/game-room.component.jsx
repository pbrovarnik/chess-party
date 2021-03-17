import React from 'react';
import WaitingPage from '../waiting-page/waiting-page.component';
import Board from '../board/board.component';

import './style.css';

const GameRoom = ({ playerColor, game, movePiece, socket }) => {
	const isGameStarted = () => game.numberOfPlayers === 2;
	return (
		<div>
			{!isGameStarted() && <WaitingPage game={game} />}
			{isGameStarted() && (
				// TODO: try to do {...props}
				<Board
					playerColor={playerColor}
					game={game}
					movePiece={movePiece}
					socket={socket}
				/>
			)}
		</div>
	);
};

export default GameRoom;
