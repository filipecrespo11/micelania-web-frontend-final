import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Optimistically mark authenticated so UI stays logged in while we verify in background
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setIsAuthenticated(true)
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const res = await axios.get('https://micelania-app.onrender.com/auth/verify')
      if (res.status === 200) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        setIsAuthenticated(false)
      }
    } catch (err) {
      console.error('Erro ao verificar token:', err)
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setIsAuthenticated(false)
    navigate('/login')
  }

  const login = (token) => {
    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setIsAuthenticated(true)
  }

  return {
    isAuthenticated,
    loading,
    login,
    logout
  }
}
