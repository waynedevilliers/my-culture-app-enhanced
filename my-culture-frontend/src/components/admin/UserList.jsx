import { usePaginatedApi } from '../../hooks/usePaginatedApi.js';
import Pagination from '../common/Pagination.jsx';

const UserList = () => {
  const {
    data: users,
    loading,
    page,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    deleteItem
  } = usePaginatedApi('/users');

  return (
    <div className="overflow-x-auto flex flex-col max-w-screen-xl w-full justify-center items-center gap-4">
      <label className="input input-bordered flex items-center gap-2 w-full"> Search
        <input type="search" className="grow" placeholder="..." />
      </label>
      <table className="table table-xs table-zebra mb-4">
        <thead className="bg-secondary text-white">
        <tr>
          <th></th>
          <th className="hidden sm:table-cell">Vorname</th>
          <th className="hidden sm:table-cell">Nachname</th>
          <th>Email</th>
          <th className="hidden md:table-cell">Registriert</th>
          <th className="hidden sm:table-cell">Zugriff</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        {users && users.map((user) => (
          <tr key={user.id}>
            <th>{user.id}</th>
            <td className="hidden sm:table-cell">{user.firstName}</td>
            <td className="hidden sm:table-cell">{user.lastName}</td>
            <td>{user.email}</td>
            <td className="hidden md:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
            <td className="hidden sm:table-cell">{user.role}</td>
            <td>
              <button className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors">bearbeiten</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
      
      {loading && (
        <div className="flex justify-center items-center py-4">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      )}
      
      <Pagination
        page={page}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={goToPage}
        loading={loading}
        totalCount={totalCount}
      />
    </div>
  );
};

export default UserList;
