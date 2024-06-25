import Input from '@components/input/input.component';
import Messages from '@components/messages/messages.component';

import './style.css';

const Chat = () => {
	return (
		<div className="chat-container">
			<div className="chat">
				<Messages />
				<Input />
			</div>
		</div>
	);
};

export default Chat;
