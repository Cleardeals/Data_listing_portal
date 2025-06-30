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
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = '',
}) => {
  const pagination = calculatePagination(currentPage, pageSize, totalItems);
  const pageNumbers = generatePageNumbers(currentPage, pagination.totalPages);

  // Always show pagination info, even for single page, to provide feedback
  if (totalItems === 0) return null;

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
            <option value="25" className="bg-gray-800">25</option>
            <option value="50" className="bg-gray-800">50</option>
            <option value="100" className="bg-gray-800">100</option>
          </select>
          <span>entries</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;
