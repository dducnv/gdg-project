import { GameState, PitState, PlayerId, MoveDirection, AnimationStep, MoveResult, GameLogEntry } from './types';

export const P1_PITS = [1, 2, 3, 4, 5] as const;
export const P2_PITS = [7, 8, 9, 10, 11] as const;
export const QUAN_PITS = [0, 6] as const;

export function createInitialBoard(): PitState[] {
  const board: PitState[] = [];
  for (let i = 0; i < 12; i++) {
    const isQuan = i === 0 || i === 6;
    let owner: PlayerId | null = null;
    if (i >= 1 && i <= 5) owner = 1;
    if (i >= 7 && i <= 11) owner = 2;

    board.push({
      index: i,
      smallStones: isQuan ? 0 : 5,
      hasBigQuan: isQuan,
      isQuan,
      owner
    });
  }
  return board;
}

export function createInitialGameState(): GameState {
  return {
    board: createInitialBoard(),
    currentTurn: 1,
    scores: { 1: 0, 2: 0 },
    gameOver: false,
    winner: null,
    round: 1,
    history: []
  };
}

export function cloneBoard(board: PitState[]): PitState[] {
  return board.map(p => ({ ...p }));
}

export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    board: cloneBoard(state.board),
    scores: { ...state.scores },
    history: [...state.history]
  };
}

export function isPlayerPit(player: PlayerId, pitIndex: number): boolean {
  if (player === 1) return pitIndex >= 1 && pitIndex <= 5;
  if (player === 2) return pitIndex >= 7 && pitIndex <= 11;
  return false;
}

export function getPlayerPits(player: PlayerId): number[] {
  return player === 1 ? [...P1_PITS] : [...P2_PITS];
}

export function isRowEmpty(board: PitState[], player: PlayerId): boolean {
  const pits = getPlayerPits(player);
  return pits.every(idx => board[idx].smallStones === 0);
}

export function isBothQuanEmpty(board: PitState[]): boolean {
  const q0 = board[0];
  const q6 = board[6];
  return !q0.hasBigQuan && q0.smallStones === 0 && !q6.hasBigQuan && q6.smallStones === 0;
}

export function getValidMoves(state: GameState, player: PlayerId = state.currentTurn): { pitIndex: number; directions: MoveDirection[] }[] {
  if (state.gameOver) return [];
  const validPits: { pitIndex: number; directions: MoveDirection[] }[] = [];
  const pits = getPlayerPits(player);

  for (const pitIdx of pits) {
    if (state.board[pitIdx].smallStones > 0) {
      validPits.push({
        pitIndex: pitIdx,
        directions: ['clockwise', 'counterclockwise']
      });
    }
  }

  return validPits;
}

export function getPitValue(pit: PitState): number {
  return pit.smallStones + (pit.hasBigQuan ? 10 : 0);
}

export function isPitEmpty(pit: PitState): boolean {
  return pit.smallStones === 0 && !pit.hasBigQuan;
}

/**
 * Perform automatic refill ("vét sỏi / rải quân") if the current player's 5 pits are all empty.
 * Returns steps and updated state.
 */
export function handleEmptyRowRefill(state: GameState, player: PlayerId): { steps: AnimationStep[]; state: GameState } {
  const steps: AnimationStep[] = [];
  const nextState = cloneGameState(state);

  if (isRowEmpty(nextState.board, player) && !isBothQuanEmpty(nextState.board)) {
    // Deduct 5 points (can be deficit if score is low)
    nextState.scores[player] -= 5;
    const pits = getPlayerPits(player);
    for (const p of pits) {
      nextState.board[p].smallStones = 1;
    }

    steps.push({
      type: 'refill',
      pitIndex: pits[0],
      handCount: 0,
      boardState: cloneBoard(nextState.board),
      message: `Người chơi ${player} hết sỏi ở hàng: Rải 5 điểm từ quỹ vào 5 ô dân`,
      player
    });
  }

  return { steps, state: nextState };
}

/**
 * Execute a move and generate animation steps.
 */
export function executeMove(
  initialState: GameState,
  startPitIndex: number,
  direction: MoveDirection
): MoveResult {
  const state = cloneGameState(initialState);
  const player = state.currentTurn;
  const steps: AnimationStep[] = [];

  if (!isPlayerPit(player, startPitIndex)) {
    throw new Error(`Ô #${startPitIndex} không thuộc quyền sở hữu của Người chơi ${player}`);
  }

  if (state.board[startPitIndex].smallStones <= 0) {
    throw new Error(`Ô #${startPitIndex} không có sỏi để đi`);
  }

  const dirOffset = direction === 'clockwise' ? 1 : -1;
  const harvested: { pitIndex: number; points: number; isQuan: boolean }[] = [];
  let totalPointsGained = 0;

  // 1. Initial Pickup
  let hand = state.board[startPitIndex].smallStones;
  state.board[startPitIndex].smallStones = 0;
  let curr = startPitIndex;

  steps.push({
    type: 'pickup',
    pitIndex: startPitIndex,
    handCount: hand,
    boardState: cloneBoard(state.board),
    message: `Người chơi ${player} bốc ${hand} viên từ ô #${startPitIndex}`,
    player
  });

  // Main Sowing Loop
  let moveOngoing = true;

  while (moveOngoing) {
    // Sowing hand stones one by one
    while (hand > 0) {
      curr = (curr + dirOffset + 12) % 12;
      state.board[curr].smallStones += 1;
      hand -= 1;

      steps.push({
        type: 'drop',
        pitIndex: curr,
        handCount: hand,
        boardState: cloneBoard(state.board),
        message: `Rải 1 viên vào ô #${curr}`,
        player
      });
    }

    // Hand is now empty. Check next pit
    const nextPitIndex = (curr + dirOffset + 12) % 12;
    const nextPit = state.board[nextPitIndex];

    // Case A: Next pit is Quan with stones/Quan
    if (nextPit.isQuan && !isPitEmpty(nextPit)) {
      // Stopped before Quan (Đến quan chững lại)
      steps.push({
        type: 'pause_quan',
        pitIndex: nextPitIndex,
        handCount: 0,
        boardState: cloneBoard(state.board),
        message: `Đến Ô Quan #${nextPitIndex}: Chững lại kết thúc lượt`,
        player
      });
      moveOngoing = false;
      break;
    }

    // Case B: Next pit is a citizen pit and has stones -> Continue sowing (nối nước)
    if (!nextPit.isQuan && nextPit.smallStones > 0) {
      hand = nextPit.smallStones;
      nextPit.smallStones = 0;
      curr = nextPitIndex;

      steps.push({
        type: 'continue_pickup',
        pitIndex: nextPitIndex,
        handCount: hand,
        boardState: cloneBoard(state.board),
        message: `Nối nước: Bốc tiếp ${hand} viên từ ô dân #${nextPitIndex}`,
        player
      });
      // Loops back to sowing hand
      continue;
    }

    // Case C: Next pit is EMPTY (whether citizen or empty Quan) -> Check eating (Ăn quân)
    if (isPitEmpty(nextPit)) {
      let emptyCursor = nextPitIndex;

      while (true) {
        const targetPitIndex = (emptyCursor + dirOffset + 12) % 12;
        const targetPit = state.board[targetPitIndex];

        // If target pit is also empty -> 2 empty pits in a row -> stop
        if (isPitEmpty(targetPit)) {
          steps.push({
            type: 'pause_empty',
            pitIndex: targetPitIndex,
            handCount: 0,
            boardState: cloneBoard(state.board),
            message: `Gặp 2 ô trống liên tiếp (#${emptyCursor}, #${targetPitIndex}): Kết thúc lượt`,
            player
          });
          break;
        }

        // Target pit has stones! Eat it!
        const pts = getPitValue(targetPit);
        const wasQuan = targetPit.hasBigQuan;

        targetPit.smallStones = 0;
        targetPit.hasBigQuan = false;
        totalPointsGained += pts;
        state.scores[player] += pts;

        harvested.push({
          pitIndex: targetPitIndex,
          points: pts,
          isQuan: wasQuan
        });

        steps.push({
          type: 'eat',
          pitIndex: targetPitIndex,
          handCount: 0,
          boardState: cloneBoard(state.board),
          harvestedPoints: pts,
          isQuan: wasQuan,
          message: `ĂN QUÂN! Thu hoạch ${pts} điểm từ ô #${targetPitIndex}${wasQuan ? ' (Có Quan lớn!)' : ''}`,
          player
        });

        // Check if there is consecutive eating (ăn liên hoàn)
        const nextEmptyCandidateIndex = (targetPitIndex + dirOffset + 12) % 12;
        const nextEmptyCandidate = state.board[nextEmptyCandidateIndex];

        if (isPitEmpty(nextEmptyCandidate)) {
          // Continue scanning for next harvestable pit
          emptyCursor = nextEmptyCandidateIndex;
        } else {
          // Next pit is not empty -> eating chain stops
          break;
        }
      }

      moveOngoing = false;
      break;
    }
  }

  // Check Game Over condition
  // 1. Both Quan are empty
  if (isBothQuanEmpty(state.board)) {
    state.gameOver = true;
  }

  // If game is over, collect all remaining citizen stones
  if (state.gameOver) {
    let p1Remain = 0;
    for (const p of P1_PITS) {
      p1Remain += state.board[p].smallStones;
      state.board[p].smallStones = 0;
    }
    state.scores[1] += p1Remain;

    let p2Remain = 0;
    for (const p of P2_PITS) {
      p2Remain += state.board[p].smallStones;
      state.board[p].smallStones = 0;
    }
    state.scores[2] += p2Remain;

    if (state.scores[1] > state.scores[2]) {
      state.winner = 1;
    } else if (state.scores[2] > state.scores[1]) {
      state.winner = 2;
    } else {
      state.winner = 'draw';
    }

    steps.push({
      type: 'game_over',
      pitIndex: -1,
      handCount: 0,
      boardState: cloneBoard(state.board),
      message: `Ván đấu kết thúc! P1 thu hồi ${p1Remain} sỏi, P2 thu hồi ${p2Remain} sỏi còn lại.`,
      player
    });
  } else {
    // Switch turn
    const nextPlayer: PlayerId = player === 1 ? 2 : 1;
    state.currentTurn = nextPlayer;
    state.round += 1;

    // Check if next player's row is empty; if so, refill
    const refillRes = handleEmptyRowRefill(state, nextPlayer);
    for (const s of refillRes.steps) {
      steps.push(s);
    }
    Object.assign(state, refillRes.state);

    // If even after refill check, next player still has no valid moves, check if P1 also has none
    const nextMoves = getValidMoves(state, nextPlayer);
    if (nextMoves.length === 0) {
      // Game over if no moves possible
      state.gameOver = true;
      if (state.scores[1] > state.scores[2]) state.winner = 1;
      else if (state.scores[2] > state.scores[1]) state.winner = 2;
      else state.winner = 'draw';
    }
  }

  steps.push({
    type: 'turn_end',
    pitIndex: -1,
    handCount: 0,
    boardState: cloneBoard(state.board),
    message: state.gameOver
      ? `Trò chơi kết thúc! Người thắng: ${state.winner === 'draw' ? 'Hòa' : `Người chơi ${state.winner}`}`
      : `Chuyển lượt sang Người chơi ${state.currentTurn}`,
    player
  });

  const dirDesc = direction === 'clockwise' ? 'cùng chiều kim đồng hồ (→)' : 'ngược chiều kim đồng hồ (←)';
  const logEntry: GameLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    player,
    pitIndex: startPitIndex,
    direction,
    harvested,
    totalPointsGained,
    description: `P${player} rải ô #${startPitIndex} ${dirDesc}${totalPointsGained > 0 ? ` ➔ Ăn ${totalPointsGained} điểm` : ''}`
  };

  state.history.unshift(logEntry);

  return {
    steps,
    finalState: state,
    harvestedTotal: totalPointsGained,
    logEntry
  };
}
