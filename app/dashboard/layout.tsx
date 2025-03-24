import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { getUserProfile, requireAuth, canInviteUsers, getUserTeams, getActiveTeam } from "@/lib/auth"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()
  const profile = await getUserProfile()
  const isAdmin = profile?.is_admin || false
  const canInvite = await canInviteUsers()
  const teams = await getUserTeams()
  const activeTeam = await getActiveTeam()

  if (!profile) {
    return null
  }

  // Update the layout to use the new schema field names
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <LanguageProvider>
        <SidebarProvider>
          <div className="flex min-h-screen bg-background w-full">
            <DashboardSidebar
              isAdmin={isAdmin}
              userName={profile.name}
              userEmail={profile.email}
              userRole={profile.role || "Member"}
              canInvite={canInvite}
              teams={teams}
              activeTeam={activeTeam}
            />
            <SidebarInset className="flex-1 bg-background">
              <div className="container-full animate-in">{children}</div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

