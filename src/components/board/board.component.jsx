import React, { useEffect, useState } from 'react';
import ChessBoard from 'chessboardjsx';
import Chess from 'chess.js';

import GameAlerts from '../game-alerts/game-alerts.component';

import './index.css';

const Board = ({ setPage, socket, playerColor, game, movePiece }) => {
	const [fen, setFen] = useState('start');
	const [engine, setEngine] = useState(new Chess());

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
		setEngine(new Chess());

		return () => {
			if (engine) setEngine(null);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Get player move
	useEffect(() => {
		if (!game.move) return;
		engine.move(game.move);
		setFen(engine.fen());
	}, [game, engine]);

	// Reset chess engine and board
	useEffect(() => {
		if (game.resetGame) {
			engine.clear();
			engine.reset();
			setFen('start');
		}
	}, [game, engine]);

	const handleDrop = ({ sourceSquare, targetSquare }) => {
		let move = engine.move({
			from: sourceSquare,
			to: targetSquare,
			promotion: 'q',
		});

		if (!move) return;
		movePiece(move);
		setFen(engine.fen());
	};

	const handleAllowDrag = ({ piece }) => {
		if (
			engine.game_over() === true ||
			(engine.turn() === 'w' && piece.search(/^b/) !== -1) ||
			(engine.turn() === 'b' && piece.search(/^w/) !== -1) ||
			engine.turn() !== playerColor[0].toLowerCase()
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
				isGameOver={engine?.game_over()}
				inDraw={engine?.in_draw()}
				playerTurn={engine?.turn()}
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
