import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Pagination from '../components/common/Pagination.jsx';

describe('Pagination Component', () => {
  const mockOnPageChange = vi.fn();

  const defaultProps = {
    page: 2,
    totalPages: 5,
    hasNextPage: true,
    hasPreviousPage: true,
    onPageChange: mockOnPageChange,
  };

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  test('renders pagination with correct page numbers', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('highlights current page', () => {
    render(<Pagination {...defaultProps} />);
    
    const currentPageButton = screen.getByText('2');
    expect(currentPageButton).toHaveClass('btn-active');
  });

  test('calls onPageChange when page button is clicked', () => {
    render(<Pagination {...defaultProps} />);
    
    const pageButton = screen.getByText('3');
    fireEvent.click(pageButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  test('calls onPageChange when next button is clicked', () => {
    render(<Pagination {...defaultProps} />);
    
    const nextButton = screen.getByText('»');
    fireEvent.click(nextButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  test('calls onPageChange when previous button is clicked', () => {
    render(<Pagination {...defaultProps} />);
    
    const prevButton = screen.getByText('«');
    fireEvent.click(prevButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  test('disables previous button on first page', () => {
    const props = {
      ...defaultProps,
      page: 1,
      hasPreviousPage: false,
    };
    
    render(<Pagination {...props} />);
    
    const prevButton = screen.getByText('«').closest('button');
    expect(prevButton).toBeDisabled();
  });

  test('disables next button on last page', () => {
    const props = {
      ...defaultProps,
      page: 5,
      hasNextPage: false,
    };
    
    render(<Pagination {...props} />);
    
    const nextButton = screen.getByText('»').closest('button');
    expect(nextButton).toBeDisabled();
  });

  test('shows loading state', () => {
    const props = {
      ...defaultProps,
      loading: true,
    };
    
    render(<Pagination {...props} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  test('shows info when showInfo is true', () => {
    const props = {
      ...defaultProps,
      showInfo: true,
      totalCount: 50,
    };
    
    render(<Pagination {...props} />);
    
    expect(screen.getByText(/Showing page 2 of 5/)).toBeInTheDocument();
    expect(screen.getByText(/50 total items/)).toBeInTheDocument();
  });

  test('does not render when totalPages is 1', () => {
    const props = {
      ...defaultProps,
      totalPages: 1,
    };
    
    const { container } = render(<Pagination {...props} />);
    
    expect(container.firstChild).toBeNull();
  });
});