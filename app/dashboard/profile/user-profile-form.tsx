"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/app/utils/supabase/client"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface UserProfileFormProps {
  user: User
}

export async function UserProfileForm({ user }: UserProfileFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fullName, setFullName] = useState(user.name)

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: fullName,
        })
        .eq("id", user.id)

      if (error) throw error

      setSuccess("Profile updated successfully")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    // Validate passwords
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match")
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setPasswordSuccess("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      setPasswordError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Update Form */}
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full-name">{t("full_name")}</Label>
            <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t("role")}</Label>
            <Input id="role" value={user.role} disabled className="bg-muted" />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : t("update_profile")}
          </Button>
        </div>
      </form>

      <Separator className="my-6" />

      {/* Password Change Form */}
      <form onSubmit={handleChangePassword} className="space-y-4">
        <h3 className="text-lg font-medium">{t("change_password")}</h3>

        {passwordError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{passwordError}</AlertDescription>
          </Alert>
        )}

        {passwordSuccess && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">{passwordSuccess}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t("current_password")}</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">{t("new_password")}</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t("confirm_password")}</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{t("password_requirements")}</p>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : t("change_password")}
          </Button>
        </div>
      </form>
    </div>
  )
}

