import { GameState, MoveDirection, PlayerId, BotDifficulty } from './types';
import { getValidMoves, executeMove, cloneGameState } from './rules';

export interface BotDecision {
  pitIndex: number;
  direction: MoveDirection;
  expectedScoreGain: number;
}

/**
 * Static evaluation of game state from perspective of a given player.
 */
function evaluateState(state: GameState, player: PlayerId): number {
  const opponent: PlayerId = player === 1 ? 2 : 1;
  const scoreDiff = state.scores[player] - state.scores[opponent];

  if (state.gameOver) {
    if (state.winner === player) return 1000 + scoreDiff;
    if (state.winner === opponent) return -1000 + scoreDiff;
    return scoreDiff;
  }

  // Count stones on player's side vs opponent side
  let myStones = 0;
  let oppStones = 0;
  for (let i = 1; i <= 5; i++) myStones += state.board[i].smallStones;
  for (let i = 7; i <= 11; i++) oppStones += state.board[i].smallStones;

  const stoneSideAdvantage = player === 1 ? (myStones - oppStones) : (oppStones - myStones);

  return (scoreDiff * 10) + stoneSideAdvantage;
}

/**
 * Minimax algorithm with Alpha-Beta pruning for tactical decision making.
 */
function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  botPlayer: PlayerId
): number {
  if (depth === 0 || state.gameOver) {
    return evaluateState(state, botPlayer);
  }

  const currentPlayer = maximizingPlayer ? botPlayer : (botPlayer === 1 ? 2 : 1);
  const validMoves = getValidMoves(state, currentPlayer);

  if (validMoves.length === 0) {
    return evaluateState(state, botPlayer);
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of validMoves) {
      for (const dir of move.directions) {
        try {
          const moveRes = executeMove(state, move.pitIndex, dir);
          const evaluation = minimax(moveRes.finalState, depth - 1, alpha, beta, false, botPlayer);
          maxEval = Math.max(maxEval, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break; // Beta cutoff
        } catch {
          continue;
        }
      }
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of validMoves) {
      for (const dir of move.directions) {
        try {
          const moveRes = executeMove(state, move.pitIndex, dir);
          const evaluation = minimax(moveRes.finalState, depth - 1, alpha, beta, true, botPlayer);
          minEval = Math.min(minEval, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break; // Alpha cutoff
        } catch {
          continue;
        }
      }
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Compute the optimal or chosen move for Bot AI.
 */
export function getBotMove(
  state: GameState,
  botPlayer: PlayerId = 2,
  difficulty: BotDifficulty = 'strategic'
): BotDecision | null {
  const validMoves = getValidMoves(state, botPlayer);
  if (validMoves.length === 0) return null;

  // Easy mode: 40% random move, 60% greedy highest immediate harvest
  if (difficulty === 'easy') {
    if (Math.random() < 0.35) {
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      const randomDir = randomMove.directions[Math.floor(Math.random() * randomMove.directions.length)];
      return {
        pitIndex: randomMove.pitIndex,
        direction: randomDir,
        expectedScoreGain: 0
      };
    }
  }

  // Strategic mode (or greedy fallback): Minimax search with depth 3
  const searchDepth = difficulty === 'strategic' ? 3 : 1;
  let bestScore = -Infinity;
  let bestCandidates: BotDecision[] = [];

  for (const move of validMoves) {
    for (const dir of move.directions) {
      try {
        const moveRes = executeMove(state, move.pitIndex, dir);
        let evalScore = 0;

        if (searchDepth > 1 && !moveRes.finalState.gameOver) {
          evalScore = minimax(moveRes.finalState, searchDepth - 1, -Infinity, Infinity, false, botPlayer);
        } else {
          evalScore = evaluateState(moveRes.finalState, botPlayer);
        }

        // Slight bonus for moves that immediately harvest stones
        evalScore += moveRes.harvestedTotal * 1.5;

        if (evalScore > bestScore) {
          bestScore = evalScore;
          bestCandidates = [{
            pitIndex: move.pitIndex,
            direction: dir,
            expectedScoreGain: moveRes.harvestedTotal
          }];
        } else if (evalScore === bestScore) {
          bestCandidates.push({
            pitIndex: move.pitIndex,
            direction: dir,
            expectedScoreGain: moveRes.harvestedTotal
          });
        }
      } catch {
        continue;
      }
    }
  }

  if (bestCandidates.length > 0) {
    // Pick randomly among top tied candidates for natural gameplay
    return bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
  }

  // Fallback first valid move
  return {
    pitIndex: validMoves[0].pitIndex,
    direction: validMoves[0].directions[0],
    expectedScoreGain: 0
  };
}
