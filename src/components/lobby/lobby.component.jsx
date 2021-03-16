import React, { useRef } from 'react';
import { Button, Empty, Input, Table } from 'antd';

import './style.css';

const Lobby = ({ createGame, joinGame, games }) => {
	const inputRef = useRef(null);

	const columns = [
		{
			dataIndex: 'gameName',
			align: 'center',
		},
		{
			key: 'action',
			align: 'center',
			render: ({ key, numberOfPlayers }) =>
				numberOfPlayers < 2 ? (
					<Button onClick={() => joinGame(key)}>Join</Button>
				) : (
					<Button disabled>Game full</Button>
				),
		},
	];

	const data = games.map(({ id, gameName, numberOfPlayers }) => ({
		key: id,
		gameName,
		numberOfPlayers,
	}));

	const onSearch = (gameName) => {
		if (!gameName) return;
		createGame(gameName);
		inputRef.current.state.value = '';
	};

	return (
		<div className='lobby-container'>
			<Input.Search
				autoFocus
				placeholder='Create new game'
				allowClear
				enterButton='Add'
				size='large'
				onSearch={onSearch}
				ref={inputRef}
				style={{ marginBottom: '12px' }}
			/>

			<Table
				columns={columns}
				dataSource={data}
				pagination={false}
				showHeader={false}
				locale={{
					emptyText: (
						<Empty
							image={Empty.PRESENTED_IMAGE_SIMPLE}
							description='No games created'
						/>
					),
				}}
			/>
		</div>
	);
};

export default Lobby;
