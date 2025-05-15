export type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds';
export type Rank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
export type Card = {
  rank: Rank;
  suit: Suit;
  selected?: boolean;
};

export type HandType = 
  | 'high card'
  | 'pair'
  | 'two pair'
  | 'three of a kind'
  | 'straight'
  | 'flush'
  | 'full house'
  | 'four of a kind'
  | 'straight flush'
  | 'royal flush';

export type GameVariant = 'texas-holdem' | 'omaha-high' | 'omaha-hi-lo';

export type Player = {
  id: number;
  hand: (Card|null)[];
  equity: number;
  winPercentage: number;
  tiePercentage: number;
  handStrength?: HandType;
};

export type CommunityCards = {
  flop: [Card | null, Card | null, Card | null];
  turn: Card | null;
  river: Card | null;
};

export type HandRange = {
  name: string;
  hands: string[];
};