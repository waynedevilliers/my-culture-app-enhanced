import UserList from '../../components/admin/UserList.jsx';

const Users = () => {
  return (
    <section id="dashboard-users" className="flex flex-col items-center h-full mt-20 gap-4 px-4">
      <h1 className="max-w-screen-xl w-full border-b-2 border-accent text-4xl font-bold text-center pb-4">Benutzer</h1>
      <UserList />
    </section>
  );
};

export default Users;
