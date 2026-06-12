import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ token: null, email: null, role: null })

  useEffect(() => {
    setAuth({
      token: localStorage.getItem('token'),
      email: localStorage.getItem('email'),
      role: localStorage.getItem('role')
    })
  }, [])

  return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>
}
