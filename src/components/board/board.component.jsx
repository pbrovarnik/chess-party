import React, { useEffect, useState } from 'react';
import ChessBoard from 'chessboardjsx';
import Chess from 'chess.js';

import { emitMovePiece } from '../../socket-connections/sockets';

import GameAlerts from '../game-alerts/game-alerts.component';

import './style.css';

const Board = ({ setPage, socket, playerColor, game }) => {
	const [fen, setFen] = useState('start');
	const [chessEngine, setChessEngine] = useState(null);

	const playAgain = (gameId) => {
		socket.emit('play-again', gameId);
	};

	const cancelPlayAgain = (gameId) => {
		socket.emit('cancel-play-again', gameId);
	};

	const resetGame = (gameId) => {
		socket.emit('reset-game', gameId);
	};

	// Initialize Chess engine
	useEffect(() => {
		setChessEngine(new Chess());

		return () => {
			if (chessEngine) setChessEngine(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Get player move
	useEffect(() => {
		if (!game.move) return;
		chessEngine.move(game.move);
		setFen(chessEngine.fen());
	}, [game, chessEngine]);

	// Reset chess chessEngine and board
	useEffect(() => {
		if (game.resetGame) {
			chessEngine.clear();
			chessEngine.reset();
			setFen('start');
		}
	}, [game, chessEngine]);

	const handleDrop = ({ sourceSquare, targetSquare }) => {
		let move = chessEngine.move({
			from: sourceSquare,
			to: targetSquare,
			promotion: 'q',
		});

		if (!move) return;
		emitMovePiece(move);
		setFen(chessEngine.fen());
	};

	const handleAllowDrag = ({ piece }) => {
		if (
			chessEngine.game_over() === true ||
			(chessEngine.turn() === 'w' && piece.search(/^b/) !== -1) ||
			(chessEngine.turn() === 'b' && piece.search(/^w/) !== -1) ||
			chessEngine.turn() !== playerColor[0].toLowerCase()
		) {
			return false;
		}
		return true;
	};

	return (
		<>
			<GameAlerts
				setPage={setPage}
				playerColor={playerColor}
				game={game}
				isGameOver={chessEngine?.game_over()}
				inDraw={chessEngine?.in_draw()}
				playerTurn={chessEngine?.turn()}
				playAgain={playAgain}
				resetGame={resetGame}
				cancelPlayAgain={cancelPlayAgain}
			/>
			<div className='board-container'>
				{playerColor && (
					<ChessBoard
						position={fen}
						onDrop={handleDrop}
						orientation={playerColor}
						allowDrag={handleAllowDrag}
					/>
				)}
			</div>
		</>
	);
};

export default Board;
