import React, { useEffect } from 'react';

import Board from 'components/board/board.component';
import VideoChat from 'components/video-chat/video-chat.component';
import Chat from 'components/chat/chat.component';

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
			<Board
				socket={socket}
				game={game}
				playerColor={playerColor}
				setPage={setPage}
			/>
			<VideoChat socket={socket} />
			<Chat socket={socket} playerColor={playerColor} />
		</div>
	);
};

export default GameRoom;
