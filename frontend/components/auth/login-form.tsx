"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, ArrowLeft, Copyright, Eye, EyeOff } from "lucide-react" // ✨ IMPORT NEW ICONS
import { api } from "@/lib/api"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotStatus, setForgotStatus] = useState<string | null>(null)
  const [isForgotLoading, setIsForgotLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // ✨ NEW STATE
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    const success = await login(email, password)
    if (!success) {
      setError("Invalid email or password")
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setForgotStatus("Please enter your email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(forgotEmail)) {
      setForgotStatus("Please enter a valid email address")
      return
    }

    setIsForgotLoading(true)
    setForgotStatus(null)

    try {
      await api.forgotPassword(forgotEmail)
      setForgotStatus("Password reset link has been sent to your email. Please check your inbox.")
      setForgotEmail("") // Clear the input
    } catch (err) {
      console.error("Forgot password error:", err)
      // Show user-friendly message based on error
      if (err instanceof Error) {
        if (err.message.includes("User not found")) {
          setForgotStatus("No account found with this email address.")
        } else if (err.message.includes("network") || err.message.includes("Network")) {
          setForgotStatus("Network error. Please check your connection and try again.")
        } else {
          setForgotStatus("Failed to send reset email. Please try again later.")
        }
      } else {
        setForgotStatus("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsForgotLoading(false)
    }
  }

  const resetForgotPassword = () => {
    setShowForgot(false)
    setForgotEmail("")
    setForgotStatus(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-blue-950 p-4 relative">
      {/* Top-left corner flag and text */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <img
          src="/rwanda-flag.png"
          alt="Rwanda Flag"
          className="w-12 h-8 object-cover rounded shadow-md"
        />
        <div className="text-white">
          <div className="text-sm font-semibold leading-tight">Stakeholder</div>
          <div className="text-sm font-semibold leading-tight">Mapping Tool</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md mt-24">
        <div className="space-y-4 text-center">
          <div className="mx-auto w-40 h-40 flex items-center justify-center">
            <img
              src="/RWANDA-EMBELM.png"
              alt="Rwanda Emblem"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {!showForgot ? (
          /* Login Form */
          <form onSubmit={handleSubmit} className="space-y-4 mt-8">
            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
                className="transition-all duration-200 focus:ring-2 focus:ring-white/20 border-0 bg-blue-600/50 text-white placeholder:text-blue-200"
              />
            </div>
            {/* ✨ PASSWORD INPUT WITH TOGGLE BUTTON */}
            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative"> {/* Wrapper for positioning */}
                <Input
                  id="password"
                  // ✨ Use state to toggle input type
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-white/20 border-0 bg-blue-600/50 text-white placeholder:text-blue-200 pr-10" // Added padding-right for the button
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)} // Toggle state
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-200 hover:text-white transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {/* ✨ Display correct icon based on state */}
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300 bg-red-500/20 border-0">
                <AlertDescription className="text-white">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full transition-all duration-200 hover:scale-[1.02] bg-white text-blue-800 hover:bg-blue-100 hover:text-blue-900 font-semibold border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-blue-200 hover:underline disabled:opacity-50 transition-colors duration-200"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>
          </form>
        ) : (
          /* Forgot Password Section - Separate View (No changes needed here) */
          <div className="space-y-6 mt-8 animate-in slide-in-from-top-2 duration-300">
            {/* Header with back button and title */}
            <div className="flex items-center gap-4">
              <h2 className="text-white text-lg font-semibold flex-1 ">Reset Password</h2>
              <button
                type="button"
                onClick={resetForgotPassword}
                className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors duration-200 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </button>
            </div>

            {/* Forgot password form */}
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="forgotEmail" className="text-white">Email Address</Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isForgotLoading}
                  className="border-0 bg-blue-600/50 text-white placeholder:text-blue-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleForgotPassword()
                    }
                  }}
                />
              </div>

              <Button
                type="button"
                onClick={handleForgotPassword}
                disabled={isForgotLoading || !forgotEmail}
                className="w-full transition-all duration-200 hover:scale-[1.02] bg-white text-blue-800 hover:bg-blue-100 hover:text-blue-900 font-semibold"
                size="lg"
              >
                {isForgotLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset instructions...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              {forgotStatus && (
                <Alert className={
                  forgotStatus.includes("sent") || forgotStatus.includes("success")
                    ? "bg-green-500/20 border-green-500/30"
                    : forgotStatus.includes("Please enter") || forgotStatus.includes("valid")
                      ? "bg-blue-500/20 border-blue-500/30"
                      : "bg-yellow-500/20 border-yellow-500/30"
                }>
                  <AlertDescription className="text-white text-sm">
                    {forgotStatus}
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-center space-y-2 pt-2">
                <p className="text-xs text-blue-300">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <p className="text-xs text-blue-200">
                  Check your inbox and spam folder for the reset instructions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 w-full flex flex-col items-center justify-center text-white">
        <div className="flex items-center gap-3 mb-2">
          <img
            src="/RWANDA-EMBELM.png"
            alt="Rwanda Emblem"
            className="w-8 h-8 object-contain"
          />
          <span className="text-sm font-medium">MIGEPROF</span>
        </div>
        <div className="text-xs text-blue-200 text-center flex items-center justify-center gap-1">
          <Copyright className="h-3 w-3" />
          <span>{new Date().getFullYear()} Ministry of Gender and Family Promotion (MIGEPROF)</span>
        </div>
        <div className="text-xs text-blue-200 text-center mt-1">
          Republic of Rwanda | All rights reserved
        </div>
      </footer>
    </div>
  )
}