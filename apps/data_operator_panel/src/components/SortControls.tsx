import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

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
      return sortDirection === 'asc' ? (
        <FaSortUp className="text-blue-500" />
      ) : (
        <FaSortDown className="text-blue-500" />
      );
    }
    return <FaSort className="text-gray-400" />;
  };

  const getSortLabel = (column: 'serial_number' | 'rent_or_sell_price') => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? 'Ascending' : 'Descending';
    }
    return 'Unsorted';
  };

  return (
    <div className={`flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
      </div>
      
      {/* Serial Number Sort */}
      <button
        onClick={() => onSort('serial_number')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all duration-200 ${
          sortColumn === 'serial_number'
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
        }`}
        title={`Sort by Serial Number - ${getSortLabel('serial_number')}`}
      >
        {getSortIcon('serial_number')}
        <span className="text-sm font-medium">Serial Number</span>
        {sortColumn === 'serial_number' && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </button>

      {/* Price Sort */}
      <button
        onClick={() => onSort('rent_or_sell_price')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all duration-200 ${
          sortColumn === 'rent_or_sell_price'
            ? 'bg-blue-50 border-blue-300 text-blue-700'
            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
        }`}
        title={`Sort by Price - ${getSortLabel('rent_or_sell_price')}`}
      >
        {getSortIcon('rent_or_sell_price')}
        <span className="text-sm font-medium">Price</span>
        {sortColumn === 'rent_or_sell_price' && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </button>

      {/* Clear Sort */}
      {sortColumn && onClearSort && (
        <button
          onClick={onClearSort}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200"
          title="Clear sorting and return to default order"
        >
          <span className="text-sm">✕</span>
          <span className="text-sm font-medium">Clear</span>
        </button>
      )}

      {/* Sort Status Info */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
        <span className="text-xs text-gray-600">
          {sortColumn ? (
            <>Sorted by <span className="text-gray-800 font-medium">
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
