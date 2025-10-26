"use client"

import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { ThemeProvider } from "@/contexts/Theme-context"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"
import { useSearchParams, useRouter } from "next/navigation"

function AppContent() {
  const { user } = useAuth()
  const search = useSearchParams()
  const router = useRouter()

  const token = search.get("token")
  const email = search.get("email")
  if (token && email) {
    router.push(`/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
    return null
  }

  if (!user) {
    return <LoginForm />
  }

  return <Dashboard />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}