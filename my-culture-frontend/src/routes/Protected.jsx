import { useUser } from '../contexts/UserContext.jsx';
import { Navigate, Outlet } from 'react-router-dom';

const Protected = () => {
  const { user, isLoading } = useUser();
  return <>{!isLoading && <> {user ? <Outlet /> : <Navigate to="/" />}</>}</>
};

export default Protected;
