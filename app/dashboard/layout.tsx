import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { getUserProfile, requireAuth, canInviteUsers, getUserTeams, getActiveTeam, isTeamStaff } from "@/lib/auth"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  const profile = await getUserProfile()
  const activeTeam = await getActiveTeam()
  const isAdmin = profile?.is_admin || false
  const isStaff = await isTeamStaff(activeTeam.id)
  const teams = await getUserTeams()
  if (!profile) {
    return null
  }

  // Update the layout to use the new schema field names
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SidebarProvider>
      <AppSidebar variant="inset" profile={profile} isAdmin={isAdmin} isStaff={isStaff} teams={teams} activeTeam={activeTeam} />
      <SidebarInset>
        <SiteHeader header="" />
          <div className="flex min-h-screen bg-background w-full">
              <div className="animate-in w-full">{children}</div>
          </div>
          </SidebarInset>
    </SidebarProvider>
    </ThemeProvider>
    
  )
}

