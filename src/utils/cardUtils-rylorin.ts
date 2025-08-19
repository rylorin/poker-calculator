import { Card, Rank, Suit, Player } from '../types';
import { PokerEquityCalculator, GameVariant } from 'poker-equity-calculator';

// Define all possible card ranks from Ace to 2
export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// Define all possible card suits
export const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];

/**
 * Creates a complete deck of 52 cards
 * @returns Array of Card objects representing a standard deck
 */
export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
};

/**
 * Determines the display color for a card based on its suit
 * @param suit The suit of the card
 * @returns CSS class name for text color (red for hearts/diamonds, black for spades/clubs)
 */
export const getCardColor = (suit: Suit): string => {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
};

/**
 * Returns the Unicode symbol for a given suit
 * @param suit The suit to get the symbol for
 * @returns Unicode character representing the suit
 */
export const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case 'spades': return '♠';
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
  }
};

/**
 * Checks if a card is already in use by any player or in the community cards
 * @param card The card to check
 * @param players Array of all players
 * @param communityCards Current community cards on the board
 * @returns boolean indicating if the card is already in use
 */
export const isCardInUse = (
  card: Card, 
  players: Player[], 
  communityCards: { flop: (Card | null)[]; turn: Card | null; river: Card | null }
): boolean => {
  // Check if the card is in any player's hand
  const inPlayerHand = players.some(player => 
    player.hand.some(c => c?.rank === card.rank && c?.suit === card.suit)
  );
  
  if (inPlayerHand) return true;
  
  // Check if the card is in community cards
  const inFlop = communityCards.flop.some(c => 
    c !== null && c.rank === card.rank && c.suit === card.suit
  );
  
  const inTurn = communityCards.turn !== null && 
    communityCards.turn.rank === card.rank && 
    communityCards.turn.suit === card.suit;
    
  const inRiver = communityCards.river !== null && 
    communityCards.river.rank === card.rank && 
    communityCards.river.suit === card.suit;
  
  return inFlop || inTurn || inRiver;
};

/**
 * Converts our internal card representation to the format expected by poker-odds-calc
 * @param card Our internal Card object
 * @returns String representation of the card (e.g., "As" for Ace of spades)
 */
const convertToPokerCalcCard = (card: Card|null): string => {
  const suitMap: Record<Suit, string> = {
    'spades': 's',
    'hearts': 'h',
    'diamonds': 'd',
    'clubs': 'c'
  };
  
  return card ? `${card.rank}${suitMap[card.suit]}`:'..';
};

/**
 * Calculates equity percentages for all players using poker-odds-calc
 * @param players Array of players with their current hands
 * @param communityCards Current community cards on the board
 * @param iterations Number of Monte Carlo simulations to run (default: 10000)
 * @returns Updated array of players with calculated equity percentages
 */
export const calculateEquity = async (
  players: Player[],
  communityCards: { flop: (Card | null)[]; turn: Card | null; river: Card | null },
  iterations?: number
): Promise<Player[]> => {
  // Return default values if we don't have at least 2 players with cards
  const playersWithCards = players.filter(p => p.hand.filter(Boolean).length >= 2);
  if (playersWithCards.length < 2) {
    return players.map(player => ({
      ...player,
      equity: 100/players.length,
      winPercentage: 0,
      tiePercentage: 0
    }));
  }

  // Initialize the poker calculator for Texas Hold'em
  const calculator = new PokerEquityCalculator(GameVariant.TEXAS_HOLDEM);
  
  // Add each player's hand to the calculator (only if both hole cards are present)
  const playerIndexToResultIndex: number[] = [];
  players.forEach((player, playerIndex) => {
    const holeCards = player.hand.filter((card): card is Card => card !== null).map(convertToPokerCalcCard);
    if (holeCards.length === 2) {
      calculator.addHand(`${holeCards[0]}${holeCards[1]}`);
      playerIndexToResultIndex.push(playerIndex);
    }
  });
  
  // Add any existing community cards to the board
  const board = [
    ...communityCards.flop,
    communityCards.turn,
    communityCards.river
  ]
    .filter((card): card is Card => card !== null)
    .map(convertToPokerCalcCard);
  if (board.length > 0) {
    calculator.setBoard(board.join(''));
  }
  
  // Calculate equity
  // Note: iterations is supported by the library; use it to control Monte Carlo runs
  const options = typeof iterations === 'number' ? { iterations } : {};
  const result = await calculator.calculateEquity(options as any);
  
  const totalHands = result.totalHands || 0;
  
  // Build a map from added-hand order to corresponding player index
  // playerIndexToResultIndex holds player indexes in the same order as hands were added
  return players.map((player, playerIndex) => {
    const addedOrderIndex = playerIndexToResultIndex.indexOf(playerIndex);
    if (addedOrderIndex === -1) {
      // Player not included in calculation (incomplete hand)
      return {
        ...player,
        equity: 0,
        winPercentage: 0,
        tiePercentage: 0
      };
    }
    const playerResult = result.playerResults[addedOrderIndex];
    const equityPct = Number((playerResult.equity * 100).toFixed(2));
    const winsPct = totalHands > 0 ? Number(((playerResult.wins / totalHands) * 100).toFixed(2)) : 0;
    const tiesPct = totalHands > 0 ? Number(((playerResult.ties / totalHands) * 100).toFixed(2)) : 0;
    return {
      ...player,
      equity: equityPct,
      winPercentage: winsPct,
      tiePercentage: tiesPct
    };
  });
};