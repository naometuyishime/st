"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { User } from "@/types"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface UsersContextType {
  users: User[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (data: { username: string; email: string; role: User['role']; password?: string; phone?: string; extra?: any }) => Promise<User | null>
  update: (id: string, data: Partial<User>) => Promise<User | null>
  remove: (id: string) => Promise<boolean>
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    if (!token) return
    setIsLoading(true)
    setError(null)
    try {
      const list = await api.getUsers(token)
      setUsers(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const create = async (data: { username: string; email: string; role: User['role']; password?: string; phone?: string; extra?: any }) => {
    try {
      const tempPassword = data.password || Math.random().toString(36).slice(-10)
      const res = await api.register(data.username, data.email, tempPassword, data.role)
      const newUser = res.user as User
      setUsers(prev => [newUser, ...prev])
      return newUser
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create user")
      return null
    }
  }

  const update = async (id: string, data: Partial<User>) => {
    if (!token) return null
    try {
      const res = await api.updateUser(token, id, data)
      const updated = res.user
      setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updated } : u)))
      return updated
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update user")
      return null
    }
  }

  const remove = async (id: string) => {
    if (!token) return false
    try {
      await api.deleteUser(token, id)
      setUsers(prev => prev.filter(u => u.id !== id))
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete user")
      return false
    }
  }

  const value = useMemo(
    () => ({ users, isLoading, error, refresh: fetchUsers, create, update, remove }),
    [users, isLoading, error]
  )

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
}

export function useUsers() {
  const ctx = useContext(UsersContext)
  if (!ctx) throw new Error("useUsers must be used within UsersProvider")
  return ctx
}
