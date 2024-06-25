import { useContext, useEffect, useRef } from 'react';
import { Button, Empty, Input, InputRef, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';

import SocketContext from '@src/contexts/socket/socket';

import './style.css';

type Props = {
	createGame: (gameName: string) => void;
	joinGame: (gameId: string) => void;
};

const Lobby = ({ createGame, joinGame }: Props) => {
	const inputRef = useRef<InputRef | null>(null);

	const { games } = useContext(SocketContext).socketState;

	useEffect(() => {
		return () => {
			inputRef.current = null;
		};
	}, []);

	const columns: ColumnsType = [
		{
			dataIndex: 'gameName',
			align: 'center',
		},
		{
			key: 'action',
			align: 'center',
			render: ({ key, numberOfPlayers }) => (numberOfPlayers < 2 ? <Button onClick={() => joinGame(key)}>Join</Button> : <Button disabled>Game in progress</Button>),
		},
	];

	const data = games.map(({ id, gameName, numberOfPlayers }) => ({
		key: id,
		gameName,
		numberOfPlayers,
	}));

	const onSearch = (gameName: string) => {
		if (!gameName) return;
		createGame(gameName);
		if (inputRef.current?.input) inputRef.current.input.value = '';
	};

	return (
		<div className="lobby-container">
			<Input.Search ref={inputRef} autoFocus placeholder="Create game by adding a name" allowClear enterButton="Add" size="large" onSearch={onSearch} style={{ marginBottom: '12px' }} />

			<Table
				columns={columns}
				dataSource={data}
				pagination={false}
				showHeader={false}
				locale={{
					emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No games created" />,
				}}
			/>
		</div>
	);
};

export default Lobby;
