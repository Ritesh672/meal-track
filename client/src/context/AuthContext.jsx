import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../config/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axiosInstance.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Error fetching user', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      throw err.response?.data || { message: 'Login failed' };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await axiosInstance.post('/auth/register', { email, password });

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      
      // Create a profile
      await axiosInstance.post('/user/profile', { 
        full_name: name, 
        fitness_level: 'beginner' 
      });

      return res.data.user;
    } catch (err) {
      throw err.response?.data || { message: 'Signup failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
