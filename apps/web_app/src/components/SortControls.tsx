import React from 'react';

interface SortControlsProps {
  sortColumn: 'serial_number' | 'rent_or_sell_price' | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: 'serial_number' | 'rent_or_sell_price') => void;
  onClearSort?: () => void;
  className?: string;
}

const SortControls: React.FC<SortControlsProps> = ({
  sortColumn,
  sortDirection,
  onSort,
  onClearSort,
  className = ''
}) => {
  const getSortIcon = (column: 'serial_number' | 'rent_or_sell_price') => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return '↕️';
  };

  const getSortLabel = (column: 'serial_number' | 'rent_or_sell_price') => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? 'Ascending' : 'Descending';
    }
    return 'Unsorted';
  };

  return (
    <div className={`flex items-center gap-4 p-4 backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white/90">🔄 Sort by:</span>
      </div>
      
      {/* Serial Number Sort */}
      <button
        onClick={() => onSort('serial_number')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
          sortColumn === 'serial_number'
            ? 'bg-blue-500/30 border-blue-400/50 text-blue-200 shadow-lg'
            : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white/90'
        }`}
        title={`Sort by Serial Number - ${getSortLabel('serial_number')}`}
      >
        <span className="text-lg">{getSortIcon('serial_number')}</span>
        <span className="text-sm font-medium">🔢 Serial Number</span>
        {sortColumn === 'serial_number' && (
          <span className="text-xs bg-blue-400/30 text-blue-200 px-2 py-1 rounded-full border border-blue-400/40">
            {sortDirection === 'asc' ? 'ASC' : 'DESC'}
          </span>
        )}
      </button>

      {/* Price Sort */}
      <button
        onClick={() => onSort('rent_or_sell_price')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
          sortColumn === 'rent_or_sell_price'
            ? 'bg-green-500/30 border-green-400/50 text-green-200 shadow-lg'
            : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white/90'
        }`}
        title={`Sort by Price - ${getSortLabel('rent_or_sell_price')}`}
      >
        <span className="text-lg">{getSortIcon('rent_or_sell_price')}</span>
        <span className="text-sm font-medium">💰 Price</span>
        {sortColumn === 'rent_or_sell_price' && (
          <span className="text-xs bg-green-400/30 text-green-200 px-2 py-1 rounded-full border border-green-400/40">
            {sortDirection === 'asc' ? 'ASC' : 'DESC'}
          </span>
        )}
      </button>

      {/* Clear Sort */}
      {sortColumn && onClearSort && (
        <button
          onClick={onClearSort}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-400/50 bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-red-200 transition-all duration-200"
          title="Clear sorting and return to default order"
        >
          <span className="text-sm">✕</span>
          <span className="text-sm font-medium">Clear</span>
        </button>
      )}

      {/* Sort Status Info */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
        <span className="text-xs text-white/60">
          {sortColumn ? (
            <>Sorted by <span className="text-white/80 font-medium">
              {sortColumn === 'serial_number' ? 'Serial Number' : 'Price'}
            </span> ({sortDirection === 'asc' ? 'Low to High' : 'High to Low'})</>
          ) : (
            'Default order (by date)'
          )}
        </span>
      </div>
    </div>
  );
};

export default SortControls;
