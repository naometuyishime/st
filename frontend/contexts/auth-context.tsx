"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import type { User, AuthContextType } from "@/types"
import { api } from "@/lib/api"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const decodeToken = (token: string): { userId: string; role: string } | null => {
    try {
      const payload = token.split(".")[1]
      const decoded = JSON.parse(atob(payload))
      return { userId: decoded.userId, role: decoded.role }
    } catch (error) {
      console.error("Error decoding token:", error)
      return null
    }
  }

  const fetchUserProfile = async (authToken: string): Promise<User | null> => {
    try {
      const userData = await api.getProfile(authToken)
      if (!userData) throw new Error("No user data received from profile endpoint")
      return userData
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("smt-user")
        const storedToken = localStorage.getItem("smt-token")

        if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
          setToken(storedToken)
          try {
            const userData = await fetchUserProfile(storedToken)
            if (userData) {
              setUser(userData)
              localStorage.setItem("smt-user", JSON.stringify(userData))
            } else if (storedUser) {
              setUser(JSON.parse(storedUser))
            }
          } catch (error) {
            console.error("Error fetching profile during init:", error)
            if (storedUser) setUser(JSON.parse(storedUser))
          }
        } else {
          localStorage.removeItem("smt-user")
        }
      } catch (error) {
        console.error("Error initializing auth state:", error)
        localStorage.removeItem("smt-user")
        localStorage.removeItem("smt-token")
      } finally {
        setIsLoading(false)
      }
    }
    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await api.login(email, password)
      if (!response.token) throw new Error("No token received")

      const userData = await fetchUserProfile(response.token)
      if (!userData) throw new Error("Failed to fetch user profile")

      if (!userData.email) userData.email = email

      setUser(userData)
      setToken(response.token)
      localStorage.setItem("smt-user", JSON.stringify(userData))
      localStorage.setItem("smt-token", response.token)

      return true
    } catch (err) {
      console.error("Login failed:", err)
      localStorage.removeItem("smt-user")
      localStorage.removeItem("smt-token")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("smt-user")
    localStorage.removeItem("smt-token")
  }

  const refreshUser = async (): Promise<boolean> => {
    if (!token) return false
    try {
      const userData = await fetchUserProfile(token)
      if (userData) {
        setUser(userData)
        localStorage.setItem("smt-user", JSON.stringify(userData))
        return true
      }
      return false
    } catch (error) {
      console.error("Error refreshing user data:", error)
      return false
    }
  }

  // ✅ Add new permission: manage_organization (admins only)
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    const perms: Record<string, string[]> = {
      admin: [
        "manage_system",
        "manage_users",
        "export_data",
        "manage_all_kpis",
        "manage_all_stakeholders",
        "manage_organization", // ✅ new permission
      ],
      subclusterfocalperson: [
        "export_data",
        "view_reports",
        "manage_subcluster_kpis",
        "manage_subcluster_users",
        "manage_subcluster_stakeholders",
      ],
      stakeholder_admin: [
        "manage_stakeholder_users",
        "update_profile",
        "view_reports",
        "export_data",
      ],
      stakeholder_user: ["create_action_plans", "view_own_reports", "update_profile"],
    }
    return perms[user.role]?.includes(permission) || false
  }

  const canManageStakeholder = (stakeholderId: string): boolean => {
    if (!user) return false
    if (user.role === "admin") return true
    if (user.role === "subclusterfocalperson") return true
    if (user.role === "stakeholder_admin") return user.stakeholderId === stakeholderId
    return false
  }

  const canManageKPI = (kpiSubClusterId: string): boolean => {
    if (!user) return false
    if (user.role === "admin") return true
    if (["subclusterfocalperson", "stakeholder_admin"].includes(user.role)) {
      return user.subClusters?.some(subCluster => subCluster.id === kpiSubClusterId) || false
    }
    return false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        hasPermission,
        canManageStakeholder,
        canManageKPI,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
