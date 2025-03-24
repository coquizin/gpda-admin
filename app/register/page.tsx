"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { validateInvitation, markInvitationAsUsed } from "@/lib/invitations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "../utils/supabase/client"

export default function RegisterPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationId = searchParams.get("invitation")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<any>(null)
  const [validatingInvitation, setValidatingInvitation] = useState(!!invitationId)
  const [invitationError, setInvitationError] = useState<string | null>(null)

  useEffect(() => {
    async function checkInvitation() {
      if (invitationId) {
        try {
          const result = await validateInvitation(invitationId)

          if (result.valid && result.invitation) {
            setInvitation(result.invitation)
            setEmail(result.invitation.email)
          } else {
            setInvitationError(result.message || "Invalid invitation")
          }
        } catch (error) {
          setInvitationError("Failed to validate invitation")
        } finally {
          setValidatingInvitation(false)
        }
      }
    }

    checkInvitation()
  }, [invitationId])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!invitation) {
        throw new Error("Registration is by invitation only")
      }

      // Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
          },
        },
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // Create the user profile
        const { error: userError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          email,
          name: fullName,
          is_admin: invitation.role === "admin",
        })

        if (userError) {
          throw userError
        }

        // Add team membership if applicable
        if (invitation.team_id) {
          const { error: teamError } = await supabase.from("user_teams").insert({
            user_id: authData.user.id,
            team_id: invitation.team_id,
            role: invitation.role === "admin" ? "member" : invitation.role,
          })

          if (teamError) {
            throw teamError
          }
        }

        // Add squad membership if applicable
        if (invitation.squad_id) {
          const { error: squadError } = await supabase.from("user_squads").insert({
            user_id: authData.user.id,
            squad_id: invitation.squad_id,
            role: invitation.role === "coordinator" ? "coordinator" : "member",
          })

          if (squadError) {
            throw squadError
          }
        }

        // Mark invitation as used
        await markInvitationAsUsed(invitation.id)

        router.push("/login?registered=true")
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  if (validatingInvitation) {
    return (
      <div className="auth-container bg-muted/40 p-4">
        <Card className="auth-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Validating Invitation</CardTitle>
            <CardDescription>Please wait while we validate your invitation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (invitationError) {
    return (
      <div className="auth-container bg-muted/40 p-4">
        <Card className="auth-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Invalid Invitation</CardTitle>
            <CardDescription>We couldn't validate your invitation</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{invitationError}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="auth-container bg-muted/40 p-4">
        <Card className="auth-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Registration Restricted</CardTitle>
            <CardDescription>Registration is by invitation only</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need an invitation link to register. Please contact your team administrator.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="auth-container bg-muted/40 p-4">
      <Card className="auth-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>You've been invited to join {invitation.team?.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Invitation valid for {invitation.email}
            </AlertDescription>
          </Alert>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} readOnly className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Email is pre-filled from your invitation and cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

