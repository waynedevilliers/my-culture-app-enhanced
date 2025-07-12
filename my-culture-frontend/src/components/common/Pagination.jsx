const Pagination = ({ 
  page, 
  totalPages, 
  hasNextPage, 
  hasPreviousPage, 
  onPageChange,
  loading = false,
  showInfo = true,
  totalCount = 0
}) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handlePrevious = () => {
    if (hasPreviousPage && !loading) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage && !loading) {
      onPageChange(page + 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page && !loading) {
      onPageChange(pageNumber);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-4 mt-6">
      {showInfo && totalCount > 0 && (
        <div className="text-sm text-gray-600">
          Showing page {page} of {totalPages} ({totalCount} total items)
        </div>
      )}
      
      <div className="join">
        <button 
          className={`join-item btn ${!hasPreviousPage || loading ? 'btn-disabled' : ''}`}
          onClick={handlePrevious}
          disabled={!hasPreviousPage || loading}
        >
          {loading ? '...' : '«'}
        </button>

        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            className={`join-item btn btn-md ${
              page === pageNumber ? 'btn-active' : ''
            } ${loading ? 'btn-disabled' : ''}`}
            onClick={() => handlePageClick(pageNumber)}
            disabled={loading}
          >
            {pageNumber}
          </button>
        ))}

        <button 
          className={`join-item btn ${!hasNextPage || loading ? 'btn-disabled' : ''}`}
          onClick={handleNext}
          disabled={!hasNextPage || loading}
        >
          {loading ? '...' : '»'}
        </button>
      </div>
    </div>
  );
};

export default Pagination;