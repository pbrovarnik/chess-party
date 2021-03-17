import React, { useEffect, useRef, useState } from 'react';
import ChessBoard from 'chessboardjsx';
import Chess from 'chess.js';

import GameAlerts from '../game-alerts/game-alerts.component';

import './index.css';

const Board = ({ playerColor, game, movePiece, socket }) => {
	const [fen, setFen] = useState('start');
	const engine = useRef(null);

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
		engine.current = new Chess();
		return () => {
			if (engine.current) engine.current = null;
		};
	}, []);

	// Get player move
	useEffect(() => {
		if (!game.move) return;
		engine.current.move(game.move);
		setFen(engine.current.fen());
	}, [game]);

	// Reset chess engine and board
	useEffect(() => {
		if (game.resetGame) {
			engine.current.clear();
			engine.current.reset();
			setFen('start');
		}
	}, [game]);

	const handleDrop = ({ sourceSquare, targetSquare }) => {
		let move = engine.current.move({
			from: sourceSquare,
			to: targetSquare,
			promotion: 'q',
		});

		if (!move) return;
		movePiece(move);
		setFen(engine.current.fen());
	};

	const handleAllowDrag = ({ piece }) => {
		if (
			engine.current.game_over() === true ||
			(engine.current.turn() === 'w' && piece.search(/^b/) !== -1) ||
			(engine.current.turn() === 'b' && piece.search(/^w/) !== -1) ||
			engine.current.turn() !== playerColor[0].toLowerCase()
		) {
			return false;
		}
		return true;
	};

	return (
		<>
			<GameAlerts
				playerColor={playerColor}
				game={game}
				isGameOver={engine.current?.game_over()}
				inDraw={engine.current?.in_draw()}
				playerTurn={engine.current?.turn()}
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
