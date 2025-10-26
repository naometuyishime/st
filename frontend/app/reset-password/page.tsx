"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import { api } from "@/lib/api"

export default function ResetPasswordPage() {
  const router = useRouter()
  const search = useSearchParams()
  const emailFromUrl = search.get("email") || ""
  const tokenFromUrl = search.get("token") || ""

  const [email] = useState(emailFromUrl)
  const [token] = useState(tokenFromUrl)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // email and token come from the secure reset link
  }, [emailFromUrl, tokenFromUrl])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStatus(null)

    if (!email || !token) {
      setError("Invalid or expired reset link.")
      return
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setSubmitting(true)
    try {
      await api.resetPassword(email, token, password)
      setStatus("Password reset successful. You can now sign in.")
      setTimeout(() => router.push("/"), 1200)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to reset password.")
      } else {
        setError("Failed to reset password.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-blue-950 p-4 relative">
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <img src="/rwanda-flag.png" alt="Rwanda Flag" className="w-12 h-8 object-cover rounded shadow-md" />
        <div className="text-white">
          <div className="text-sm font-semibold leading-tight">Stakeholder</div>
          <div className="text-sm font-semibold leading-tight">Mapping Tool</div>
        </div>
      </div>

      <div className="w-full max-w-md mt-24">
        <div className="space-y-4 text-center">
          <div className="mx-auto w-40 h-40 flex items-center justify-center">
            <img src="/RWANDA-EMBELM.png" alt="Rwanda Emblem" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="space-y-6 mt-8 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4">
            <h2 className="text-white text-lg font-semibold flex-1">Set New Password</h2>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors duration-200 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="text-left text-blue-200 text-sm">
              Use the secure link sent to your email to reset your password.
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-white">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="border-0 bg-blue-600/50 text-white placeholder:text-blue-200"
              />
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="confirm" className="text-white">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="border-0 bg-blue-600/50 text-white placeholder:text-blue-200"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-500/20 border-0">
                <AlertDescription className="text-white">{error}</AlertDescription>
              </Alert>
            )}
            {status && (
              <Alert className="bg-green-500/20 border-green-500/30">
                <AlertDescription className="text-white">{status}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full transition-all duration-200 hover:scale-[1.02] bg-white text-blue-800 hover:bg-blue-100 hover:text-blue-900 font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>
      </div>

      <footer className="absolute bottom-6 w-full flex flex-col items-center justify-center text-white">
        <div className="flex items-center gap-3 mb-2">
          <img src="/RWANDA-EMBELM.png" alt="Rwanda Emblem" className="w-8 h-8 object-contain" />
          <span className="text-sm font-medium">MIGEPROF</span>
        </div>
        <div className="text-xs text-blue-200 text-center">Republic of Rwanda | All rights reserved</div>
      </footer>
    </div>
  )
}
