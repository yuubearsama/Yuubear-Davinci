
import React from 'react';
import { GameState } from '../types';
import BouncingText from './BouncingText';
import AnimatedNumber from './AnimatedNumber';

interface GameDisplayProps {
  state: GameState;
}

const GameDisplay: React.FC<GameDisplayProps> = ({ state }) => {
  const p1Lost = state.player1 === 0;
  const p2Lost = state.player2 === 0;
  const poolIsZero = state.pool === 0;

  const p1Winner = !p1Lost && p2Lost && poolIsZero;
  const p2Winner = p1Lost && !p2Lost && poolIsZero;

  return (
    <div className="flex flex-col md:flex-row justify-center items-center w-full max-w-4xl gap-8 md:gap-16 py-8">
      {/* Player 1 */}
      <div className="flex flex-col items-center min-w-[150px]">
        <BouncingText text={state.name1} active={p1Winner} />
        <div className="text-6xl font-mono mt-4 text-white">
          <AnimatedNumber value={state.player1} />
        </div>
      </div>

      {/* Pool Area */}
      <div className={`flex flex-col items-center min-w-[150px] transition-all duration-300 ${state.pool === 0 ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
        <div className="text-2xl font-bold text-gray-400">กองกลาง</div>
        <div className="text-6xl font-mono mt-4 text-red-500">
          <AnimatedNumber value={state.pool} />
        </div>
      </div>

      {/* Player 2 */}
      <div className="flex flex-col items-center min-w-[150px]">
        <BouncingText text={state.name2} active={p2Winner} />
        <div className="text-6xl font-mono mt-4 text-white">
          <AnimatedNumber value={state.player2} />
        </div>
      </div>
    </div>
  );
};

export default GameDisplay;
