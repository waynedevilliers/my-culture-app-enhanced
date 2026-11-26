"use client";

import Header from './sections/Header.jsx';
import Footer from './sections/Footer.jsx';
import LoginForm from './components/login/LoginForm.jsx';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <LoginForm />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
