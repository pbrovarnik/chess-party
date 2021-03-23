import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

import Message from 'components/message/message.component';

import './style.css';

const Messages = ({ messages, playerColor }) => (
	<ScrollToBottom className='messages'>
		{messages.map((msg, idx) => (
			<div key={idx}>
				<Message message={msg} playerColor={playerColor} />
			</div>
		))}
	</ScrollToBottom>
);

export default Messages;
