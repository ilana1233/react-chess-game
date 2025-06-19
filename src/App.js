import React,{ useState} from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './App.css';


function App() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [mode, setMode] = useState('cpu'); // 'cpu' or 'friend'
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedPieces,setCapturedPieces] = useState({ w: [], b: []});

  function safeGameMutate(modify) {
    const newGame = new Chess(game.fen());
    modify(newGame);
    setGame(newGame);
    setFen(newGame.fen());

    // בדיקת סיום
    if (newGame.isGameOver()) {
      if (newGame.isCheckmate()) {
        setGameOverMessage(newGame.turn() === 'w' ? 'שחור ניצח!' : 'לבן ניצח!');
      } else if (newGame.isDraw()) {
        setGameOverMessage('תיקו!');
      } else {
        setGameOverMessage('המשחק הסתיים');
      }
    }
  };

  const pieceToName = (piece) => {
    const map = {
      p: 'Pawn', r: 'Rook',n:'knight',b:'Bishop', q:'Queen', k:'King',
    };
    return map[piece] || '?';
  };
  

  function makeRandomMove() {
    safeGameMutate((g) => {
      const moves = g.moves();
      if (moves.length === 0) return;
      const move = moves[Math.floor(Math.random() * moves.length)];
      g.move(move);
    });
  }

  function onDrop(sourceSquare, targetSquare) {
    let moveMade = false;

    safeGameMutate((g) => {
      const move = g.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move) {
        moveMade = true;
        //בדיקת היסטוריה 
        setMoveHistory((prev) =>[...prev, move.san]);

      if (move.capturedPieces) {
        const takenColor = game.turn() === 'w' ? 'b': 'w';
            setCapturedPieces((prev) => ({
              ...prev,
              [takenColor]:
            [...prev[takenColor],
          move.capturedPieces]
            }));
      }
        if (mode === 'cpu' && !g.isGameOver()) {
          safeGameMutate((compGame) => {
            const moves = compGame.moves();
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            const compMove = compGame.move(randomMove);

            if (compMove) {
              setMoveHistory((prev) => [...prev,compMove.san]);
            if(compMove.capturedPieces) {
              const takenColor = compGame.turn() === 'w' ? 'b' : 'w';

              setCapturedPieces((prev) => ({...prev, [takenColor]:
                [...prev[takenColor],
                compMove.capturedPieces],
              }));
              }
            }
          });
          setTimeout(makeRandomMove, 300);
        }
      }
    });

    return moveMade;
  };

  const restartGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setGameOverMessage('')
  };
  const currentTurn = game.turn() === 'b' ? 'לבן': 'שחור';

  return (
    <div className='body'>
    <div className='container'>
        <h1>משחק שחמט</h1>

        <div className='game-mode'>
          <label>
            <input
            type='radio'
            value="cpu"
            checked={mode === 'cpu'}
            onChange={() => setMode('cpu')}
            />
             נגד מחשב
          </label>

          <label>
            <input
            type='radio'
            value="friend"
            checked={mode === 'friend'}
            onChange={() => setMode('friend')}
            />
            נגד חבר
          </label>
        </div>

      <div className='turn-indicator'>תור נוכחי:
        <strong>{currentTurn}</strong>
      </div> 
      <div className='main-content'>
        <div className='board-wrapper'>
        <Chessboard position={fen} 
        onPieceDrop={onDrop}

        boardWidth={window.innerWidth < 600 ?
          window.innerWidth - 30 : 500}
         />
         
        <button onClick={restartGame}>
          אתחול משחק
        </button>

          {gameOverMessage && (
            <div className='game-over-message'>
              <h2>{gameOverMessage}</h2>
              <button onClick={restartGame}>משחק חדש</button>
               </div>
          )}   
      </div>
    <div className='info-section'>
      <div className='moves-list'>
        <h3>מהלכים שבוצעו:</h3>
        <ol>
          {moveHistory.map((move, index) => (
            <li key={index}>{move}</li>
          ))}
          </ol>
        </div>

        <div className='capture-section'>
          <h3>כלים שנאכלו:</h3>
          <div><strong>לבן אכל:</strong>
          {capturedPieces.w.map((p,i) => <span key={i}>{pieceToName(p)}
          </span>)}</div>

           <h3>כלים שנאכלו:</h3>
          <div><strong>שחור אכל:</strong>
          {capturedPieces.b.map((p,i) => <span key={i}>{pieceToName(p)}
          </span>)}</div>
            </div>
          </div>

<div className='instructions'>
  <h2>הוראות בסיסיות</h2>
  <ul>
    <li>חיילים זזים קדימה רק צעד אחד(בהתחלה אפשר שניים)</li>
    <li>סוסים זזים שניים קדימה ואחד הצידה</li>
    <li>רצים זזים באלכסונים</li>
    <li>צריחים ישר בלבד-מאוזן או מאונך</li>
    <li>המלכה זזה לכל כיוון</li>
    <li>המלך זז צעד לכל כיוון</li>

    <li>מטרת המשחק: לעשות "מט" למלך היריב -
      לשים אותו תחת איום מבלי שיש לו דרך לברוח</li>
  </ul>
      </div>
     </div>
    </div>
  </div>
  );
}

export default App;
