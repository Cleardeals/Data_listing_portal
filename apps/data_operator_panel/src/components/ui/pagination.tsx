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
    // Calculate what page the user should be on with the new page size
    const currentFirstItem = (currentPage - 1) * pageSize + 1;
    const newPage = Math.ceil(currentFirstItem / newPageSize);
    onPageSizeChange(newPageSize);
    onPageChange(newPage);
  };

  return (
    <div className={`flex items-center justify-between mt-6 p-4 bg-white border rounded-lg ${className}`}>
      {/* Items info */}
      <div className="text-sm text-gray-600">
        Showing {pagination.startItem}-{pagination.endItem} of {pagination.totalItems} entries
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          className="px-3 py-1 text-sm border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => (
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 text-sm border rounded-md ${
                  currentPage === page
                    ? "bg-[#167F92] text-white border-[#167F92]"
                    : "bg-white hover:bg-gray-50 text-gray-700"
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="px-3 py-1 text-sm border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          Next
        </button>
      </div>

      {/* Page size selector */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Show:</span>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
          className="border rounded px-2 py-1"
        >
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="500">500</option>
          <option value="1000">1000</option>
        </select>
        <span>entries</span>
      </div>
    </div>
  );
};

export default Pagination;
