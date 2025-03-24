"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Palette } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/app/utils/supabase/client"

interface User {
  id: string
  name: string
}

interface Team {
  id: string
  name: string
  description: string
  team_color?: string | null
}

interface TeamFormProps {
  team?: Team
  users: User[]
  isEditing: boolean
}

// Predefined color options
const colorOptions = [
  { name: "Black", value: "#000000" },
  { name: "Gray", value: "#4B5563" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Lime", value: "#84CC16" },
  { name: "Green", value: "#22C55E" },
  { name: "Emerald", value: "#10B981" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Sky", value: "#0EA5E9" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Fuchsia", value: "#D946EF" },
  { name: "Pink", value: "#EC4899" },
  { name: "Rose", value: "#F43F5E" },
]

export function TeamForm({ team, users, isEditing }: TeamFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(team?.name || "")
  const [description, setDescription] = useState(team?.description || "")
  const [teamColor, setTeamColor] = useState(team?.team_color || "#000000")
  const [customColor, setCustomColor] = useState(team?.team_color || "#000000")
  const [presidentId, setPresidentId] = useState("")
  const [vicePresidentId, setVicePresidentId] = useState("")

  // Load team leadership if editing
  useEffect(() => {
    if (isEditing && team) {
      const loadTeamLeadership = async () => {
        // Get president
        const { data: president } = await supabase
          .from("user_teams")
          .select("user_id")
          .eq("team_id", team.id)
          .eq("role", "president")
          .single()

        if (president) {
          setPresidentId(president.user_id)
        }

        // Get vice president
        const { data: vicePresident } = await supabase
          .from("user_teams")
          .select("user_id")
          .eq("team_id", team.id)
          .eq("role", "vice_president")
          .single()

        if (vicePresident) {
          setVicePresidentId(vicePresident.user_id)
        }
      }

      loadTeamLeadership()
    }
  }, [isEditing, team])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditing) {
        // Update existing team
        const { error } = await supabase
          .from("teams")
          .update({
            name,
            description,
            team_color: teamColor,
          })
          .eq("id", team!.id)

        if (error) throw error

        // Update team leadership
        // First, remove existing president and vice president
        await supabase.from("user_teams").delete().eq("team_id", team!.id).in("role", ["president", "vice_president"])

        // Add new president if selected
        if (presidentId) {
          const { error: presidentError } = await supabase.from("user_teams").insert({
            team_id: team!.id,
            user_id: presidentId,
            role: "president",
          })

          if (presidentError) throw presidentError
        }

        // Add new vice president if selected
        if (vicePresidentId) {
          const { error: vicePresidentError } = await supabase.from("user_teams").insert({
            team_id: team!.id,
            user_id: vicePresidentId,
            role: "vice_president",
          })

          if (vicePresidentError) throw vicePresidentError
        }
      } else {
        // Create new team
        const { data: newTeam, error } = await supabase
          .from("teams")
          .insert({
            name,
            description,
            team_color: teamColor,
          })
          .select()
          .single()

        if (error) throw error

        // Add president if selected
        if (presidentId) {
          const { error: presidentError } = await supabase.from("user_teams").insert({
            team_id: newTeam.id,
            user_id: presidentId,
            role: "president",
          })

          if (presidentError) throw presidentError
        }

        // Add vice president if selected
        if (vicePresidentId) {
          const { error: vicePresidentError } = await supabase.from("user_teams").insert({
            team_id: newTeam.id,
            user_id: vicePresidentId,
            role: "vice_president",
          })

          if (vicePresidentError) throw vicePresidentError
        }
      }

      router.push("/dashboard/teams")
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
              <Label htmlFor="name">Team Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="president">Team President</Label>
              <Select value={presidentId} onValueChange={setPresidentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a president" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vicePresident">Vice President</Label>
              <Select value={vicePresidentId} onValueChange={setVicePresidentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vice president" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Team Color
              </Label>
              <Tabs defaultValue="preset" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preset">Preset Colors</TabsTrigger>
                  <TabsTrigger value="custom">Custom Color</TabsTrigger>
                </TabsList>
                <TabsContent value="preset" className="mt-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {colorOptions.map((color) => (
                      <div
                        key={color.value}
                        className={`flex flex-col items-center cursor-pointer p-2 rounded-md ${
                          teamColor === color.value ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setTeamColor(color.value)}
                      >
                        <div className="w-8 h-8 rounded-full mb-1" style={{ backgroundColor: color.value }}></div>
                        <span className="text-xs">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="custom" className="mt-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-16 h-16 rounded-md" style={{ backgroundColor: customColor }}></div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="custom-color">Custom Color</Label>
                      <Input
                        id="custom-color"
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value)
                          setTeamColor(e.target.value)
                        }}
                      />
                      <Input
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value)
                          setTeamColor(e.target.value)
                        }}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update Team" : "Create Team"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/teams")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

