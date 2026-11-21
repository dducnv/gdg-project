import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, MoveDirection, PlayerId, AnimationStep, BotDifficulty, MoveResult } from './game/types';
import { createInitialGameState, executeMove } from './game/rules';
import { getBotMove } from './game/botAI';
import { soundEngine } from './audio/soundEngine';
import { Header } from './components/Header';
import { ScoreBoard } from './components/ScoreBoard';
import { Board } from './components/Board';
import { GameLogs } from './components/GameLogs';
import { Lobby } from './components/Lobby';
import { RulesModal } from './components/RulesModal';
import { GameOverModal } from './components/GameOverModal';

export const App: React.FC = () => {
  // Navigation & Mode
  const [inGame, setInGame] = useState(false);
  const [gameMode, setGameMode] = useState<'bot' | 'online' | 'local'>('bot');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('strategic');

  // Player & Room State
  const [player1Name, setPlayer1Name] = useState('Người chơi 1');
  const [player2Name, setPlayer2Name] = useState('Người chơi 2');
  const [localPlayerId, setLocalPlayerId] = useState<PlayerId | 'spectator'>(1);
  const [roomCode, setRoomCode] = useState('');
  const [lanUrl, setLanUrl] = useState('');
  const [serverOnline, setServerOnline] = useState(false);
  const [lanIp, setLanIp] = useState('');

  // Game Core State
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [displayBoard, setDisplayBoard] = useState(gameState.board);
  const [selectedPit, setSelectedPit] = useState<number | null>(null);

  // Animation State
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeAnimationStep, setActiveAnimationStep] = useState<AnimationStep | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);

  // 1. Initial Connection & URL Param Check
  useEffect(() => {
    // Check URL parameters for ?room=XXXX
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      setRoomCode(roomParam.toUpperCase());
    }

    // Connect to WebSocket Server
    const wsHost = window.location.hostname || 'localhost';
    const wsPort = 3001;
    const wsUrl = `ws://${wsHost}:${wsPort}`;

    let socket: WebSocket;
    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setServerOnline(true);
        // Ping
        socket.send(JSON.stringify({ type: 'ping' }));
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleServerMessage(msg);
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      socket.onclose = () => {
        setServerOnline(false);
      };

      socket.onerror = () => {
        setServerOnline(false);
      };
    } catch {
      setServerOnline(false);
    }

    // Check status API for LAN IP
    fetch(`http://${wsHost}:${wsPort}/api/status`)
      .then(res => res.json())
      .then(data => {
        if (data.lanIp) setLanIp(data.lanIp);
      })
      .catch(() => {});

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // 2. Play animated sequence of steps
  const playAnimationSteps = useCallback((steps: AnimationStep[], finalState: GameState, onComplete?: () => void) => {
    setIsAnimating(true);
    let stepIndex = 0;
    let eatStreak = 0;

    const interval = setInterval(() => {
      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setActiveAnimationStep(null);
        setDisplayBoard(finalState.board);
        setGameState(finalState);
        setIsAnimating(false);
        if (onComplete) onComplete();
        return;
      }

      const step = steps[stepIndex];
      setActiveAnimationStep(step);
      setDisplayBoard(step.boardState);

      // Play audio based on step
      if (step.type === 'pickup' || step.type === 'continue_pickup') {
        soundEngine.playPickup();
      } else if (step.type === 'drop') {
        soundEngine.playPebbleDrop(stepIndex);
      } else if (step.type === 'eat') {
        eatStreak += 1;
        soundEngine.playHarvest(step.isQuan || false, eatStreak);
      } else if (step.type === 'pause_quan' || step.type === 'pause_empty') {
        soundEngine.playThud();
      }

      stepIndex++;
    }, 180); // 180ms per drop per PRD 2.3
  }, []);

  // 3. Handle Server Messages
  const handleServerMessage = useCallback((msg: any) => {
    switch (msg.type) {
      case 'room_created': {
        setRoomCode(msg.roomCode);
        setLocalPlayerId(1);
        setLanUrl(msg.lanInviteUrl);
        setGameState(msg.state);
        setDisplayBoard(msg.state.board);
        setInGame(true);
        setGameMode('online');
        break;
      }
      case 'room_joined': {
        setRoomCode(msg.roomCode);
        setLocalPlayerId(msg.playerId);
        setGameState(msg.state);
        setDisplayBoard(msg.state.board);
        if (msg.opponentName) setPlayer1Name(msg.opponentName);
        setInGame(true);
        setGameMode('online');
        break;
      }
      case 'opponent_joined': {
        setPlayer2Name(msg.opponentName);
        break;
      }
      case 'move_executed': {
        playAnimationSteps(msg.steps, msg.finalState);
        break;
      }
      case 'game_restarted': {
        setGameState(msg.state);
        setDisplayBoard(msg.state.board);
        setSelectedPit(null);
        break;
      }
      case 'opponent_left': {
        alert(msg.message || 'Đối thủ đã rời khỏi phòng');
        break;
      }
      case 'error': {
        alert(msg.message);
        break;
      }
    }
  }, [playAnimationSteps]);

  // 4. Trigger bot turn if needed
  useEffect(() => {
    if (inGame && gameMode === 'bot' && gameState.currentTurn === 2 && !gameState.gameOver && !isAnimating) {
      const timer = setTimeout(() => {
        const botMove = getBotMove(gameState, 2, botDifficulty);
        if (botMove) {
          try {
            const moveRes: MoveResult = executeMove(gameState, botMove.pitIndex, botMove.direction);
            playAnimationSteps(moveRes.steps, moveRes.finalState);
          } catch (e) {
            console.error('Error during bot move execution:', e);
          }
        }
      }, 650);

      return () => clearTimeout(timer);
    }
  }, [inGame, gameMode, gameState, isAnimating, botDifficulty, playAnimationSteps]);

  // 5. User Move Action
  const handleMove = (pitIndex: number, direction: MoveDirection) => {
    if (isAnimating || gameState.gameOver) return;

    if (gameMode === 'online') {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'make_move',
          pitIndex,
          direction
        }));
      }
    } else {
      // Local or Bot Mode
      try {
        const moveRes = executeMove(gameState, pitIndex, direction);
        playAnimationSteps(moveRes.steps, moveRes.finalState);
      } catch (e: any) {
        alert(e.message || 'Nước đi không hợp lệ');
      }
    }
  };

  // 6. Navigation Handlers
  const handleStartBot = (name: string, diff: BotDifficulty) => {
    setPlayer1Name(name || 'Bạn');
    setPlayer2Name('Thần Sỏi AI');
    setBotDifficulty(diff);
    setLocalPlayerId(1);
    setGameMode('bot');
    const fresh = createInitialGameState();
    setGameState(fresh);
    setDisplayBoard(fresh.board);
    setInGame(true);
  };

  const handleStartLocal2P = (p1: string, p2: string) => {
    setPlayer1Name(p1 || 'Người chơi 1');
    setPlayer2Name(p2 || 'Người chơi 2');
    setLocalPlayerId(1);
    setGameMode('local');
    const fresh = createInitialGameState();
    setGameState(fresh);
    setDisplayBoard(fresh.board);
    setInGame(true);
  };

  const handleHostOnline = (name: string) => {
    setPlayer1Name(name || 'Người chơi 1');
    setPlayer2Name('Đang chờ đối thủ...');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'create_room',
        name
      }));
    } else {
      alert('Không kết nối được Local WebSocket Server. Bạn có thể chơi chế độ Bot hoặc 2 Người Cùng Máy!');
    }
  };

  const handleJoinOnline = (code: string, name: string) => {
    setPlayer2Name(name || 'Người chơi 2');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'join_room',
        roomCode: code,
        name
      }));
    } else {
      alert('Không kết nối được Local WebSocket Server.');
    }
  };

  const handleRestartGame = () => {
    if (gameMode === 'online') {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'restart_game' }));
      }
    } else {
      const fresh = createInitialGameState();
      setGameState(fresh);
      setDisplayBoard(fresh.board);
      setSelectedPit(null);
    }
  };

  const handleBackToLobby = () => {
    setInGame(false);
    setSelectedPit(null);
    setIsAnimating(false);
    // Clear URL param if present
    if (window.history.pushState) {
      window.history.pushState({}, document.title, window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-obsidian-950 text-slate-100 selection:bg-emerald-500 selection:text-obsidian-950">
      {/* Top Bar Header */}
      <Header
        roomCode={roomCode}
        lanUrl={lanUrl}
        gameMode={gameMode}
        onBackToLobby={handleBackToLobby}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-2 md:p-6">
        {!inGame ? (
          <Lobby
            onHostOnline={handleHostOnline}
            onJoinOnline={handleJoinOnline}
            onStartBot={handleStartBot}
            onStartLocal2P={handleStartLocal2P}
            serverOnline={serverOnline}
            lanIp={lanIp}
            initialRoomCode={roomCode}
          />
        ) : (
          <div className="w-full max-w-5xl flex flex-col items-center gap-4">
            {/* Score & Turn Bar */}
            <ScoreBoard
              currentTurn={gameState.currentTurn}
              scores={gameState.scores}
              player1Name={player1Name}
              player2Name={player2Name}
              isBot={gameMode === 'bot'}
              round={gameState.round}
              localPlayerId={gameMode === 'online' ? localPlayerId : undefined}
            />

            {/* Tactical Ô Ăn Quan Board */}
            <Board
              board={displayBoard}
              currentTurn={gameState.currentTurn}
              localPlayerId={gameMode === 'online' ? localPlayerId : undefined}
              isInteractive={!isAnimating && !gameState.gameOver}
              onMove={handleMove}
              activeAnimationStep={activeAnimationStep}
              selectedPit={selectedPit}
              onSelectPit={setSelectedPit}
            />

            {/* Tactical Game Feed */}
            <div className="w-full max-w-4xl px-4">
              <GameLogs logs={gameState.history} />
            </div>
          </div>
        )}
      </main>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={Boolean(inGame && gameState.gameOver && !isAnimating)}
        winner={gameState.winner}
        scores={gameState.scores}
        player1Name={player1Name}
        player2Name={player2Name}
        localPlayerId={gameMode === 'online' ? localPlayerId : undefined}
        onRestart={handleRestartGame}
        onBackToLobby={handleBackToLobby}
      />
    </div>
  );
};
