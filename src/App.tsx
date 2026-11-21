import React, { useState, useEffect, useCallback } from 'react';
import { GameState, MoveDirection, AnimationStep, BotDifficulty, MoveResult } from './game/types';
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
  const [gameMode, setGameMode] = useState<'bot' | 'local'>('bot');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('strategic');

  // Player State
  const [player1Name, setPlayer1Name] = useState('Người chơi 1');
  const [player2Name, setPlayer2Name] = useState('Người chơi 2');

  // Game Core State
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [displayBoard, setDisplayBoard] = useState(gameState.board);
  const [selectedPit, setSelectedPit] = useState<number | null>(null);

  // Animation State
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeAnimationStep, setActiveAnimationStep] = useState<AnimationStep | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Play animated sequence of steps
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

  // Trigger bot turn if needed
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

  // User Move Action
  const handleMove = (pitIndex: number, direction: MoveDirection) => {
    if (isAnimating || gameState.gameOver) return;

    try {
      const moveRes = executeMove(gameState, pitIndex, direction);
      playAnimationSteps(moveRes.steps, moveRes.finalState);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Nước đi không hợp lệ';
      alert(msg);
    }
  };

  // Navigation Handlers
  const handleStartBot = (name: string, diff: BotDifficulty) => {
    setPlayer1Name(name || 'Bạn');
    setPlayer2Name('Thần Sỏi AI');
    setBotDifficulty(diff);
    setGameMode('bot');
    const fresh = createInitialGameState();
    setGameState(fresh);
    setDisplayBoard(fresh.board);
    setInGame(true);
  };

  const handleStartLocal2P = (p1: string, p2: string) => {
    setPlayer1Name(p1 || 'Người chơi 1');
    setPlayer2Name(p2 || 'Người chơi 2');
    setGameMode('local');
    const fresh = createInitialGameState();
    setGameState(fresh);
    setDisplayBoard(fresh.board);
    setInGame(true);
  };

  const handleRestartGame = () => {
    const fresh = createInitialGameState();
    setGameState(fresh);
    setDisplayBoard(fresh.board);
    setSelectedPit(null);
  };

  const handleBackToLobby = () => {
    setInGame(false);
    setSelectedPit(null);
    setIsAnimating(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-obsidian-950 text-slate-100 selection:bg-emerald-500 selection:text-obsidian-950">
      {/* Top Bar Header */}
      <Header
        gameMode={gameMode}
        onBackToLobby={handleBackToLobby}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-2 md:p-6">
        {!inGame ? (
          <Lobby
            onStartBot={handleStartBot}
            onStartLocal2P={handleStartLocal2P}
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
            />

            {/* Tactical Ô Ăn Quan Board */}
            <Board
              board={displayBoard}
              currentTurn={gameState.currentTurn}
              isInteractive={!isAnimating && !gameState.gameOver && (gameMode === 'local' || gameState.currentTurn === 1)}
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
        onRestart={handleRestartGame}
        onBackToLobby={handleBackToLobby}
      />
    </div>
  );
};
