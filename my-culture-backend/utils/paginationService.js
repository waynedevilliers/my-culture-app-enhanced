export const createPaginatedResponse = (entries, page, limit) => {
  const totalCount = entries.count;
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    results: entries.rows
  };
};

export const getPaginatedData = async (model, options = {}) => {
  const { page, limit, offset } = options.pagination;
  const { where, include, order, attributes } = options;

  const queryOptions = {
    offset,
    limit,
    order: order || [["createdAt", "DESC"]],
    ...( where && { where } ),
    ...( include && { include } ),
    ...( attributes && { attributes } )
  };

  const entries = await model.findAndCountAll(queryOptions);
  return createPaginatedResponse(entries, page, limit);
};