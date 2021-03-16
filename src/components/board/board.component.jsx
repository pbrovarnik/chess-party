import React, { useEffect, useRef, useState } from 'react';
import ChessBoard from 'chessboardjsx';
import Chess from 'chess.js';

const Board = ({ playerColor, game, movePiece }) => {
	const [fen, setFen] = useState('start');
	const engine = useRef(null);

	// Get player move
	useEffect(() => {
		if (!game.move) return;
		engine.current.move(game.move);
		setFen(engine.current.fen());
	}, [game]);

	// Initialize Chess engine
	useEffect(() => {
		engine.current = new Chess();
		return () => {
			if (engine.current) engine.current = null;
		};
	}, []);

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

	const handleResetGame = () => {
		engine.current.clear();
		engine.current.reset();
		setFen('start');
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
		<div className='board'>
			{engine.current?.game_over() && (
				<div>
					<h1>Game Over!!</h1>
					<button onClick={handleResetGame}>Play again</button>
				</div>
			)}
			{playerColor && (
				<ChessBoard
					position={fen}
					onDrop={handleDrop}
					orientation={playerColor}
					allowDrag={handleAllowDrag}
				/>
			)}
		</div>
	);
};

export default Board;
