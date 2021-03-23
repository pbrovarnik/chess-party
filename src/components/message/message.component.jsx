import React from 'react';

import './style.css';

const Message = ({ message: { player, text }, playerColor }) => {
	let isSentByCurrentPlayer = false;
	let isAdmin = false;

	if (playerColor === player) isSentByCurrentPlayer = true;

	if (player === 'admin') isAdmin = true;

	return isSentByCurrentPlayer ? (
		<div className='message-container align-end'>
			<div className='message-box background-blue'>
				<p className='message-text color-white'>{text}</p>
			</div>
			<p className='sent-text'>me</p>
		</div>
	) : (
		<div className='message-container align-start'>
			<div
				className={`message-box ${
					isAdmin ? 'background-light-blue ' : 'background-light'
				}`}
			>
				<p className='message-text color-dark'>{text}</p>
			</div>
			<p className='sent-text'>{player}</p>
		</div>
	);
};

export default Message;
