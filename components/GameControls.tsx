
import React from 'react';
import { GameState, GameCommand } from '../types';

interface GameControlsProps {
  state: GameState;
  onCommand: (command: GameCommand, payload?: any) => void;
  isRemote?: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ state, onCommand, isRemote = false }) => {
  const plusText = state.displayValue !== 0 ? state.p1Change.toLocaleString() : '➕';
  const minusText = state.displayValue !== 0 ? `+${Math.abs(state.p2Change).toLocaleString()}` : '➖';

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6 mt-8 p-4">
      <div className="flex justify-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => onCommand(GameCommand.ADD_1000)}
            className="w-20 h-20 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 rounded-xl flex items-center justify-center font-bold text-xl text-purple-400"
          >
            {plusText}
          </button>
          <button
            onClick={() => onCommand(GameCommand.SUB_1000)}
            className="w-20 h-20 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 rounded-xl flex items-center justify-center font-bold text-xl text-purple-400"
          >
            {minusText}
          </button>
          <button
            onClick={() => onCommand(GameCommand.EQUALS)}
            className="w-20 h-20 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 rounded-xl flex items-center justify-center font-bold text-2xl text-purple-300"
          >
            🟰
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '1', cmd: GameCommand.SEND_TO_P1 },
            { label: '2', cmd: GameCommand.SEND_TO_P2 },
            { label: 'X', cmd: GameCommand.CLEAR_POOL },
            { label: 'R', cmd: GameCommand.RESET, color: 'text-red-500 border-red-500' },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => onCommand(btn.cmd)}
              className={`w-16 h-20 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 rounded-xl flex items-center justify-center font-bold text-2xl ${btn.color || 'text-white'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full bg-gray-800 p-4 border border-gray-600 rounded-xl text-center text-2xl font-mono font-bold text-gray-200">
        ช่องแสดงผลลัพธ์: {state.displayValue.toLocaleString()}
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          value={state.name1}
          onChange={(e) => onCommand(GameCommand.UPDATE_NAME, { id: 'name1', value: e.target.value })}
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg p-3 text-center text-gray-200 focus:outline-none focus:border-purple-500"
          placeholder="ชื่อ Player 1"
        />
        <input
          type="text"
          value={state.name2}
          onChange={(e) => onCommand(GameCommand.UPDATE_NAME, { id: 'name2', value: e.target.value })}
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg p-3 text-center text-gray-200 focus:outline-none focus:border-purple-500"
          placeholder="ชื่อ Player 2"
        />
      </div>
    </div>
  );
};

export default GameControls;
