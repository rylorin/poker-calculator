import React from 'react';

interface ResultDisplayProps {
  isExact: boolean;
  simulationCount?: number;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ isExact, simulationCount }) => {
  return (
    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow mt-4">
      {isExact ? (
        <p className="text-green-600 dark:text-green-400 font-medium">
          All combinations checked, result is exact.
        </p>
      ) : (
        <p className="text-blue-600 dark:text-blue-400 font-medium">
          Result calculated using Monte Carlo simulation ({simulationCount?.toLocaleString()} iterations)
        </p>
      )}
    </div>
  );
};

export default ResultDisplay;