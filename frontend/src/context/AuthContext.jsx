import { createContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi.js'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ims_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('ims_token'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token && !user) {
      authApi
        .me()
        .then((res) => {
          setUser(res.data.data.user)
        })
        .catch(() => {
          setToken(null)
          setUser(null)
          localStorage.removeItem('ims_token')
          localStorage.removeItem('ims_user')
        })
    }
  }, [token])

  useEffect(() => {
    if (token) {
      localStorage.setItem('ims_token', token)
    } else {
      localStorage.removeItem('ims_token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('ims_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('ims_user')
    }
  }, [user])

  const login = async (payload) => {
    setLoading(true)
    try {
      const res = await authApi.login(payload)
      setUser(res.data.data.user)
      setToken(res.data.data.token)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ims_token')
    localStorage.removeItem('ims_user')
  }

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
