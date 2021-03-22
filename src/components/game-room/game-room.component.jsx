import React, { useEffect } from 'react';

import Board from '../board/board.component';
import VideoChat from '../video-chat/video-chat.component';
import Chat from '../chat/chat.component';

import './style.css';

const GameRoom = ({ setPage, socket, playerColor, game, leaveGame }) => {
	useEffect(() => {
		return () => {
			leaveGame(game.id);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className='game-room-container'>
			{/* // TODO: try to do {...props} */}
			<Board
				socket={socket}
				game={game}
				playerColor={playerColor}
				setPage={setPage}
			/>
			<VideoChat socket={socket} />
			<Chat />
		</div>
	);
};

export default GameRoom;
