import React from 'react';
import { Card as CardType, Player } from '../types';
import CardSelector from './CardSelector';

interface PlayerHandProps {
  player: Player;
  gameVariant: 'texas-holdem' | 'omaha-high' | 'omaha-hi-lo';
  onUpdateHand: (playerId: number, index: number, card: CardType | null) => void;
  onRemovePlayer: (playerId: number) => void;
  unavailableCards: CardType[];
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  gameVariant,
  onUpdateHand,
  onRemovePlayer,
  unavailableCards
}) => {
  // Determine how many cards should be in the hand based on game variant
  const cardCount = gameVariant.startsWith('omaha') ? 4 : 2;

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Player {player.id}</h3>
        <button
          onClick={() => onRemovePlayer(player.id)}
          className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
          aria-label="Remove player"
        >
          X
        </button>
      </div>

      <div className="flex flex-wrap items-start">
        <div className="flex space-x-2 mb-4">
          {Array.from({ length: cardCount }).map((_, index) => (
            <CardSelector
              key={index}
              selectedCard={player.hand[index] || null}
              onSelectCard={(card) => onUpdateHand(player.id, index, card)}
              unavailableCards={unavailableCards.filter(card => 
                !(player.hand[index] && 
                  card.rank === player.hand[index]?.rank && 
                  card.suit === player.hand[index]?.suit)
              )}
            />
          ))}
        </div>
        
        <div className="ml-4 flex-grow">
          <div className="flex justify-between mb-1">
            <span className="text-gray-600 dark:text-gray-400">Equity</span>
            <span className="font-bold text-xl">{player.equity.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600 dark:text-gray-400">Win</span>
            <span>{player.winPercentage.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tie</span>
            <span>{player.tiePercentage.toFixed(2)}%</span>
          </div>
        </div>
        
        <div className="ml-auto flex space-x-1">
          <button className="bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 text-sm">
            Range
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 text-sm">
            Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerHand;