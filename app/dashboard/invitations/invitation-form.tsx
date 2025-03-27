"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createInvitation } from "@/lib/invitations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Copy, Check } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface Team {
  id: string
  name: string
}

interface Squad {
  id: string
  name: string
  team_id: string
  team?: {
    name: string
  }
}

interface InvitationFormProps {
  teams: Team[]
  squads: Squad[]
  userId: string
}

export function InvitationForm({ teams, squads, userId }: InvitationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [invitationLink, setInvitationLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [email, setEmail] = useState("")
  const [role, setRole] = useState<any>("member")
  const [teamId, setTeamId] = useState(teams.length === 1 ? teams[0].id : "")
  const [squadId, setSquadId] = useState("")
  const [message, setMessage] = useState("")

  // Filter squads based on selected team
  const filteredSquads = squads.filter((squad) => squad.team_id === teamId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    setInvitationLink(null)

    try {
      const invitation = await createInvitation(email, role, squadId || null, teamId, userId)

      setSuccess(true)

      // Create invitation link
      const baseUrl = window.location.origin
      const link = `${baseUrl}/register?invitation=${invitation.id}`
      setInvitationLink(link)

      // TODO: Send email with invitation link
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (success && invitationLink) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-6">
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Invitation created successfully!
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Invitation Link</Label>
            <div className="flex gap-2">
              <Input value={invitationLink} readOnly className="flex-1" />
              <Button type="button" size="icon" onClick={handleCopyLink} variant={copied ? "default" : "outline"}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Share this link with {email} to complete registration</p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                setSuccess(false)
                setInvitationLink(null)
                setEmail("")
                setRole("member")
                setSquadId("")
                setMessage("")
              }}
            >
              Create Another
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/invitations")}>
              Back to Invitations
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="president">President</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select
                value={teamId}
                onValueChange={(value) => {
                  setTeamId(value)
                  setSquadId("")
                }}
                required
                disabled={teams.length === 1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="squad">Squad (Optional)</Label>
              <Select value={squadId} onValueChange={setSquadId} disabled={!teamId || filteredSquads.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a squad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {filteredSquads.map((squad) => (
                    <SelectItem key={squad.id} value={squad.id}>
                      {squad.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message to the invitation email"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Invitation"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/invitations")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

