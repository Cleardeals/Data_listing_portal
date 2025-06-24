export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationControls {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startItem: number;
  endItem: number;
  totalItems: number;
}

export const calculatePagination = (
  currentPage: number,
  pageSize: number,
  totalItems: number
): PaginationControls => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return {
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startItem,
    endItem,
    totalItems,
  };
};

export const generatePageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): (number | 'ellipsis')[] => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  const sidePages = Math.floor(maxVisible / 2);

  if (currentPage <= sidePages + 1) {
    // Show pages from start
    for (let i = 1; i <= maxVisible - 1; i++) {
      pages.push(i);
    }
    pages.push('ellipsis');
    pages.push(totalPages);
  } else if (currentPage >= totalPages - sidePages) {
    // Show pages from end
    pages.push(1);
    pages.push('ellipsis');
    for (let i = totalPages - (maxVisible - 2); i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show pages around current
    pages.push(1);
    pages.push('ellipsis');
    for (let i = currentPage - sidePages + 1; i <= currentPage + sidePages - 1; i++) {
      pages.push(i);
    }
    pages.push('ellipsis');
    pages.push(totalPages);
  }

  return pages;
};
