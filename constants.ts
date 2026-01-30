
import { GameState } from './types';

export const INITIAL_STATE: GameState = {
  player1: 10000,
  player2: 10000,
  pool: 0,
  name1: 'Player 1',
  name2: 'Player 2',
  displayValue: 0,
  p1Change: 0,
  p2Change: 0,
};

export const ANIMATION_DURATION = 500;
export const SFX_VOLUME = 0.6;
