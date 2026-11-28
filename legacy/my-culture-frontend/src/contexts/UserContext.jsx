import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { getUserInitials } from '../utils/userUtils.js';

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
      const response = await axios.post(import.meta.env.VITE_BACKEND + '/api/auth/login', payload);
      setUser(response.data.user);
      localStorage.setItem("token", response.data.token);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  }

  async function logout() {
    setUser(null);
    localStorage.removeItem("token");
  }

  async function register(payload) {
    const {
      data: { user, token },
    } = await axios.post(import.meta.env.VITE_BACKEND + '/api/users', payload);

    setUser(user);
    localStorage.setItem("token", token);
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.get(import.meta.env.VITE_BACKEND + '/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(({ data }) => {
        setUser(data);
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
  }, [user])

  return (
    <UserContext.Provider value={{ user, login, logout, register, isLoading, initials, setUser }}>
      {children}
    </UserContext.Provider>
  );
}