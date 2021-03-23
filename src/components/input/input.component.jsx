import React, { useEffect, useRef } from 'react';
import { Input as SearchInput } from 'antd';

import './style.css';

const Input = ({ setMessage, handleSendMessage }) => {
	const inputRef = useRef(null);

	useEffect(() => {
		return () => {
			inputRef.current = null;
		};
	}, []);

	const onSearch = () => {
		handleSendMessage();
		inputRef.current.state.value = '';
	};

	return (
		<SearchInput.Search
			className='chat-input'
			placeholder='Type message...'
			enterButton='Send'
			size='large'
			onSearch={onSearch}
			ref={inputRef}
			onChange={({ target: { value } }) => setMessage(value)}
		/>
	);
};

export default Input;
