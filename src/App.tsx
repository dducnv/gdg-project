import React, { useState, useEffect, useCallback } from 'react';
import { GameState, MoveDirection, AnimationStep, BotDifficulty, MoveResult } from './game/types';
import { createInitialGameState, executeMove } from './game/rules';
import { getBotMove } from './game/botAI';
import { soundEngine } from './audio/soundEngine';
import { getStoredGeminiKey, getGeminiMove } from './services/geminiService';
import { Header } from './components/Header';
import { ScoreBoard } from './components/ScoreBoard';
import { Board } from './components/Board';
import { GameLogs } from './components/GameLogs';
import { Lobby } from './components/Lobby';
import { RulesModal } from './components/RulesModal';
import { GameOverModal } from './components/GameOverModal';
import { GeminiKeyModal } from './components/GeminiKeyModal';

export const App: React.FC = () => {
  // Navigation & Mode
  const [inGame, setInGame] = useState(false);
  const [gameMode, setGameMode] = useState<'bot' | 'local'>('bot');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('strategic');

  // Gemini API Key & Commentary State
  const [geminiKey, setGeminiKey] = useState<string>(getStoredGeminiKey());
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [geminiCommentary, setGeminiCommentary] = useState<string>('');

  // Player State
  const [player1Name, setPlayer1Name] = useState('Người chơi 1');
  const [player2Name, setPlayer2Name] = useState('Gemini Thần Sỏi');

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

  // Trigger bot / Gemini turn
  useEffect(() => {
    if (inGame && gameMode === 'bot' && gameState.currentTurn === 2 && !gameState.gameOver && !isAnimating) {
      let isMounted = true;

      const runAiTurn = async () => {
        try {
          if (geminiKey && geminiKey.trim()) {
            // Call Gemini 2.5 Flash API
            const geminiRes = await getGeminiMove(gameState, 2, geminiKey);
            if (!isMounted) return;
            setGeminiCommentary(geminiRes.commentary);

            const moveRes: MoveResult = executeMove(gameState, geminiRes.pitIndex, geminiRes.direction);
            playAnimationSteps(moveRes.steps, moveRes.finalState);
          } else {
            // Fallback to Minimax
            const botMove = getBotMove(gameState, 2, botDifficulty);
            if (!isMounted) return;
            if (botMove) {
              setGeminiCommentary('Tính toán thế cờ với thuật toán Minimax.');
              const moveRes: MoveResult = executeMove(gameState, botMove.pitIndex, botMove.direction);
              playAnimationSteps(moveRes.steps, moveRes.finalState);
            }
          }
        } catch (e) {
          console.error('Error during AI move execution:', e);
        }
      };

      const timer = setTimeout(runAiTurn, 650);

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [inGame, gameMode, gameState, isAnimating, botDifficulty, geminiKey, playAnimationSteps]);

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
    setPlayer2Name(geminiKey ? 'Gemini Thần Sỏi' : 'Bot Minimax');
    setBotDifficulty(diff);
    setGeminiCommentary(geminiKey ? 'Chào bạn! Ta đã sẵn sàng phân định tài cao thấp trên bàn cờ.' : '');
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
    setGeminiCommentary('');
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
    setGeminiCommentary(geminiKey ? 'Ván mới bắt đầu! Hãy đi nước đầu tiên.' : '');
  };

  const handleBackToLobby = () => {
    setInGame(false);
    setSelectedPit(null);
    setIsAnimating(false);
    setGeminiCommentary('');
  };

  const handleKeySaved = (key: string) => {
    setGeminiKey(key);
    if (gameMode === 'bot') {
      setPlayer2Name(key ? 'Gemini Thần Sỏi' : 'Bot Minimax');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-obsidian-950 text-slate-100 selection:bg-emerald-500 selection:text-obsidian-950">
      {/* Top Bar Header */}
      <Header
        gameMode={gameMode}
        hasGeminiKey={Boolean(geminiKey && geminiKey.trim())}
        onOpenGeminiModal={() => setIsGeminiModalOpen(true)}
        onBackToLobby={handleBackToLobby}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-2 md:p-6">
        {!inGame ? (
          <Lobby
            hasGeminiKey={Boolean(geminiKey && geminiKey.trim())}
            onOpenGeminiModal={() => setIsGeminiModalOpen(true)}
            onStartBot={handleStartBot}
            onStartLocal2P={handleStartLocal2P}
          />
        ) : (
          <div className="w-full max-w-5xl flex flex-col items-center gap-4">
            {/* Score & Turn Bar with Gemini Commentary */}
            <ScoreBoard
              currentTurn={gameState.currentTurn}
              scores={gameState.scores}
              player1Name={player1Name}
              player2Name={player2Name}
              isBot={gameMode === 'bot'}
              hasGeminiKey={Boolean(geminiKey && geminiKey.trim())}
              round={gameState.round}
              geminiCommentary={geminiCommentary}
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

      {/* Gemini Key Modal */}
      <GeminiKeyModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        onKeySaved={handleKeySaved}
      />

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
