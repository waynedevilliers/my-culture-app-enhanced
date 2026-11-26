'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { getUserInitials } from '../utils/userUtils.js';

const API = process.env.NEXT_PUBLIC_BACKEND ?? '';

// The API uses ADMIN / SUPER_ADMIN; the UI was written for admin / superAdmin.
const UI_ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'superAdmin',
  MODERATOR: 'moderator',
  USER: 'user',
};

export const DASHBOARD_ROLES = ['admin', 'superAdmin'];

function toUiUser(apiUser) {
  if (!apiUser) return null;
  return { ...apiUser, role: UI_ROLES[apiUser.role] ?? apiUser.role };
}

const UserContext = createContext(undefined);

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initials, setInitials] = useState(null);

  async function login(payload) {
    try {
      const response = await axios.post(API + '/api/auth/login', payload);
      setUser(toUiUser(response.data.data.user));
      localStorage.setItem('token', response.data.data.token);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  }

  async function logout() {
    setUser(null);
    localStorage.removeItem('token');
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(API + '/api/auth/me', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        .then(({ data }) => {
          setUser(toUiUser(data.data));
        })
        .catch(() => {
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setInitials(getUserInitials(user.firstName, user.lastName));
    } else setInitials(null);
  }, [user]);

  return (
    <UserContext.Provider
      value={{ user, login, logout, isLoading, initials, setUser }}
    >
      {children}
    </UserContext.Provider>
  );
}
