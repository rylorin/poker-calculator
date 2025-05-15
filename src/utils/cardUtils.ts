import { Card, Rank, Suit, HandType, Player } from '../types';
import { TexasHoldem, SixPlusHoldem, Omaha} from 'poker-odds-calc';
import type { IHand } from 'poker-odds-calc/dts/lib/Interfaces';

export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
export const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
};

export const getCardColor = (suit: Suit): string => {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
};

export const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case 'spades': return '♠';
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
  }
};

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

const convertToPokerCalcCard = (card: Card): string => {
  const suitMap: Record<Suit, string> = {
    'spades': 's',
    'hearts': 'h',
    'diamonds': 'd',
    'clubs': 'c'
  };
  
  return `${card.rank}${suitMap[card.suit]}`;
};

// Calculate equity using poker-odds-calc library
export const calculateEquity = (
  players: Player[],
  communityCards: { flop: (Card | null)[]; turn: Card | null; river: Card | null },
  iterations: number = 10000
): Player[] => {
  // Return default values if we don't have at least 2 players with cards
  const playersWithCards = players.filter(p => p.hand.length >= 2);
  if (playersWithCards.length < 2) {
    return players.map(player => ({
      ...player,
      equity: 100/players.length,
      winPercentage: 0,
      tiePercentage: 0
    }));
  }

  const calculator = new TexasHoldem();
  
  // Add player hands
  players.forEach(player => {
    if (player.hand.length > 0) {
      const cards = player.hand
        .filter((card): card is Card => card !== null)
        .map(convertToPokerCalcCard);
      if (cards.length === 2) {
        calculator.addPlayer(cards as IHand);
      }
    }
  });
  
  // Add community cards
  const board = [
    ...communityCards.flop,
    communityCards.turn,
    communityCards.river
  ]
    .filter((card): card is Card => card !== null)
    .map(convertToPokerCalcCard);
  
  if (board.length > 0) {
    calculator.setBoard(board);
  }
  
  // Calculate results
  const results = calculator.calculate();
  
  // Update player equity values
  return players.map((player, index) => {
    const result = results.getPlayers()[index];
    player.equity = Number(result.getWinsPercentage().toFixed(2))
    player.winPercentage=Number(result.getWinsPercentage().toFixed(2))
    player.tiePercentage=Number(result.getTiesPercentage().toFixed(2))
    return player;
  });
};