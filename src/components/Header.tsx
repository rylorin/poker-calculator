import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { GameVariant } from '../types';

interface HeaderProps {
  gameVariant: GameVariant;
  onChangeGameVariant: (variant: GameVariant) => void;
}

const Header: React.FC<HeaderProps> = ({ gameVariant, onChangeGameVariant }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getGameTitle = (): string => {
    switch (gameVariant) {
      case 'texas-holdem':
        return 'Texas Hold\'em Equity Calculator';
      case 'omaha-high':
        return 'Omaha High Equity Calculator';
      case 'omaha-hi-lo':
        return 'Omaha Hi/Lo Equity Calculator';
      default:
        return 'Poker Equity Calculator';
    }
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">{getGameTitle()}</h1>
        
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
              <div className="py-1">
                <button
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    gameVariant === 'texas-holdem' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    onChangeGameVariant('texas-holdem');
                    setIsMenuOpen(false);
                  }}
                >
                  Texas Hold'em
                </button>
                <button
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    gameVariant === 'omaha-high' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    onChangeGameVariant('omaha-high');
                    setIsMenuOpen(false);
                  }}
                >
                  Omaha High
                </button>
                <button
                  className={`block px-4 py-2 text-sm w-full text-left ${
                    gameVariant === 'omaha-hi-lo' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    onChangeGameVariant('omaha-hi-lo');
                    setIsMenuOpen(false);
                  }}
                >
                  Omaha Hi/Lo
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  className="block px-4 py-2 text-sm w-full text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    // TODO: Open settings
                    setIsMenuOpen(false);
                  }}
                >
                  Settings
                </button>
                <button
                  className="block px-4 py-2 text-sm w-full text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    // TODO: Open help
                    setIsMenuOpen(false);
                  }}
                >
                  Help
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;