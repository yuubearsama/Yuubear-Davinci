
export interface GameState {
  player1: number;
  player2: number;
  pool: number;
  name1: string;
  name2: string;
  displayValue: number;
  p1Change: number;
  p2Change: number;
}

export type MessageType = 'SYNC_STATE' | 'COMMAND';

export interface PeerMessage {
  type: MessageType;
  payload: any;
}

export enum GameCommand {
  ADD_1000 = 'ADD_1000',
  SUB_1000 = 'SUB_1000',
  EQUALS = 'EQUALS',
  SEND_TO_P1 = 'SEND_TO_P1',
  SEND_TO_P2 = 'SEND_TO_P2',
  CLEAR_POOL = 'CLEAR_POOL',
  RESET = 'RESET',
  UPDATE_NAME = 'UPDATE_NAME'
}
