import { redirect } from "next/navigation"
import { createClient } from "@/app/utils/supabase/server"
import { cookies } from "next/headers"
import { setCookie } from "nookies"
import { User } from "@/entities"

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
  const teams = await getUserTeams()
  if (!selectedTeamId) {
    if (teams.length > 0) {
      const team = teams[0]
      const cookieStore = await cookies()
      setCookie(null, 'selectedTeamId', team.id, {
                  path: '/', // disponível em toda a aplicação
                  maxAge: 30 * 24 * 60 * 60, // 30 dias
          })
      return team
    }
    return null
  }

  let team = await getUserTeamById(selectedTeamId) 

  if (!team) {
    team = teams[0]
    setCookie(null, 'selectedTeamId', team.id, {
      path: '/', // disponível em toda a aplicação
      maxAge: 30 * 24 * 60 * 60, // 30 dias
    })
  }

  return team
}

export async function getUsersByTeamId(teamId: string) {
  const supabase = await createClient()
  const session = await getSession()
  
  if (!session) {
    return []
  }
  const { data: users } = await supabase
    .from("user_teams")
    .select(`
      user_id,
      user:profiles (
        id,
        name,
        email,
        avatar_url,
        banner_url,
        is_admin,
        created_at
      )
    `)
    .eq("team_id", teamId) as { data: Array<{ user_id: string; user: User }> | null }
  
    console.log(users)

    const usersData = (users || []).map((u) => ({
    id: u.user.id,
    name: u.user.name,
    email: u.user.email,
    avatar_url: u.user.avatar_url,
    banner_url: u.user.banner_url,
    is_admin: u.user.is_admin,
    created_at: u.user.created_at,
  }))

  return usersData
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

export async function getUserNews() {
  const supabase = await createClient()
  const session = await getSession()

  if (!session) {
    return []
  }

  const { data: userNews } = await supabase
    .from("news")
    .select(`*,
      team:teams (
        id,
        name,
        logo_url
      )`)
    .eq("author_id", session.id)
    .order("created_at", { ascending: false })

  return userNews
}

export async function getUserProjects() {
  const supabase = await createClient()
  const session = await getSession()

  if (!session) {
    return []
  }

  const { data: relations, error: relError } = await supabase
    .from("user_projects")
    .select("project_id")
    .eq("user_id", session.id)

  if (relError || !relations?.length) {
    return []
  }

  const projectIds = relations.map((r) => r.project_id)
  

  const { data: userProjects, error } = await supabase
    .from("projects")
    .select(`
      *,
      user_projects (
        user:profiles (
          id,
          name,
          email
        )
      ),
      team:teams (
        id,
        name,
        logo_url
      )
    `)
    .in("id", projectIds)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user projects:", error)
    return []
  }

  return userProjects
}

export async function getPresident(teamId: string) {
  const supabase = await createClient()
  const { data: president } = await supabase
    .from("user_teams")
    .select("user_id")
    .eq("team_id", teamId)
    .eq("role", "president")
    .single()

  const { data: presidentData } = await supabase
    .from("profiles")
    .select("id, name, email, avatar_url")
    .eq("id", president?.user_id)
    .single()

  return presidentData
}

export async function getVicePresident(teamId: string) {
  const supabase = await createClient()
  const { data: vicePresident } = await supabase
    .from("user_teams")
    .select("user_id")
    .eq("team_id", teamId)
    .eq("role", "vice_president")
    .single()

  const { data: vicePresidentData } = await supabase
    .from("profiles")
    .select("id, name, email, avatar_url")
    .eq("id", vicePresident?.user_id)
    .single()

  return vicePresidentData
}

export async function getSquads(teamId: string) {
  const supabase = await createClient()
  const { data: squads } = await supabase
    .from("squads")
    .select("id, name")
    .eq("team_id", teamId)

  return squads
}

export async function getCoordinators(teamId: string) {
  const supabase = await createClient()

  const squads = await getSquads(teamId)

  if (!squads) {
    return []
  }

  const { data: coordinators } = await supabase
    .from("user_squads")
    .select("user_id")
    .in("squad_id", squads.map((s) => s.id))
    .eq("role", "coordinator")


  const coordinatorIds = coordinators?.map((c) => c.user_id)

  if (!coordinatorIds || coordinatorIds.length === 0) {
    return []
  }

  const { data: coordinatorData } = await supabase
    .from("profiles")
    .select("id, name, email, avatar_url")
    .in("id", coordinatorIds)

  return coordinatorData
}

