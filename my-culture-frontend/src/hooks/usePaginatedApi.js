import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const usePaginatedApi = (endpoint, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const { 
    limit = 10, 
    searchParams = {}, 
    includeAuth = true,
    onError,
    onSuccess 
  } = options;

  const fetchData = useCallback(async (pageNumber = page) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNumber,
        limit,
        ...searchParams
      });

      const config = includeAuth ? {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      } : {};

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND}/api${endpoint}?${params}`,
        config
      );

      const { results, totalPages: pages, totalCount: count, hasNextPage: next, hasPreviousPage: prev } = response.data;
      
      setData(results || []);
      setTotalPages(pages || 1);
      setTotalCount(count || 0);
      setHasNextPage(next || false);
      setHasPreviousPage(prev || false);

      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error fetching data';
      if (onError) {
        onError(error);
      } else {
        toast.error(errorMessage);
      }
      
      // Reset to safe state on error
      setData([]);
      setTotalPages(1);
      setTotalCount(0);
      setHasNextPage(false);
      setHasPreviousPage(false);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, limit, searchParams, includeAuth, onError, onSuccess, loading]);

  useEffect(() => {
    fetchData(page);
  }, [fetchData]);

  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
    }
  }, [page, totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) goToPage(page + 1);
  }, [hasNextPage, page, goToPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) goToPage(page - 1);
  }, [hasPreviousPage, page, goToPage]);

  const refresh = useCallback(() => {
    fetchData(page);
  }, [fetchData, page]);

  const deleteItem = useCallback(async (id) => {
    try {
      const config = includeAuth ? {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      } : {};

      await axios.delete(`${import.meta.env.VITE_BACKEND}/api${endpoint}/${id}`, config);
      toast.success("Item deleted successfully");
      refresh();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete item';
      toast.error(errorMessage);
    }
  }, [endpoint, includeAuth, refresh]);

  return {
    data,
    loading,
    page,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    pageNumbers: Array.from({ length: totalPages }, (_, i) => i + 1),
    goToPage,
    nextPage,
    previousPage,
    refresh,
    deleteItem
  };
};