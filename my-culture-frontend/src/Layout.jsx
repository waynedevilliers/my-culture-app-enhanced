import { Outlet } from 'react-router-dom';
import Header from './sections/Header.jsx';
import Footer from './sections/Footer.jsx';
import LoginForm from './components/login/LoginForm.jsx';

const Layout = () => {
  return (
    <>
      <Header />
      <LoginForm />
      <Outlet />
      <Footer />
    </>
  );
};

export default Layout;
