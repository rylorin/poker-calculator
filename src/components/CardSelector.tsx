import React, { useState } from 'react';
import { Card as CardType, Rank, Suit } from '../types';
import { RANKS, SUITS, getSuitSymbol, getCardColor } from '../utils/cardUtils';
import Card from './Card';

interface CardSelectorProps {
  selectedCard: CardType | null;
  onSelectCard: (card: CardType | null) => void;
  unavailableCards: CardType[];
}

const CardSelector: React.FC<CardSelectorProps> = ({ 
  selectedCard, 
  onSelectCard, 
  unavailableCards 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isCardUnavailable = (rank: Rank, suit: Suit): boolean => {
    return unavailableCards.some(card => card.rank === rank && card.suit === suit);
  };

  const handleSelectCard = (rank: Rank, suit: Suit) => {
    onSelectCard({ rank, suit });
    setIsOpen(false);
  };

  const handleClearCard = () => {
    onSelectCard(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        <Card 
          card={selectedCard}
          size="md"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 w-[320px]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Select Card</h3>
            <button 
              className="text-blue-500 hover:text-blue-700 text-sm"
              onClick={handleClearCard}
            >
              Clear
            </button>
          </div>
          
          <div className="space-y-2">
            {SUITS.map((suit) => (
              <div key={suit} className="flex items-center space-x-1">
                <span className={`w-6 text-lg ${getCardColor(suit)}`}>
                  {getSuitSymbol(suit)}
                </span>
                <div className="flex flex-wrap gap-1">
                  {RANKS.map((rank) => {
                    const unavailable = isCardUnavailable(rank, suit);
                    const selected = selectedCard?.rank === rank && selectedCard?.suit === suit;
                    const color = getCardColor(suit);
                    
                    return (
                      <button
                        key={`${rank}-${suit}`}
                        className={`w-6 h-6 flex items-center justify-center rounded text-sm font-medium
                          ${selected ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-300'} 
                          ${unavailable ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                          border`}
                        onClick={() => !unavailable && handleSelectCard(rank, suit)}
                        disabled={unavailable}
                      >
                        <span className={color}>{rank}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSelector;