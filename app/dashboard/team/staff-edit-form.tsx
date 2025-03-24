"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Team, User, UserTeam } from "@/entities"

type TeamWithRelations = Team & {
  president: Pick<User, 'id' | 'name' | 'email'> | null
  vice_president: Pick<User, 'id' | 'name' | 'email'> | null
}

interface StaffEditFormProps {
  team: TeamWithRelations
  coordinators: Pick<User, 'id' | 'name' | 'email'>[]
  teamMembers: Pick<User, 'id' | 'name' | 'email'>[]
  allUsers: Pick<User, 'id' | 'name' | 'email'>[]
}

export function StaffEditForm({ team, coordinators, teamMembers, allUsers }: StaffEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const [presidentId, setPresidentId] = useState(team.president?.id || "")
  const [vicePresidentId, setVicePresidentId] = useState(team.vice_president?.id || "")
  const [currentCoordinators, setCurrentCoordinators] = useState<Pick<User, 'id' | 'name' | 'email'>[]>(coordinators)
  const [newCoordinatorId, setNewCoordinatorId] = useState("")

  // Filter out users who are already in leadership positions
  const availableUsers = allUsers.filter((user) => {
    if (user.id === presidentId || user.id === vicePresidentId) return false
    if (currentCoordinators.some((c) => c.id === user.id)) return false
    return true
  })

  const handleAddCoordinator = async () => {
    if (!newCoordinatorId) return

    const user = allUsers.find((u) => u.id === newCoordinatorId)
    if (!user) return

    try {
      const { error } = await supabase.from("user_teams").insert({
        team_id: team.id,
        user_id: newCoordinatorId,
        role: "coordinator"
      })

      if (error) throw error

      setCurrentCoordinators([...currentCoordinators, user])
      setNewCoordinatorId("")
    } catch (err: any) {
      setError(err.message || "Failed to add coordinator")
    }
  }

  const handleRemoveCoordinator = async (coordinatorId: string) => {
    try {
      const { error } = await supabase
        .from("user_teams")
        .delete()
        .eq("team_id", team.id)
        .eq("user_id", coordinatorId)
        .eq("role", "coordinator")

      if (error) throw error

      setCurrentCoordinators(currentCoordinators.filter((c) => c.id !== coordinatorId))
    } catch (err: any) {
      setError(err.message || "Failed to remove coordinator")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Update president
      if (presidentId) {
        const { error: presidentError } = await supabase
          .from('user_teams')
          .upsert({
            user_id: presidentId,
            team_id: team.id,
            role: 'president'
          })
        if (presidentError) throw presidentError
      }

      // Update vice president
      if (vicePresidentId) {
        const { error: vicePresidentError } = await supabase
          .from('user_teams')
          .upsert({
            user_id: vicePresidentId,
            team_id: team.id,
            role: 'vice_president'
          })
        if (vicePresidentError) throw vicePresidentError
      }

      router.refresh()
      router.push(`/dashboard/team/${team.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="president">Team President</Label>
          <Select value={presidentId} onValueChange={setPresidentId}>
            <SelectTrigger id="president">
              <SelectValue placeholder="Select a president" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {allUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vice-president">Vice President</Label>
          <Select value={vicePresidentId} onValueChange={setVicePresidentId}>
            <SelectTrigger id="vice-president">
              <SelectValue placeholder="Select a vice president" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {allUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <Label>Team Coordinators</Label>

          <div className="space-y-2">
            {currentCoordinators.length > 0 ? (
              <div className="space-y-2">
                {currentCoordinators.map((coordinator) => (
                  <div
                    key={coordinator.id}
                    className="flex items-center justify-between p-2 border border-border/40 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {coordinator.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{coordinator.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCoordinator(coordinator.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No coordinators assigned</p>
            )}
          </div>

          <div className="flex gap-2">
            <Select value={newCoordinatorId} onValueChange={setNewCoordinatorId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Add a coordinator" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={handleAddCoordinator} disabled={!newCoordinatorId}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/team")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

