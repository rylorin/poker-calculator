import React from 'react';
import { Card as CardType,  } from '../types';
import { getCardColor, getSuitSymbol } from '../utils/cardUtils';

interface CardProps {
  card: CardType | null;
  onClick?: () => void;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  selectable?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  selected = false, 
  size = 'md',
  selectable = true
}) => {
  const sizeClasses = {
    sm: 'w-10 h-14',
    md: 'w-16 h-20',
    lg: 'w-20 h-28'
  };
  
  const fontSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  if (!card) {
    return (
      <div 
        className={`${sizeClasses[size]} bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all`}
        onClick={onClick}
      >
        <span className="text-4xl text-gray-400 dark:text-gray-500">?</span>
      </div>
    );
  }

  const { rank, suit } = card;
  const cardColor = getCardColor(suit);
  const symbol = getSuitSymbol(suit);
  
  return (
    <div 
      className={`${sizeClasses[size]} bg-white rounded-lg flex flex-col items-center justify-between p-1 shadow
                ${selected ? 'border-2 border-yellow-500' : 'border border-gray-300'} 
                ${selectable ? 'cursor-pointer hover:shadow-md' : ''} transition-all`}
      onClick={selectable ? onClick : undefined}
    >
      <div className={`self-start pl-1 ${fontSizes[size]} ${cardColor} font-bold`}>
        {rank}
      </div>
      <div className={`${fontSizes[size]} ${cardColor} text-2xl mb-1`}>
        {symbol}
      </div>
      <div className={`self-end pr-1 ${fontSizes[size]} ${cardColor} font-bold rotate-180`}>
        {rank}
      </div>
    </div>
  );
};

export default Card;