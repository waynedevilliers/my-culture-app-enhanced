import { describe, test, expect } from '@jest/globals';
import { createPaginatedResponse, getPaginatedData } from '../utils/paginationService.js';

describe('Pagination Service', () => {
  describe('createPaginatedResponse', () => {
    test('should create correct pagination response', () => {
      const mockEntries = {
        count: 25,
        rows: [{ id: 1 }, { id: 2 }, { id: 3 }],
      };

      const result = createPaginatedResponse(mockEntries, 2, 10);

      expect(result).toEqual({
        totalCount: 25,
        totalPages: 3,
        currentPage: 2,
        hasNextPage: true,
        hasPreviousPage: true,
        results: [{ id: 1 }, { id: 2 }, { id: 3 }],
      });
    });

    test('should handle first page correctly', () => {
      const mockEntries = {
        count: 15,
        rows: [{ id: 1 }],
      };

      const result = createPaginatedResponse(mockEntries, 1, 10);

      expect(result.hasPreviousPage).toBe(false);
      expect(result.hasNextPage).toBe(true);
    });

    test('should handle last page correctly', () => {
      const mockEntries = {
        count: 15,
        rows: [{ id: 1 }],
      };

      const result = createPaginatedResponse(mockEntries, 2, 10);

      expect(result.hasPreviousPage).toBe(true);
      expect(result.hasNextPage).toBe(false);
    });

    test('should handle single page correctly', () => {
      const mockEntries = {
        count: 5,
        rows: [{ id: 1 }],
      };

      const result = createPaginatedResponse(mockEntries, 1, 10);

      expect(result.hasPreviousPage).toBe(false);
      expect(result.hasNextPage).toBe(false);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('getPaginatedData', () => {
    test('should call model with correct parameters', async () => {
      const mockModel = {
        findAndCountAll: jest.fn().mockResolvedValue({
          count: 10,
          rows: [{ id: 1 }],
        }),
      };

      const options = {
        pagination: { page: 1, limit: 5, offset: 0 },
        where: { published: true },
        include: [{ model: 'User' }],
      };

      await getPaginatedData(mockModel, options);

      expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
        offset: 0,
        limit: 5,
        order: [['createdAt', 'DESC']],
        where: { published: true },
        include: [{ model: 'User' }],
      });
    });
  });
});