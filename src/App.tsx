import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CommunityCardSection from './components/CommunityCardSection';
import PlayersSection from './components/PlayersSection';
import GameControls from './components/GameControls';
import ResultDisplay from './components/ResultDisplay';
import { Card, GameVariant, Player } from './types';
import { calculateEquity, isCardInUse } from './utils/cardUtils';

function App() {
  const [gameVariant, setGameVariant] = useState<GameVariant>('texas-holdem');
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, hand: [], equity: 0, winPercentage: 0, tiePercentage: 0 },
    { id: 2, hand: [], equity: 0, winPercentage: 0, tiePercentage: 0 }
  ]);
  
  const [communityCards, setCommunityCards] = useState<{
    flop: [Card | null, Card | null, Card | null];
    turn: Card | null;
    river: Card | null;
  }>({
    flop: [null, null, null],
    turn: null,
    river: null
  });
  
  const [calculationResult, setCalculationResult] = useState<{
    isExact: boolean;
    simulationCount?: number;
  }>({
    isExact: true
  });

  // Get all cards in use for checking availability
  const getAllCardsInUse = (): Card[] => {
    const cards: Card[] = [];
    
    // Add player cards
    players.forEach(player => {
      player.hand.forEach(card => {
        if (card) cards.push(card);
      });
    });
    
    // Add community cards
    communityCards.flop.forEach(card => {
      if (card) cards.push(card);
    });
    
    if (communityCards.turn) cards.push(communityCards.turn);
    if (communityCards.river) cards.push(communityCards.river);
    
    return cards;
  };

  const handleUpdateCommunityCards = (
    section: 'flop' | 'turn' | 'river',
    index: number,
    card: Card | null
  ) => {
    setCommunityCards(prev => {
      if (section === 'flop') {
        const newFlop = [...prev.flop] as [Card | null, Card | null, Card | null];
        newFlop[index] = card;
        return { ...prev, flop: newFlop };
      } else if (section === 'turn') {
        return { ...prev, turn: card };
      } else {
        return { ...prev, river: card };
      }
    });
  };

  const handleUpdatePlayerHand = (playerId: number, index: number, card: Card | null) => {
    setPlayers(prev => 
      prev.map(player => {
        if (player.id === playerId) {
          const newHand = [...player.hand];
          while (newHand.length <= index) {
            newHand.push(null);
          }
          newHand[index] = card;
          return { ...player, hand: newHand };
        }
        return player;
      })
    );
  };

  const handleAddPlayer = () => {
    if (players.length < 10) {
      const newPlayerId = Math.max(0, ...players.map(p => p.id)) + 1;
      setPlayers([...players, { 
        id: newPlayerId, 
        hand: [], 
        equity: 0, 
        winPercentage: 0, 
        tiePercentage: 0 
      }]);
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    if (players.length > 2) {
      setPlayers(players.filter(player => player.id !== playerId));
    }
  };

  const handleChangeGameVariant = (variant: GameVariant) => {
    setGameVariant(variant);
    
    // Reset player hands if switching between Hold'em and Omaha
    if (
      (gameVariant.startsWith('texas') && variant.startsWith('omaha')) ||
      (gameVariant.startsWith('omaha') && variant.startsWith('texas'))
    ) {
      setPlayers(prev => 
        prev.map(player => ({
          ...player,
          hand: []
        }))
      );
    }
  };

  const handleClear = () => {
    // Reset community cards
    setCommunityCards({
      flop: [null, null, null],
      turn: null,
      river: null
    });
    
    // Reset all player hands but keep the players
    setPlayers(prev => 
      prev.map(player => ({
        ...player,
        hand: [],
        equity: 0,
        winPercentage: 0,
        tiePercentage: 0
      }))
    );
    
    // Reset calculation result
    setCalculationResult({
      isExact: true
    });
  };

  const handleRunCalculation = () => {
    // Count filled cards to determine if we can use exact calculation
    const filledCards = getAllCardsInUse().length;
    const totalCards = 52;
    const unknownCards = totalCards - filledCards;
    
    const isExact = unknownCards <= 4; // Arbitrary threshold for exact calculation
    const simulationCount = isExact ? undefined : 10000;
    
    // Updated players with new equity calculations
    const updatedPlayers = calculateEquity(players, communityCards, simulationCount);
    
    setPlayers(updatedPlayers);
    setCalculationResult({ isExact, simulationCount });
  };

  // Auto-run calculation when cards change
  useEffect(() => {
    handleRunCalculation();
  }, [players, communityCards]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
      <Header 
        gameVariant={gameVariant}
        onChangeGameVariant={handleChangeGameVariant}
      />
      
      <main className="container mx-auto px-4 py-6">
        <GameControls
          gameVariant={gameVariant}
          onChangeGameVariant={handleChangeGameVariant}
          onRunCalculation={handleRunCalculation}
        />
        
        <CommunityCardSection
          communityCards={communityCards}
          onUpdateCommunityCards={handleUpdateCommunityCards}
          unavailableCards={getAllCardsInUse()}
        />
        
        <PlayersSection
          players={players}
          gameVariant={gameVariant}
          onUpdateHand={handleUpdatePlayerHand}
          onAddPlayer={handleAddPlayer}
          onRemovePlayer={handleRemovePlayer}
          onClear={handleClear}
          unavailableCards={getAllCardsInUse()}
        />
        
        <ResultDisplay
          isExact={calculationResult.isExact}
          simulationCount={calculationResult.simulationCount}
        />
      </main>
    </div>
  );
}

export default App;