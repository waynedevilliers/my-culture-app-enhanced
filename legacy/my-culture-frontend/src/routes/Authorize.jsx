import { useUser } from '../contexts/UserContext.jsx';
import { Navigate, Outlet } from 'react-router-dom';

const Authorize = ({ roles }) => {
  const { user } = useUser();
  return <> {roles.includes(user.role) ? <Outlet /> : <Navigate to="/" />} </>;
};

export default Authorize;
