import React, { useEffect, useState } from 'react';

import Input from 'components/input/input.component';
import Messages from 'components/messages/messages.component';

import './style.css';

const Chat = ({ socket, playerColor }) => {
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		socket.on('chat-updated', (chat) => {
			setMessages([...chat]);
		});
	}, [socket]);

	const handleSendMessage = () => {
		if (message) {
			socket.emit('send-message', message);
			setMessage('');
		}
	};

	return (
		<div className='chat-container'>
			<div className='chat'>
				<Messages messages={messages} playerColor={playerColor} />
				<Input setMessage={setMessage} handleSendMessage={handleSendMessage} />
			</div>
		</div>
	);
};

export default Chat;
