import React, { useEffect } from 'react';

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
	useEffect(() => {
		return () => {
			leaveGame(gameId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div>
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
		</div>
	);
};

export default GameRoom;
