import React from 'react';
import { Card as CardType, Player, GameVariant } from '../types';
import PlayerHand from './PlayerHand';

interface PlayersSectionProps {
  players: Player[];
  gameVariant: GameVariant;
  onUpdateHand: (playerId: number, index: number, card: CardType | null) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (playerId: number) => void;
  onClear: () => void;
  unavailableCards: CardType[];
}

const PlayersSection: React.FC<PlayersSectionProps> = ({
  players,
  gameVariant,
  onUpdateHand,
  onAddPlayer,
  onRemovePlayer,
  onClear,
  unavailableCards
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Players remaining: {players.length}</h2>
        <button
          onClick={onAddPlayer}
          disabled={players.length >= 10}
          className={`px-4 py-2 rounded-lg font-medium 
            ${players.length >= 10 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          + Player
        </button>
      </div>
      
      <div>
        {players.map(player => (
          <PlayerHand
            key={player.id}
            player={player}
            gameVariant={gameVariant}
            onUpdateHand={onUpdateHand}
            onRemovePlayer={onRemovePlayer}
            unavailableCards={unavailableCards.filter(card => 
              !player.hand.some(playerCard => 
                playerCard && playerCard.rank === card.rank && playerCard.suit === card.suit
              )
            )}
          />
        ))}
      </div>
      
      <div className="p-4">
        <button
          onClick={onClear}
          className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 py-3 rounded-lg text-center font-medium transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default PlayersSection;