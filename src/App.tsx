import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CommunityCardSection from './components/CommunityCardSection';
import PlayersSection from './components/PlayersSection';
import GameControls from './components/GameControls';
import ResultDisplay from './components/ResultDisplay';
import { Card, GameVariant, Player } from './types';
import { calculateEquity, isCardInUse } from './utils/cardUtils';

function App() {
  // Game state management
  const [gameVariant, setGameVariant] = useState<GameVariant>('texas-holdem');
  
  // Initialize with two players, each having empty hands and zero equity
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, hand: [], equity: 0, winPercentage: 0, tiePercentage: 0 },
    { id: 2, hand: [], equity: 0, winPercentage: 0, tiePercentage: 0 }
  ]);
  
  // Track community cards state (flop, turn, river)
  const [communityCards, setCommunityCards] = useState<{
    flop: [Card | null, Card | null, Card | null];
    turn: Card | null;
    river: Card | null;
  }>({
    flop: [null, null, null],
    turn: null,
    river: null
  });
  
  // Track calculation method and results
  const [calculationResult, setCalculationResult] = useState<{
    isExact: boolean;
    simulationCount?: number;
  }>({
    isExact: true
  });

  /**
   * Collects all cards currently in use (player hands + community cards)
   * Used to prevent duplicate card selection
   */
  const getAllCardsInUse = (): Card[] => {
    const cards: Card[] = [];
    
    // Add all cards from player hands
    players.forEach(player => {
      player.hand.forEach(card => {
        if (card) cards.push(card);
      });
    });
    
    // Add all community cards
    communityCards.flop.forEach(card => {
      if (card) cards.push(card);
    });
    if (communityCards.turn) cards.push(communityCards.turn);
    if (communityCards.river) cards.push(communityCards.river);
    
    return cards;
  };

  /**
   * Updates community cards when a card is selected or removed
   */
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

  /**
   * Updates a player's hand when a card is selected or removed
   */
  const handleUpdatePlayerHand = (playerId: number, index: number, card: Card | null) => {
    setPlayers(prev => 
      prev.map(player => {
        if (player.id === playerId) {
          const newHand:(Card|null)[] = [...player.hand];
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

  /**
   * Adds a new player to the game (max 10 players)
   */
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

  /**
   * Removes a player from the game (minimum 2 players required)
   */
  const handleRemovePlayer = (playerId: number) => {
    if (players.length > 2) {
      setPlayers(players.filter(player => player.id !== playerId));
    }
  };

  /**
   * Changes the game variant and resets hands if switching between Hold'em and Omaha
   */
  const handleChangeGameVariant = (variant: GameVariant) => {
    setGameVariant(variant);
    
    // Reset hands when switching between Hold'em and Omaha due to different hand sizes
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

  /**
   * Resets the game state while maintaining player count
   */
  const handleClear = () => {
    // Reset community cards
    setCommunityCards({
      flop: [null, null, null],
      turn: null,
      river: null
    });
    
    // Reset player hands but keep players
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

  /**
   * Calculates equity for all players based on current cards
   */
  const handleRunCalculation = () => {
    // Determine if we can use exact calculation based on number of unknown cards
    const filledCards = getAllCardsInUse().length;
    const totalCards = 52;
    const unknownCards = totalCards - filledCards;
    
    const isExact = unknownCards <= 4; // Use exact calculation if 4 or fewer cards unknown
    const simulationCount = isExact ? undefined : 10000;
    
    try {
      // Calculate equity for all players
      const updatedPlayers = calculateEquity(players, communityCards, simulationCount);
      setPlayers(updatedPlayers);
    } catch (e) {
      console.error('Error calculating equity:', e);
    }
    
    setCalculationResult({ isExact, simulationCount });
  };

  // Automatically recalculate equity when cards change
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