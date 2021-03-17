import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, Space, Spin } from 'antd';

import './style.css';

const GameAlerts = ({
	setPage,
	playerColor,
	game,
	isGameOver,
	inDraw,
	playerTurn,
	playAgain,
	resetGame,
	cancelPlayAgain,
}) => {
	const [isCurrentPlayersTurn, setCurrentPlayersTurn] = useState(false);
	const [playerTurnMoveMsg, setPlayerTurnMoveMsg] = useState('');
	const [alertType, setAlertType] = useState('');
	const [gameOverAlertType, setGameOverAlertType] = useState('');
	const [gameOverMsg, setGameOverMsg] = useState('');
	const [showPlayAgainModal, setShowPlayAgainModal] = useState(false);
	const [showPlayAnotherGameModal, setShowPlayAnotherGameModal] = useState(
		false
	);

	useEffect(() => {
		setCurrentPlayersTurn(playerColor[0] === playerTurn);
	}, [playerColor, playerTurn]);

	useEffect(() => {
		setPlayerTurnMoveMsg(
			isCurrentPlayersTurn ? 'Your move!' : "Wating for opponent's move..."
		);
		setAlertType(isCurrentPlayersTurn ? 'info' : 'warning');
	}, [isCurrentPlayersTurn]);

	useEffect(() => {
		if (!isGameOver) return;
		if (inDraw) {
			setGameOverAlertType('Draw match.');
			setGameOverMsg('info');
		} else {
			setGameOverAlertType(isCurrentPlayersTurn ? 'error' : 'success');
			setGameOverMsg(
				isCurrentPlayersTurn
					? 'You have been defeated.'
					: "Congratulations you've won!"
			);
		}
	}, [isGameOver, inDraw, isCurrentPlayersTurn]);

	// Reset chess engine and board
	useEffect(() => {
		if (game.playAgain && !showPlayAgainModal) {
			setShowPlayAnotherGameModal(true);
		}
		if ((!game.playAgain && showPlayAgainModal) || showPlayAnotherGameModal) {
			setShowPlayAgainModal(false);
			setShowPlayAnotherGameModal(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [game]);

	const handlePlayAgain = () => {
		playAgain(game.id);
		setShowPlayAgainModal(true);
	};

	const handleResetGame = () => {
		cancelPlayAgain(game.id);
		resetGame(game.id);
	};

	return (
		<div className='alert-container'>
			{isGameOver && gameOverMsg && (
				<Alert
					message={`Game Over! ${gameOverMsg}`}
					type={gameOverAlertType}
					showIcon
					action={
						<Space>
							<Button onClick={handlePlayAgain} size='small' type='primary'>
								Play again?
							</Button>
							<Button onClick={() => setPage('Lobby')} size='small' type='primary'>
								Lobby
							</Button>
						</Space>
					}
				/>
			)}

			{!isGameOver && playerTurnMoveMsg && (
				<Alert message={playerTurnMoveMsg} type={alertType} showIcon />
			)}
			<Modal
				className='play-again-modal'
				title='Waiting for an opponent...'
				centered
				visible={showPlayAgainModal}
				closable={false}
				footer={[
					<Button key='back' onClick={() => cancelPlayAgain(game.id)}>
						Cancel
					</Button>,
				]}
				onCancel={() => cancelPlayAgain(game.id)}
			>
				<Spin size='large' />
			</Modal>
			<Modal
				className='another-game-modal'
				title='Opponent wants to play another game!'
				centered
				visible={showPlayAnotherGameModal}
				closable={false}
				cancelText='No'
				okText='Yes'
				onOk={handleResetGame}
				onCancel={() => cancelPlayAgain(game.id)}
			></Modal>
		</div>
	);
};

export default GameAlerts;
