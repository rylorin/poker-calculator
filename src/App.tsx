import  { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CommunityCardSection from './components/CommunityCardSection';
import PlayersSection from './components/PlayersSection';
import GameControls from './components/GameControls';
import ResultDisplay from './components/ResultDisplay';
import { Card, GameVariant, Player } from './types';
import { calculateEquity } from './utils/cardUtils';

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

  // Timeout state is no longer needed

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
    
    // Trigger automatic equity calculation after community cards change
    // No need to call debouncedCalculation here as useEffect will handle it
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
    
    // Trigger automatic equity calculation after player hand changes
    // No need to call debouncedCalculation here as useEffect will handle it
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
  const handleRunCalculation = useCallback(async (isManualCalculation = false) => {
    // Determine if we can use exact calculation based on number of unknown cards
    const filledCards = getAllCardsInUse().length;
    const totalCards = 52;
    const unknownCards = totalCards - filledCards;
    
    const isExact = unknownCards <= 4; // Use exact calculation if 4 or fewer cards unknown
    const simulationCount = isExact ? undefined : 10000;
    
    try {
      // Calculate equity for all players
      const updatedPlayers = await calculateEquity(players, communityCards, simulationCount);
      
      // Only update players if there are actual changes to prevent unnecessary re-renders
      const hasChanges = updatedPlayers.some((updatedPlayer, index) => {
        const currentPlayer = players[index];
        return (
          updatedPlayer.equity !== currentPlayer.equity ||
          updatedPlayer.winPercentage !== currentPlayer.winPercentage ||
          updatedPlayer.tiePercentage !== currentPlayer.tiePercentage
        );
      });
      // console.log('handleRunCalculation',isManualCalculation,players, updatedPlayers,  hasChanges);

      // Only update state if this is a manual calculation or if there are actual changes
      // This prevents infinite loops from automatic calculations
      if (isManualCalculation || hasChanges) {
        setPlayers(updatedPlayers);
      }
    } catch (e) {
      console.error('Error calculating equity:', e);
    }
    
    // Only update calculation result for manual calculations to prevent unnecessary re-renders
    if (isManualCalculation) {
      setCalculationResult({ isExact, simulationCount });
    }
  }, [players, communityCards]);

  // Smart automatic equity calculation that doesn't cause infinite loops
  useEffect(() => {
    // Only calculate if we have at least 2 players with complete hands
    const playersWithCompleteHands = players.filter(p => 
      p.hand.filter(card => card !== null).length >= 2
    );
    
    if (playersWithCompleteHands.length >= 2) {
      // Trigger automatic calculation without updating state to prevent loops
      handleRunCalculation(false);
    }
  }, [players, communityCards, handleRunCalculation]);
  
  // No cleanup needed since we removed the timeout logic

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
          onRunCalculation={() => handleRunCalculation(true)}
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