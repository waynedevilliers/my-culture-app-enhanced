import { usePaginatedApi } from '../../hooks/usePaginatedApi.js';
import Pagination from '../common/Pagination.jsx';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import UserEditModal from './UserEditModal.jsx';

const UserList = () => {
  const { t } = useTranslation();
  const [editingUser, setEditingUser] = useState(null);
  
  console.log('UserList component loaded with edit functionality');
  
  const {
    data: users,
    loading,
    page,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    deleteItem,
    refresh
  } = usePaginatedApi('/users');

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleDelete = (user) => {
    if (window.confirm(t('admin.messages.confirmDelete', { name: `${user.firstName} ${user.lastName}` }))) {
      deleteItem(user.id);
    }
  };

  const handleUpdateSuccess = () => {
    setEditingUser(null);
    refresh();
  };

  return (
    <div className="overflow-x-auto flex flex-col max-w-screen-xl w-full justify-center items-center gap-4">
      <label className="input input-bordered flex items-center gap-2 w-full"> {t('admin.tables.search')}
        <input type="search" className="grow" placeholder={t('admin.tables.searchPlaceholder')} />
      </label>
      <table className="table table-xs table-zebra mb-4">
        <thead className="bg-secondary text-white">
        <tr>
          <th></th>
          <th className="hidden sm:table-cell">{t('admin.tables.firstName')}</th>
          <th className="hidden sm:table-cell">{t('admin.tables.lastName')}</th>
          <th>{t('admin.tables.email')}</th>
          <th className="hidden md:table-cell">{t('admin.tables.registered')}</th>
          <th className="hidden sm:table-cell">{t('admin.tables.access')}</th>
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
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(user)}
                  className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors"
                >
                  {t('admin.tables.edit')}
                </button>
                <button 
                  onClick={() => handleDelete(user)}
                  className="btn btn-ghost btn-xs hover:bg-transparent hover:text-error transform duration-300 transition-colors"
                >
                  {t('admin.tables.delete')}
                </button>
              </div>
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
      
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default UserList;
