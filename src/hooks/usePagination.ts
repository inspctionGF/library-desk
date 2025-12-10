import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  paginatedData: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setItemsPerPage: (items: number) => void;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function usePagination<T>({ 
  data, 
  itemsPerPage: initialItemsPerPage = 10 
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Reset to page 1 if current page exceeds total pages
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  const paginatedData = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, safePage, itemsPerPage]);

  const startIndex = (safePage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(safePage * itemsPerPage, totalItems);

  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const previousPage = () => goToPage(currentPage - 1);

  const setItemsPerPage = (items: number) => {
    setItemsPerPageState(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    currentPage: safePage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    previousPage,
    setItemsPerPage,
    itemsPerPage,
    startIndex: totalItems > 0 ? startIndex : 0,
    endIndex,
    totalItems,
  };
}
