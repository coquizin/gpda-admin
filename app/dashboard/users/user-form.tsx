"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/app/utils/supabase/client"

interface Squad {
  id: string
  name: string
  team_id: string
  teams?: {
    id: string
    name: string
  } | null
}

interface Team {
  id: string
  name: string
}

interface TeamMembership {
  teamId: string
  teamName: string
  role: "president" | "vice_president" | "member"
}

interface SquadMembership {
  squadId: string
  squadName: string
  teamId: string
  teamName: string
  role: "coordinator" | "member"
}

interface User {
  id: string
  email: string
  name: string
  is_admin: boolean
}

interface UserFormProps {
  user?: User
  squads: Squad[]
  teams: Team[]
  isEditing: boolean
}

export function UserForm({ user, squads, teams, isEditing }: UserFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState(user?.email || "")
  const [fullName, setFullName] = useState(user?.name || "")
  const [isAdmin, setIsAdmin] = useState(user?.is_admin || false)
  const [password, setPassword] = useState("")

  // Team memberships
  const [teamMemberships, setTeamMemberships] = useState<TeamMembership[]>([])
  const [newTeamId, setNewTeamId] = useState("")
  const [newTeamRole, setNewTeamRole] = useState<"president" | "vice_president" | "member">("member")

  // Squad memberships
  const [squadMemberships, setSquadMemberships] = useState<SquadMembership[]>([])
  const [newSquadId, setNewSquadId] = useState("")
  const [newSquadRole, setNewSquadRole] = useState<"coordinator" | "member">("member")

  // Load existing memberships if editing
  useEffect(() => {
    if (isEditing && user) {
      const loadMemberships = async () => {
        // Load team memberships
        const { data: userTeams } = await supabase
          .from("user_teams")
          .select(`
            team_id,
            role,
            team:team_id (
              name
            )
          `)
          .eq("user_id", user.id)
        
        if (userTeams) {
          setTeamMemberships(
            userTeams.map((ut: any) => ({
              teamId: ut.team_id,
              teamName: ut.team ? ut.team.name : "",
              role: ut.role,
            })),
          )
        }

        // Load squad memberships
        const { data: userSquads } = await supabase
          .from("user_squads")
          .select(`
            squad_id,
            role,
            squad:squad_id (
              name,
              team_id,
              team:team_id (
                name
              )
            )
          `)
          .eq("user_id", user.id)
        
        if (userSquads) {
          setSquadMemberships(
            userSquads.map((us: any) => ({
              squadId: us.squad_id,
              squadName: us.squad.name,
              teamId: us.squad.team_id,
              teamName: us.squad.team.name,
              role: us.role,
            })),
          )
        }
      }

      loadMemberships()
    }
  }, [isEditing, user])

  // Filter squads based on selected team
  const filteredSquads = squads.filter((squad) => !squadMemberships.some((sm) => sm.squadId === squad.id))

  // Filter teams that are not already added
  const availableTeams = teams.filter((team) => !teamMemberships.some((tm) => tm.teamId === team.id))

  const handleAddTeam = () => {
    if (!newTeamId) return

    const team = teams.find((t) => t.id === newTeamId)
    if (!team) return

    const updatedMemberships = [
      ...teamMemberships,
      {
        teamId: newTeamId,
        teamName: team.name,
        role: newTeamRole,
      },
    ]

    setTeamMemberships(updatedMemberships)
    setNewTeamId("")
    setNewTeamRole("member")
  }

  const handleRemoveTeam = (teamId: string) => {
    const updatedMemberships = teamMemberships.filter((tm) => tm.teamId !== teamId)
    setTeamMemberships(updatedMemberships)

    // Also remove any squad memberships for this team
    setSquadMemberships(squadMemberships.filter((sm) => sm.teamId !== teamId))
  }

  const handleAddSquad = () => {
    console.log("Adding squad")
    if (!newSquadId) return

    const squad = squads.find((s) => s.id === newSquadId)

    console.log(squad)
    if (!squad || !squad.teams) return

    setSquadMemberships([
      ...squadMemberships,
      {
        squadId: newSquadId,
        squadName: squad.name,
        teamId: squad.team_id,
        teamName: squad.teams?.name || "",
        role: newSquadRole,
      },
    ])

    console.log()
    setNewSquadId("")
    setNewSquadRole("member")
  }

  const handleRemoveSquad = (squadId: string) => {
    setSquadMemberships(squadMemberships.filter((sm) => sm.squadId !== squadId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditing) {
        // Update existing user
        const { error } = await supabase
          .from("profiles")
          .update({
            email,
            name: fullName,
            is_admin: isAdmin,
          })
          .eq("id", user!.id)

        if (error) throw error

        // Update team memberships
        // First, delete all existing team memberships
        await supabase.from("user_teams").delete().eq("user_id", user!.id)

        // Then, add new team memberships
        if (teamMemberships.length > 0) {
          const teamMembershipsData = teamMemberships.map((tm) => ({
            team_id: tm.teamId,
            user_id: user!.id,
            role: tm.role,
          }))

          const { error: teamError } = await supabase.from("user_teams").insert(teamMembershipsData)

          if (teamError) throw teamError
        }

        // Update squad memberships
        // First, delete all existing squad memberships
        await supabase.from("user_squads").delete().eq("user_id", user!.id)

        // Then, add new squad memberships
        if (squadMemberships.length > 0) {
          const squadMembershipsData = squadMemberships.map((sm) => ({
            squad_id: sm.squadId,
            user_id: user!.id,
            role: sm.role,
          }))

          const { error: squadError } = await supabase.from("user_squads").insert(squadMembershipsData)

          if (squadError) throw squadError
        }
      } else {
        // Create new user with auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              is_admin: isAdmin,
              avatar_url: "",
            },
          },
        })

        if (authError) throw authError

        if (authData.user) {
          // Create user
          const { error: userError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            email,
            name: fullName,
            is_admin: isAdmin,
          })

          if (userError) throw userError

          // Add team memberships
          if (teamMemberships.length > 0) {
            const teamMembershipsData = teamMemberships.map((tm) => ({
              team_id: tm.teamId,
              user_id: authData.user!.id,
              role: tm.role,
            }))

            const { error: teamError } = await supabase.from("user_teams").insert(teamMembershipsData)

            if (teamError) throw teamError
          }

          // Add squad memberships
          if (squadMemberships.length > 0) {
            const squadMembershipsData = squadMemberships.map((sm) => ({
              squad_id: sm.squadId,
              user_id: authData.user!.id,
              role: sm.role,
            }))

            const { error: squadError } = await supabase.from("user_squads").insert(squadMembershipsData)

            if (squadError) throw squadError
          }
        }
      }

      router.push("/dashboard/users")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border/40">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isEditing}
                />
              </div>
            )}

            <div className="flex items-center space-x-2 pt-4 md:col-span-2">
              <Checkbox id="is-admin" checked={isAdmin} onCheckedChange={(checked) => setIsAdmin(checked === true)} />
              <Label htmlFor="is-admin">Administrator</Label>
            </div>
          </div>

          <div className="space-y-4 border-t border-border/40 pt-6">
            <h3 className="text-lg font-medium">Team Memberships</h3>

            {teamMemberships.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMemberships.map((tm) => (
                    <TableRow key={tm.teamId}>
                      <TableCell>{tm.teamName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tm.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTeam(tm.teamId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No team memberships added</p>
            )}

            <div className="flex flex-col md:flex-row gap-2">
              <Select value={newTeamId} onValueChange={setNewTeamId} disabled={availableTeams.length === 0}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newTeamRole}
                onValueChange={(value) => setNewTeamRole(value as "president" | "vice_president" | "member")}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="president">President</SelectItem>
                  <SelectItem value="vice_president">Vice President</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>

              <Button type="button" onClick={handleAddTeam} disabled={!newTeamId}>
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </Button>
            </div>
          </div>

          <div className="space-y-4 border-t border-border/40 pt-6">
            <h3 className="text-lg font-medium">Squad Memberships</h3>

            {squadMemberships.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Squad</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {squadMemberships.map((sm) => (
                    <TableRow key={sm.squadId}>
                      <TableCell>{sm.squadName}</TableCell>
                      <TableCell>{sm.teamName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sm.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveSquad(sm.squadId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No squad memberships added</p>
            )}

            <div className="flex flex-col md:flex-row gap-2">
              <Select value={newSquadId} onValueChange={setNewSquadId} disabled={filteredSquads.length === 0}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a squad" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSquads.map((squad) => (
                    <SelectItem key={squad.id} value={squad.id}>
                      {squad.name} {squad.teams ? `(${squad.teams.name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newSquadRole}
                onValueChange={(value) => setNewSquadRole(value as "coordinator" | "member")}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>

              <Button type="button" onClick={handleAddSquad} disabled={!newSquadId}>
                <Plus className="h-4 w-4 mr-2" />
                Add Squad
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update User" : "Create User"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/users")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

