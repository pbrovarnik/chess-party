import { useContext, useState } from 'react';
import { Input as SearchInput } from 'antd';

import SocketContext from '@src/contexts/socket/socket';
import { emitSendMessage } from '@src/socket-connections/connections';

import './style.css';

const Input = () => {
	const { socket } = useContext(SocketContext).socketState;
	const [inputValue, setInputValue] = useState('');

	const onSearch = (value: string) => {
		if (socket) emitSendMessage(socket, value);
		setInputValue('');
	};

	return (
		<SearchInput.Search
			value={inputValue}
			onChange={(e) => setInputValue(e.currentTarget.value)}
			className="chat-input"
			placeholder="Type message..."
			enterButton="Send"
			size="large"
			onSearch={onSearch}
		/>
	);
};

export default Input;
