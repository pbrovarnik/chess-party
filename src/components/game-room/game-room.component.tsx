import Board from '@components/board/board.component';
import VideoChat from '@src/components/video-chat/video-chat.component';
import Chat from '@components/chat/chat.component';

import './style.css';

const GameRoom = () => {
	return (
		<div className="game-room-container">
			<Board />
			<VideoChat />
			<Chat />
		</div>
	);
};

export default GameRoom;
