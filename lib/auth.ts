import { redirect } from "next/navigation"
import { createClient } from "@/app/utils/supabase/server"
import { cookies } from "next/headers"

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { user: session },
  } = await supabase.auth.getUser()


  return session
}

export async function getUser() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    return null
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return data
}

export async function getUserTeams() {
  const supabase = await createClient()
  const session = await getSession()

  if (!session) {
    return []
  }

  // Get teams where user is a member
  const { data: userTeams } = await supabase
    .from("user_teams")
    .select(`
      team_id,
      role,
      team:teams (
        id,
        name,
        description,
        logo_url,
        created_at
      )
    `)
    .eq("user_id", session.id) as { 
      data: Array<{ 
        team_id: string; 
        role: string; 
        team: { 
          id: string; 
          name: string; 
          description: string | null; 
          logo_url: string | null; 
          banner_url: string | null;
          created_at: string;
        } 
      }> | null }

  // Combine all teams, removing duplicates
  const allTeams = (userTeams || []).map((ut) => ({
    id: ut.team.id,
    name: ut.team.name,
    description: ut.team.description,
    logo_url: ut.team.logo_url,
    banner_url: null,
    role: ut.role,
    team_color: null,
    created_at: ut.team.created_at,
    isPresident: ut.role === "president",
    isVicePresident: ut.role === "vice_president",
    isCoordinator: false,
  }))

  // Remove duplicates by team ID
  const uniqueTeams = Array.from(new Map(allTeams.map((team) => [team.id, team])).values())

  return uniqueTeams
}

export async function getUserSquads() {
  const supabase = await createClient()
  const session = await getSession()

  if (!session) {
    return []
  }

  // Get squads where user is a member
  const { data: userSquads } = await supabase
    .from("user_squads")
    .select(`
      squad_id,
      squad:squads (
        id,
        name,
        team_id,
        team:teams (
          id,
          name
        )
      )
    `)
    .eq("user_id", session.id) as { data: Array<{ squad_id: string; squad: { id: string; name: string; team_id: string; team: { id: string; name: string } } }> | null }

  return (userSquads || []).map((us) => ({
    id: us.squad.id,
    name: us.squad.name,
    teamId: us.squad.team_id,
    teamName: us.squad.team?.name,
  }))
}

export async function getActiveTeam() {
  const cookieStore = cookies()
  const selectedTeamId = (await cookieStore).get("selectedTeamId")?.value
  if (!selectedTeamId) {
    return null
  }

  const teams = await getUserTeamById(selectedTeamId)
  return teams
}

export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

export async function requireAdmin() {
  const supabase = await createClient()
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: user } = await supabase.from("profiles").select("is_admin").eq("id", session.id).single()

  if (!user?.is_admin) {
    redirect("/dashboard")
  }

  return session
}

export async function isTeamStaff(teamId: string) {
  const supabase = await createClient()
  const session = await getSession()

  if (!session) {
    return false
  }

  // Check if user is admin
  const { data: user } = await supabase.from("profiles").select("is_admin").eq("id", session.id).single()

  if (user?.is_admin) {
    return true
  }

  // Check if user is president or vice president
  const { data: teamRole } = await supabase
    .from("user_teams")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", session.id)
    .in("role", ["president", "vice_president"])
    .single()

  return !!teamRole
}

export async function canInviteUsers() {
  const supabase = await createClient()
  const session = await getSession()

  if (!session) {
    return false
  }

  // Check if user is admin
  const { data: user } = await supabase.from("profiles").select("is_admin").eq("id", session.id).single()

  if (user?.is_admin) {
    return true
  }

  // Check if user is president or vice president of any team
  const { data: teamRoles } = await supabase
    .from("user_teams")
    .select("id")
    .eq("user_id", session.id)
    .in("role", ["president", "vice_president"])

  if (teamRoles && teamRoles.length > 0) {
    return true
  }

  // Check if user is coordinator of any squad
  const { data: squadRoles } = await supabase
    .from("user_squads")
    .select("id")
    .eq("user_id", session.id)
    .eq("role", "coordinator")

  if (!squadRoles) return false

  return squadRoles.length > 0
}

export async function canEditUser(userId: string) {
  const session = await getSession()
  const supabase = await createClient()
  const selectedTeam = await getActiveTeam()

  if (!session) {
    return false
  }

  const user = await getUserProfile()

  if (!user) {
    return false
  }

  // Admins can edit any user
  if (user.is_admin) {
    return true
  }

  // Check if user is president or vice president of the same team
  const { data: teamRole } = await supabase
    .from("user_teams")
    .select("role")
    .eq("team_id", selectedTeam?.id)
    .eq("user_id", user.id)
    .in("role", ["president", "vice_president"])

  if (teamRole && teamRole.length > 0) {
    return true
  }
  // Check if user is coordinator of the same squad
  const { data: squadRole } = await supabase
    .from("user_squads")
    .select("role")
    .eq("squad_id", selectedTeam?.id)
    .eq("user_id", user.id)
    .eq("role", "coordinator")
    .single()
  if (squadRole) {
    return true
  }
  
  // Users can only edit themselves
  return user.id === userId
}

export async function getUserTeamById(teamId: string) {
  const supabase = await createClient()
  const session = await getSession()

  if (!session) {
    return null
  }

  const { data: team } = await supabase
    .from("teams")
    .select(`*,
      user:user_teams!inner(
        user:profiles(
          id,
          name
          )
          ),
          squads(
            id,
            name
            )`)
    .eq("id", teamId)
    .eq("user_teams.user_id", session.id)
    .single()

  return team
}