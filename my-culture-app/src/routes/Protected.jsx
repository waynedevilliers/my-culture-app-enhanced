"use client";

import { useUser } from '../contexts/UserContext.jsx';
import { Navigate } from "@/lib/router";

const Protected = ({ children }) => {
  const { user, isLoading } = useUser();
  return <>{!isLoading && <> {user ? children : <Navigate to="/" />}</>}</>
};

export default Protected;
