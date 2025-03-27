"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Building2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { validateTeamId } from "@/lib/invitations"
import { createClient } from "@/app/utils/supabase/client"

export default function RegisterPage() {
  const supabase = createClient()
  const { teamId } = useParams<{ teamId: string}>()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validatingTeam, setValidatingTeam] = useState(true)
  const [teamError, setTeamError] = useState<string | null>(null)
  const [team, setTeam] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    async function checkTeam() {
      try {
        const result = await validateTeamId(teamId)

        if (result.valid && result.team) {
          setTeam(result.team)
        } else {
          setTeamError("Invalid team ID. Registration is not possible.")
        }
      } catch (error) {
        setTeamError("Failed to validate team ID")
      } finally {
        setValidatingTeam(false)
      }
    }

    checkTeam()
  }, [teamId])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      if (!team) {
        throw new Error("Invalid team ID")
      }


      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            is_admin: false,
            avatar_url: "",
          },
        },
      })

        if (authError) {
            throw authError
        }

        if (authData.user) {
            // Create the user profile
            const { error: profileError } = await supabase.from("profiles").insert({
                id: authData.user.id,
                name: fullName,
                email,
                is_admin: false,
            })

            const { error: teamMemberError } = await supabase.from("user_teams").insert({
                user_id: authData.user.id,
                team_id: team.id,
                role: "member",
            })

            if (profileError || teamMemberError) {
                throw profileError
            }

            router.push("/dashboard")
        }

        setLoading(false)
      
    } catch (error: any) {
      setError(error.message || "An error occurred during registration")
      setLoading(false)
    }
  }

  if (validatingTeam) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Validating Team</CardTitle>
            <CardDescription>Please wait while we validate the team information</CardDescription>
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

  if (teamError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Invalid Team</CardTitle>
            <CardDescription>We couldn't validate the team information</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{teamError}</AlertDescription>
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
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Join {team?.name || "Team"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

