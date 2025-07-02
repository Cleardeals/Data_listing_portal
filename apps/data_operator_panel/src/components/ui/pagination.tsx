import React from 'react';
import { calculatePagination, generatePageNumbers } from '@/lib/pagination';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
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

  if (pagination.totalPages <= 1) return null;

  const handlePageSizeChange = (newPageSize: number) => {
    const currentFirstItem = (currentPage - 1) * pageSize + 1;
    const newPage = Math.ceil(currentFirstItem / newPageSize);
    onPageSizeChange(newPageSize);
    onPageChange(newPage);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 px-4 py-3 shadow-sm ${className}`}>
      {/* Mobile: Stack vertically, Desktop: Single row */}
      
      {/* 1. Page Size Selector */}
      <div className="flex items-center gap-2 text-sm text-slate-600 order-1 sm:order-1">
        <span className="font-medium hidden sm:inline">Show</span>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
          className="border border-slate-300 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
        >
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="500">500</option>
          <option value="1000">1000</option>
        </select>
        <span className="font-medium">per page</span>
      </div>

      {/* 2. Navigation Controls */}
      <div className="flex items-center gap-1 order-3 sm:order-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span className="hidden sm:inline">← Previous</span>
          <span className="sm:hidden">←</span>
        </button>

        <div className="flex items-center gap-1 mx-2">
          {/* Mobile: show fewer pages */}
          <div className="flex items-center gap-1 sm:hidden">
            {pageNumbers.slice(0, 3).map((page, index) => (
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-slate-500 text-xs">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-2 py-1.5 text-sm font-medium rounded-md border transition-colors duration-200 min-w-[32px] ${
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>
          
          {/* Desktop: show more pages */}
          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.slice(0, 5).map((page, index) => (
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2 py-1.5 text-slate-500">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors duration-200 ${
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="px-3 py-1.5 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <span className="hidden sm:inline">Next →</span>
          <span className="sm:hidden">→</span>
        </button>
      </div>

      {/* 3. Items Info */}
      <div className="text-sm text-slate-600 font-medium order-2 sm:order-3">
        <span className="text-slate-800">{pagination.startItem}-{pagination.endItem}</span>
        <span className="mx-1">of</span>
        <span className="text-slate-800">{pagination.totalItems.toLocaleString()}</span>
        <span className="ml-1 hidden sm:inline">items</span>
      </div>
    </div>
  );
};

export default Pagination;
