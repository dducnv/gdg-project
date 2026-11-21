import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  executeMove,
  getValidMoves,
  isBothQuanEmpty,
  isRowEmpty,
  handleEmptyRowRefill,
  cloneGameState
} from '../src/game/rules';

describe('Ô Ăn Quan Rules Engine', () => {
  it('creates an initial board with 70 total points', () => {
    const state = createInitialGameState();
    expect(state.board.length).toBe(12);

    // Check Quan pits
    expect(state.board[0].isQuan).toBe(true);
    expect(state.board[0].hasBigQuan).toBe(true);
    expect(state.board[0].smallStones).toBe(0);

    expect(state.board[6].isQuan).toBe(true);
    expect(state.board[6].hasBigQuan).toBe(true);
    expect(state.board[6].smallStones).toBe(0);

    // Check Citizen pits
    for (let i = 1; i <= 5; i++) {
      expect(state.board[i].smallStones).toBe(5);
      expect(state.board[i].owner).toBe(1);
    }
    for (let i = 7; i <= 11; i++) {
      expect(state.board[i].smallStones).toBe(5);
      expect(state.board[i].owner).toBe(2);
    }

    // Total points on board = 5*10 + 2*10 = 70
    let totalPoints = 0;
    for (const pit of state.board) {
      totalPoints += pit.smallStones + (pit.hasBigQuan ? 10 : 0);
    }
    expect(totalPoints).toBe(70);
  });

  it('generates valid moves for player 1', () => {
    const state = createInitialGameState();
    const moves = getValidMoves(state, 1);
    expect(moves.length).toBe(5);
    expect(moves.map(m => m.pitIndex)).toEqual([1, 2, 3, 4, 5]);
  });

  it('executes a move, updates stones, and switches turn', () => {
    const state = createInitialGameState();
    // P1 plays pit 1, counterclockwise towards pit 0 (Quan trái)
    // Pit 1 had 5 stones.
    // drops at 0 (Quan), 11 (P2), 10 (P2), 9 (P2), 8 (P2)
    // next is 7 (P2), which has 5 stones!
    // So it should continue sowing (nối nước) from pit 7!
    const res = executeMove(state, 1, 'counterclockwise');
    expect(res.steps.length).toBeGreaterThan(0);
    expect(res.finalState.currentTurn).toBe(2); // Turned switched to P2
  });

  it('detects and executes eating (ăn quân) when landing before empty pit and full target pit', () => {
    const state = createInitialGameState();
    // Setup a custom board to test direct eating:
    // P1 plays pit 5 (1 stone) clockwise:
    // Pit 5 -> drops at pit 6 (Quan).
    // Now next pit 7 is made empty!
    // Pit 8 has 4 stones.
    state.board[5].smallStones = 1;
    state.board[7].smallStones = 0; // empty pit
    state.board[8].smallStones = 4; // target pit

    const res = executeMove(state, 5, 'clockwise');
    // Drop at 6 (Quan). Hand empty.
    // Next pit is 7 (empty).
    // Target pit is 8 (has 4 stones) -> EAT pit 8!
    expect(res.harvestedTotal).toBeGreaterThanOrEqual(4);
    expect(res.finalState.scores[1]).toBeGreaterThanOrEqual(4);
    expect(res.finalState.board[8].smallStones).toBe(0);
  });

  it('detects consecutive eating (ăn liên hoàn)', () => {
    const state = createInitialGameState();
    // P1 plays pit 5 (1 stone) clockwise:
    // drops 1 stone at pit 6 (Quan).
    // pit 7: empty
    // pit 8: 3 stones (eaten!)
    // pit 9: empty
    // pit 10: 5 stones (consecutive eaten!)
    state.board[5].smallStones = 1;
    state.board[7].smallStones = 0;
    state.board[8].smallStones = 3;
    state.board[9].smallStones = 0;
    state.board[10].smallStones = 5;

    const res = executeMove(state, 5, 'clockwise');
    // Total eaten = 3 + 5 = 8
    expect(res.harvestedTotal).toBe(8);
    expect(res.finalState.board[8].smallStones).toBe(0);
    expect(res.finalState.board[10].smallStones).toBe(0);
    expect(res.finalState.scores[1]).toBe(8);
  });

  it('handles empty row refill (vét sỏi)', () => {
    const state = createInitialGameState();
    state.scores[1] = 10;
    for (let i = 1; i <= 5; i++) {
      state.board[i].smallStones = 0;
    }
    expect(isRowEmpty(state.board, 1)).toBe(true);

    const refill = handleEmptyRowRefill(state, 1);
    expect(refill.state.scores[1]).toBe(5); // deducted 5 points
    for (let i = 1; i <= 5; i++) {
      expect(refill.state.board[i].smallStones).toBe(1);
    }
  });

  it('triggers game over when both Quan are eaten', () => {
    const state = createInitialGameState();
    state.board[0].hasBigQuan = false;
    state.board[0].smallStones = 0;
    state.board[6].hasBigQuan = false;
    state.board[6].smallStones = 0;

    expect(isBothQuanEmpty(state.board)).toBe(true);
  });
});
