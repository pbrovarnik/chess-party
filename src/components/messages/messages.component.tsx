import { Fragment, useContext, useEffect, useRef } from 'react';

import Message from '@components/message/message.component';
import SocketContext from '@src/contexts/socket/socket';

import './style.css';

const Messages = () => {
	const { chat } = useContext(SocketContext).socketState;

	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [chat.length]);

	return (
		<div className="messages">
			{chat.map((msg, idx) => (
				<Fragment key={idx}>
					<Message message={msg} />
					<div ref={messagesEndRef} />
				</Fragment>
			))}
		</div>
	);
};

export default Messages;
