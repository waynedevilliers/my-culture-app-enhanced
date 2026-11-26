"use client";

import { useUser } from '../contexts/UserContext.jsx';
import { Navigate } from "@/lib/router";

const Authorize = ({ roles, children }) => {
  const { user } = useUser();
  return <> {roles.includes(user.role) ? children : <Navigate to="/" />} </>;
};

export default Authorize;
