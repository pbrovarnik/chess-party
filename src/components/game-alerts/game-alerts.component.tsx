import { useContext, useEffect, useRef, useState } from 'react';
import { Alert, Button, Modal, Space, Spin } from 'antd';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Color } from 'chess.js';

import SocketContext from '@src/contexts/socket/socket';
import { GameAlertType } from '@src/types';

import soundFile from '@src/assets/your-turn-sound.mp3';

import './style.css';

type Props = {
	cancelPlayAgain: (gameId?: string) => void;
	inCheck: boolean | undefined;
	inDraw: boolean | undefined;
	isGameOver: boolean | undefined;
	isShowPlayAgainModal: boolean;
	isShowPlayAnotherGameModal: boolean;
	onPlayAgain: () => void;
	onResetGame: () => void;
	onShowPlayAgainModal: (showModal: boolean) => void;
	onShowPlayAnotherGameModal: (showModal: boolean) => void;
	playerTurn: Color | undefined;
};

const GameAlerts = ({
	cancelPlayAgain,
	inCheck,
	inDraw,
	isGameOver,
	isShowPlayAgainModal,
	isShowPlayAnotherGameModal,
	playerTurn,
	onPlayAgain,
	onResetGame,
	onShowPlayAgainModal,
	onShowPlayAnotherGameModal,
}: Props) => {
	const [isCurrentPlayersTurn, setCurrentPlayersTurn] = useState(false);
	const [playerTurnMoveMsg, setPlayerTurnMoveMsg] = useState('');
	const [alertType, setAlertType] = useState<GameAlertType>();
	const [gameOverAlertType, setGameOverAlertType] = useState<GameAlertType>();
	const [gameOverMsg, setGameOverMsg] = useState('');

	const { game, playerColor } = useContext(SocketContext).socketState;

	const yourTurnSound = useRef<HTMLAudioElement | null>(null);

	const { width, height } = useWindowSize();

	useEffect(() => {
		yourTurnSound.current = new Audio(soundFile);

		return () => {
			if (yourTurnSound.current) {
				yourTurnSound.current = null;
			}
		};
	}, []);

	useEffect(() => {
		setCurrentPlayersTurn(playerColor?.[0] === playerTurn);
	}, [playerColor, playerTurn]);

	useEffect(() => {
		setPlayerTurnMoveMsg(isCurrentPlayersTurn ? `Your move! ${inCheck ? 'CHECK!' : ''}` : "Wating for opponent's move...");
		setAlertType(isCurrentPlayersTurn ? 'info' : 'warning');

		if (isCurrentPlayersTurn) yourTurnSound.current?.play();
	}, [isCurrentPlayersTurn, inCheck]);

	useEffect(() => {
		if (!isGameOver) return;

		if (inDraw) {
			setGameOverAlertType('info');
			setGameOverMsg('Draw match.');
		} else {
			setGameOverAlertType(isCurrentPlayersTurn ? 'error' : 'success');
			setGameOverMsg(isCurrentPlayersTurn ? 'You have been defeated.' : "Congratulations you've won!");
		}
	}, [isGameOver, inDraw, isCurrentPlayersTurn]);

	// Reset chess engine and board
	useEffect(() => {
		if (!game) return;
		if (game.isPlayAgain && !isShowPlayAgainModal) onShowPlayAnotherGameModal(true);
		if ((!game.isPlayAgain && isShowPlayAgainModal) || isShowPlayAnotherGameModal) {
			onShowPlayAgainModal(false);
			onShowPlayAnotherGameModal(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [game]);

	const handleCancelPlayAnotherGame = () => {
		cancelPlayAgain(game?.id);
		onShowPlayAnotherGameModal(false);
	};

	const handleCancelPlayAgain = () => {
		cancelPlayAgain(game?.id);
		onShowPlayAgainModal(false);
	};

	return (
		<div className="alert-container">
			{isGameOver && !isCurrentPlayersTurn && <Confetti width={width} height={height} numberOfPieces={1000} recycle={false} />}

			{isGameOver && gameOverMsg && (
				<Alert
					message={`Game Over! ${gameOverMsg}`}
					type={gameOverAlertType}
					showIcon
					action={
						<Space>
							<Button onClick={onPlayAgain} size="small" type="primary">
								Play again?
							</Button>
						</Space>
					}
				/>
			)}

			{!isGameOver && playerTurnMoveMsg && <Alert message={playerTurnMoveMsg} type={alertType} showIcon />}
			<Modal
				className="play-again-modal"
				title="Waiting for an opponent..."
				centered
				open={isShowPlayAgainModal}
				closable={false}
				footer={[
					<Button key="back" onClick={handleCancelPlayAgain}>
						Cancel
					</Button>,
				]}>
				<Spin size="large" />
			</Modal>
			<Modal
				className="another-game-modal"
				title="Opponent wants to play another game!"
				centered
				open={isShowPlayAnotherGameModal}
				closable={false}
				cancelText="No"
				okText="Yes"
				onOk={onResetGame}
				onCancel={handleCancelPlayAnotherGame}></Modal>
		</div>
	);
};

export default GameAlerts;
