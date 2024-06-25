import { useContext } from 'react';
import { Chat } from '@src/types';
import SocketContext from '@src/contexts/socket/socket';

import './style.css';

type Props = {
	message: Chat;
};

const Message = ({ message: { playerType, text } }: Props) => {
	const { playerColor } = useContext(SocketContext).socketState;

	let isSentByCurrentPlayer = false;
	let isAdmin = false;

	if (playerColor === playerType) isSentByCurrentPlayer = true;

	if (playerType === 'admin') isAdmin = true;

	return isSentByCurrentPlayer ? (
		<div className="message-container align-end">
			<div className="message-box background-blue">
				<p className="message-text color-white">{text}</p>
			</div>
			<p className="sent-text">me</p>
		</div>
	) : (
		<div className="message-container align-start">
			<div className={`message-box ${isAdmin ? 'background-light-blue ' : 'background-light'}`}>
				<p className="message-text color-dark">{text}</p>
			</div>
			<p className="sent-text">{playerType}</p>
		</div>
	);
};

export default Message;
