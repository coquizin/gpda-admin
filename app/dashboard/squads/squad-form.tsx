"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { createClient } from "@/app/utils/supabase/client"

interface Team {
  id: string
  name: string
}

interface Squad {
  id: string
  name: string
  team_id: string
}

interface SquadFormProps {
  squad?: Squad
  team: Team
  isEditing: boolean
}

export function SquadForm({ squad, team, isEditing }: SquadFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(squad?.name || "")
  const [teamId, setTeamId] = useState(squad?.team_id || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditing) {
        // Update existing squad
        const { error } = await supabase
          .from("squads")
          .update({
            name,
            team_id: teamId,
          })
          .eq("id", squad!.id)

        if (error) throw error
      } else {
        // Create new squad
        const { error } = await supabase.from("squads").insert({
          name,
          team_id: teamId,
        })

        if (error) throw error
      }

      router.push("/dashboard/squads")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
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
              <Label htmlFor="name">Squad Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select value={teamId} onValueChange={setTeamId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update Squad" : "Create Squad"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/squads")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

