import React from 'react';
import { Button } from '@/components/ui/button';
import { calculatePagination, generatePageNumbers } from '@/lib/pagination';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
  viewMode?: 'compact' | 'gallery' | 'master' | 'map';
}

function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = '',
  viewMode,
}: PaginationProps) {
  const pagination = calculatePagination(currentPage, pageSize, totalItems);
  const pageNumbers = generatePageNumbers(currentPage, pagination.totalPages);

  // Always show pagination info, even for single page, to provide feedback
  if (totalItems === 0) return null;

  // For map view, limit page size options to avoid performance issues
  const getPageSizeOptions = () => {
    if (viewMode === 'map') {
      return [
        { value: 25, label: '25' },
        { value: 50, label: '50' }
      ];
    }
    
    return [
      { value: 25, label: '25' },
      { value: 50, label: '50' },
      { value: 100, label: '100' }
    ];
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mt-6 ${className}`}>
      {/* Items info - Mobile enhanced */}
      <div className="text-xs sm:text-sm text-white/70 order-2 sm:order-1">
        Showing {pagination.startItem}-{pagination.endItem} of {pagination.totalItems} entries
      </div>

      {/* Pagination controls - Mobile first */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
          {/* Previous button */}
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm touch-manipulation"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">‹</span>
          </Button>

          {/* Page numbers - Responsive display */}
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            {pageNumbers.map((page, index) => (
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-white/50 text-xs sm:text-sm">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  onClick={() => onPageChange(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={`${
                    currentPage === page
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  } px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm min-w-[32px] sm:min-w-[36px] touch-manipulation`}
                >
                  {page}
                </Button>
              )
            ))}
          </div>

          {/* Next button */}
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm touch-manipulation"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">›</span>
          </Button>
        </div>
      )}

      {/* Page size selector - Mobile enhanced */}
      {onPageSizeChange && (
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-white/70 order-3">
          <span className="hidden sm:inline">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newPageSize = parseInt(e.target.value);
              onPageSizeChange(newPageSize);
            }}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs sm:text-sm touch-manipulation"
            style={{ fontSize: '16px' }} // Prevent iOS zoom
          >
            {getPageSizeOptions().map(option => (
              <option key={option.value} value={option.value} className="bg-gray-800">
                {option.label}
              </option>
            ))}
          </select>
          <span className="hidden sm:inline">entries</span>
          {viewMode === 'map' && (
            <span className="text-xs text-blue-400 hidden sm:inline ml-2">
              (Limited for map performance)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Pagination;
