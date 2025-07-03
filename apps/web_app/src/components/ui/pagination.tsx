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

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = '',
  viewMode,
}) => {
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
    <div className={`flex items-center justify-between mt-6 ${className}`}>
      {/* Items info */}
      <div className="text-sm text-white/70">
        Showing {pagination.startItem}-{pagination.endItem} of {pagination.totalItems} entries
      </div>

      {/* Pagination controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </Button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((page, index) => (
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2 text-white/50">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  onClick={() => onPageChange(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={
                    currentPage === page
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }
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
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </Button>
        </div>
      )}

      {/* Page size selector */}
      {onPageSizeChange && (
        <div className="flex items-center space-x-2 text-sm text-white/70">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newPageSize = parseInt(e.target.value);
              onPageSizeChange(newPageSize);
            }}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
          >
            {getPageSizeOptions().map(option => (
              <option key={option.value} value={option.value} className="bg-gray-800">
                {option.label}
              </option>
            ))}
          </select>
          <span>entries</span>
          {viewMode === 'map' && (
            <span className="text-xs text-blue-400 ml-2">
              (Limited for map performance)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Pagination;
