import React from 'react';
import { GameVariant } from '../types';

interface GameControlsProps {
  gameVariant: GameVariant;
  onChangeGameVariant: (variant: GameVariant) => void;
  onRunCalculation: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameVariant,
  onChangeGameVariant,
  onRunCalculation
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow mb-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <label htmlFor="game-variant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Game Variant
          </label>
          <select
            id="game-variant"
            value={gameVariant}
            onChange={(e) => onChangeGameVariant(e.target.value as GameVariant)}
            className="block w-full rounded-md border-gray-300 shadow-sm 
              focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50
              dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="texas-holdem">Texas Hold'em</option>
            <option value="omaha-high">Omaha High</option>
            <option value="omaha-hi-lo">Omaha Hi/Lo</option>
          </select>
        </div>
        
        <div>
          <button
            onClick={onRunCalculation}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Calculate Equity
          </button>
        </div>
        
        <div>
          <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
            dark:text-white font-medium rounded-md focus:outline-none focus:ring-2 
            focus:ring-gray-500 focus:ring-opacity-50">
            Save Hand Range
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;