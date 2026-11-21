export type PlayerId = 1 | 2;

export interface PitState {
  index: number;
  smallStones: number;
  hasBigQuan: boolean;
  isQuan: boolean;
  owner: PlayerId | null; // 1 for pits 1-5, 2 for pits 7-11, null for Quan pits 0 & 6
}

export type MoveDirection = 'clockwise' | 'counterclockwise';

export interface PlayerInfo {
  id: PlayerId;
  name: string;
  score: number;
  isBot?: boolean;
}

export interface GameState {
  board: PitState[];
  currentTurn: PlayerId;
  scores: { 1: number; 2: number };
  gameOver: boolean;
  winner: PlayerId | 'draw' | null;
  round: number;
  history: GameLogEntry[];
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  player: PlayerId;
  pitIndex: number;
  direction: MoveDirection;
  harvested: { pitIndex: number; points: number; isQuan: boolean }[];
  totalPointsGained: number;
  description: string;
}

export type AnimationStepType =
  | 'pickup'          // Pickup from a pit
  | 'drop'            // Drop 1 pebble into pit
  | 'continue_pickup' // Pickup to continue sowing (nối nước)
  | 'pause_quan'      // Stopped before Quan (chững)
  | 'pause_empty'     // Stopped at 2 empty pits
  | 'eat'             // Eat stones from a pit
  | 'refill'          // Vét sỏi (when row is empty, -5 pts to fill 1 into each pit)
  | 'game_over'       // Final remaining stones collected
  | 'turn_end';

export interface AnimationStep {
  type: AnimationStepType;
  pitIndex: number;
  handCount: number;
  boardState: PitState[];
  harvestedPoints?: number;
  isQuan?: boolean;
  message?: string;
  player: PlayerId;
}

export interface MoveResult {
  steps: AnimationStep[];
  finalState: GameState;
  harvestedTotal: number;
  logEntry: GameLogEntry;
}

export type BotDifficulty = 'easy' | 'strategic';
