import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { auth as authApi } from "../services/api"
import type { User } from "../types"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem("easyhealth_token")
    const savedUser = localStorage.getItem("easyhealth_user")
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    localStorage.setItem("easyhealth_token", response.token)
    localStorage.setItem("easyhealth_user", JSON.stringify(response.user))
    setToken(response.token)
    setUser(response.user)
  }

  const register = async (data: any) => {
    const response = await authApi.register(data)
    localStorage.setItem("easyhealth_token", response.token)
    localStorage.setItem("easyhealth_user", JSON.stringify(response.user))
    setToken(response.token)
    setUser(response.user)
  }

  const logout = () => {
    localStorage.removeItem("easyhealth_token")
    localStorage.removeItem("easyhealth_user")
    setToken(null)
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
