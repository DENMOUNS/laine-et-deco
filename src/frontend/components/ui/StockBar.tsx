import React from 'react';

interface StockBarProps {
  currentStock: number;
  lastReplenishmentQty: number;
}

export const StockBar: React.FC<StockBarProps> = ({ currentStock, lastReplenishmentQty }) => {
  const total = lastReplenishmentQty || 50; 
  const percentage = Math.min(Math.max((currentStock / total) * 100, 0), 100);
  
  let barColor = "bg-green-600"; // Vert par défaut (ex: reste 40/50)
  
  // Si le stock est presque plein (il manque 5 ou moins, ex: 45/50) -> Rouge sang
  if (total - currentStock <= 5) {
    barColor = "bg-red-800";
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden" title={`${currentStock} restants`}>
      <div 
        className={`${barColor} h-4 rounded-full transition-all duration-300`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};