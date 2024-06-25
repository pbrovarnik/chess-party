import { useCallback, useContext, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { Button } from 'antd';

import { emitCancelPlayAgain, emitLeaveGame, emitMovePiece, emitPlayAgain, emitResetGame } from '@socket-connections/connections';

import GameAlerts from '@components/game-alerts/game-alerts.component';
import SocketContext from '@src/contexts/socket/socket';
import { PAGE_LOBBY } from '@src/constants';

import './style.css';

type Piece = 'wP' | 'wN' | 'wB' | 'wR' | 'wQ' | 'wK' | 'bP' | 'bN' | 'bB' | 'bR' | 'bQ' | 'bK';

const Board = () => {
	const [chessEngine, setChessEngine] = useState<Chess | null>(new Chess());
	const [fen, setFen] = useState('start');
	const [isShowPlayAnotherGameModal, setShowPlayAnotherGameModal] = useState(false);
	const [isShowPlayAgainModal, setShowPlayAgainModal] = useState(false);

	const { socketDispatch, socketState } = useContext(SocketContext);
	const { game, page, playerColor, socket } = socketState;

	useEffect(() => {
		return () => {
			if (chessEngine) setChessEngine(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Get player move
	useEffect(() => {
		if (!game?.move || !chessEngine) return;
		try {
			chessEngine.move(game.move);
			setFen(chessEngine.fen());
		} catch {
			console.info('Invalid move!');
		}
	}, [game, chessEngine]);

	const resetBoard = useCallback(() => {
		chessEngine?.clear();
		chessEngine?.reset();
		setFen('start');
	}, [chessEngine]);

	// Reset chess chessEngine and board
	useEffect(() => {
		if (game?.isResetGame || !chessEngine) {
			resetBoard();
		}
	}, [game, chessEngine, resetBoard]);

	const handlePieceDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
		if (!chessEngine) return false;

		try {
			const move = chessEngine.move({
				from: sourceSquare,
				to: targetSquare,
				promotion: 'q',
			});

			if (!move) return false;

			if (socket) emitMovePiece(socket, move);
			setFen(chessEngine.fen());
			return true;
		} catch {
			console.info('Invalid move');
			return false;
		}
	};

	const handleIsPieceDraggable = (obj: { piece: Piece; sourceSquare: Square }): boolean => {
		const { piece } = obj;

		if (!chessEngine) return false;

		if (
			chessEngine.isGameOver() === true ||
			(chessEngine.turn() === 'w' && piece.search(/^b/) !== -1) ||
			(chessEngine.turn() === 'b' && piece.search(/^w/) !== -1) ||
			chessEngine.turn() !== playerColor?.[0].toLowerCase()
		) {
			return false;
		}

		return true;
	};

	const playAgain = (gameId?: string) => {
		if (socket && gameId) emitPlayAgain(socket, gameId);
	};

	const cancelPlayAgain = (gameId?: string) => {
		if (socket && gameId) emitCancelPlayAgain(socket, gameId);
	};

	const resetGame = (gameId?: string) => {
		if (socket && gameId) {
			emitResetGame(socket, gameId);
			resetBoard();
		}
	};

	const handleShowPlayAnotherGameModal = (showModal: boolean) => {
		setShowPlayAnotherGameModal(showModal);
	};

	const handleShowPlayAgainModal = (showModal: boolean) => {
		setShowPlayAgainModal(showModal);
	};

	const handleResetGame = () => {
		resetGame(game?.id);
		setShowPlayAnotherGameModal(false);
	};

	const handleLeaveGame = () => {
		if (socket && game) {
			emitLeaveGame(socket, game.id);
			socketDispatch({ type: 'remove_game', payload: game.id });
		}

		socketDispatch({ type: 'update_page', payload: PAGE_LOBBY });
		socketDispatch({ type: 'update_game', payload: null });
	};

	const handlePlayAgain = () => {
		playAgain(game?.id);
		setShowPlayAgainModal(true);
	};

	return (
		<div className="board-container">
			<GameAlerts
				cancelPlayAgain={cancelPlayAgain}
				inCheck={chessEngine?.isCheck()}
				inDraw={chessEngine?.isDraw()}
				isGameOver={chessEngine?.isGameOver()}
				isShowPlayAgainModal={isShowPlayAgainModal}
				isShowPlayAnotherGameModal={isShowPlayAnotherGameModal}
				playerTurn={chessEngine?.turn()}
				onPlayAgain={handlePlayAgain}
				onResetGame={handleResetGame}
				onShowPlayAgainModal={handleShowPlayAgainModal}
				onShowPlayAnotherGameModal={handleShowPlayAnotherGameModal}
			/>
			<div className="chess-board">{playerColor && <Chessboard position={fen} onPieceDrop={handlePieceDrop} isDraggablePiece={handleIsPieceDraggable} boardOrientation={playerColor} />}</div>
			{page !== PAGE_LOBBY && (
				<div className="board-buttons">
					<Button onClick={handlePlayAgain} type="primary">
						Reset
					</Button>
					<Button onClick={handleLeaveGame} type="primary">
						Leave
					</Button>
				</div>
			)}
		</div>
	);
};

export default Board;
