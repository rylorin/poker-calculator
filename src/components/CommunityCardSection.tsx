import React from 'react';
import { Card as CardType } from '../types';
import CardSelector from './CardSelector';

interface CommunityCardSectionProps {
  communityCards: {
    flop: [CardType | null, CardType | null, CardType | null];
    turn: CardType | null;
    river: CardType | null;
  };
  onUpdateCommunityCards: (section: 'flop' | 'turn' | 'river', index: number, card: CardType | null) => void;
  unavailableCards: CardType[];
}

const CommunityCardSection: React.FC<CommunityCardSectionProps> = ({
  communityCards,
  onUpdateCommunityCards,
  unavailableCards
}) => {
  return (
    <div className="bg-gray-200 dark:bg-gray-800">
      <div className="grid grid-cols-3 divide-x divide-gray-300 dark:divide-gray-700">
        <div className="p-4 flex flex-col items-center">
          <h3 className="text-lg font-medium mb-4">Flop</h3>
          <div className="flex space-x-2">
            <CardSelector
              selectedCard={communityCards.flop[0]}
              onSelectCard={(card) => onUpdateCommunityCards('flop', 0, card)}
              unavailableCards={unavailableCards.filter(card => 
                !(communityCards.flop[0] && 
                  card.rank === communityCards.flop[0]?.rank && 
                  card.suit === communityCards.flop[0]?.suit)
              )}
            />
            <CardSelector
              selectedCard={communityCards.flop[1]}
              onSelectCard={(card) => onUpdateCommunityCards('flop', 1, card)}
              unavailableCards={unavailableCards.filter(card => 
                !(communityCards.flop[1] && 
                  card.rank === communityCards.flop[1]?.rank && 
                  card.suit === communityCards.flop[1]?.suit)
              )}
            />
            <CardSelector
              selectedCard={communityCards.flop[2]}
              onSelectCard={(card) => onUpdateCommunityCards('flop', 2, card)}
              unavailableCards={unavailableCards.filter(card => 
                !(communityCards.flop[2] && 
                  card.rank === communityCards.flop[2]?.rank && 
                  card.suit === communityCards.flop[2]?.suit)
              )}
            />
          </div>
        </div>
        
        <div className="p-4 flex flex-col items-center">
          <h3 className="text-lg font-medium mb-4">Turn</h3>
          <CardSelector
            selectedCard={communityCards.turn}
            onSelectCard={(card) => onUpdateCommunityCards('turn', 0, card)}
            unavailableCards={unavailableCards.filter(card => 
              !(communityCards.turn && 
                card.rank === communityCards.turn?.rank && 
                card.suit === communityCards.turn?.suit)
            )}
          />
        </div>
        
        <div className="p-4 flex flex-col items-center">
          <h3 className="text-lg font-medium mb-4">River</h3>
          <CardSelector
            selectedCard={communityCards.river}
            onSelectCard={(card) => onUpdateCommunityCards('river', 0, card)}
            unavailableCards={unavailableCards.filter(card => 
              !(communityCards.river && 
                card.rank === communityCards.river?.rank && 
                card.suit === communityCards.river?.suit)
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default CommunityCardSection;