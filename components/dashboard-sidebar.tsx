"use client"

import { setCookie } from 'nookies'
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Newspaper,
  FolderKanban,
  UserSquare,
  Building2,
  LogOut,
  Mail,
  Shield,
  ChevronDown,
  BarChart3,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  MoreHorizontal,
  Globe,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/lib/language-context"
import { createClient } from "@/app/utils/supabase/client"
import { useTeamStore } from "@/stores/teamStore"
import { Team } from "@/entities"
import path from 'path'

interface DashboardSidebarProps {
  isAdmin: boolean
  userName: string | null | undefined
  userEmail: string
  userRole: string
  canInvite: boolean
  teams: Team[]
  activeTeam?: Team | null
}

export function DashboardSidebar({
  isAdmin,
  userName,
  userEmail,
  userRole,
  canInvite,
  teams,
  activeTeam,
}: DashboardSidebarProps) {
  const supabase = createClient()
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const {selectedTeam, setSelectedTeam} = useTeamStore()
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark")

  useEffect(() => {
    if (activeTeam && !selectedTeam) {
      setSelectedTeam(activeTeam)
      setCookie(null, 'selectedTeamId', activeTeam.id, {
        path: '/', // disponível em toda a aplicação
        maxAge: 30 * 24 * 60 * 60, // 30 dias
      })
    }
    setIsDarkMode(theme === "dark")
  }, [activeTeam, selectedTeam, theme])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  // Get initials for avatar
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "" // Return empty string if name is null or undefined

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const switchTeam = (team: Team) => {
    setSelectedTeam(team)
    setCookie(null, 'selectedTeamId', team.id, {
      path: '/', // disponível em toda a aplicação
      maxAge: 30 * 24 * 60 * 60, // 30 dias
    })
    router.refresh()
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Sidebar className="border-r border-border/40 bg-sidebar">
      {/* Team Header */}
      <SidebarHeader className="border-b border-border/40">
        <div className="flex h-14 items-center px-3">
          {teams.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 w-full justify-start">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={selectedTeam?.logo_url || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {selectedTeam?.name.substring(0, 2).toUpperCase() || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm truncate max-w-[140px]">
                      {selectedTeam?.name || t("select_team")}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                {teams.map((team) => (
                  <DropdownMenuItem key={team.id} onClick={() => switchTeam(team)} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={team.logo_url || ""} />
                      <AvatarFallback className="text-xs">{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{team.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-base font-bold">{t("dashboard")}</span>
            </Link>
          )}
          <SidebarTrigger className="ml-auto md:hidden" />
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel>{t("overview")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{t("dashboard")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/analytics"}>
                  <Link href="/dashboard/analytics">
                    <BarChart3 className="h-4 w-4" />
                    <span>{t("analytics")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/team"}>
                  <Link href="/dashboard/team">
                    <Building2 className="h-4 w-4" />
                    <span>{t("team_profile")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("content")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/news")}>
                  <Link href="/dashboard/news">
                    <Newspaper className="h-4 w-4" />
                    <span>{t("news")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/projects")}>
                  <Link href="/dashboard/projects">
                    <FolderKanban className="h-4 w-4" />
                    <span>{t("projects")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* {canInvite && ( */}
          <SidebarGroup>
            <SidebarGroupLabel>{t("management")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/users")}>
                    <Link href="/dashboard/users">
                      <Users className="h-4 w-4" />
                      <span>{t("users")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/squads")}>
                      <Link href="/dashboard/squads">
                        <UserSquare className="h-4 w-4" />
                        <span>{t("squads")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/invitations")}>
                      <Link href="/dashboard/invitations">
                        <Mail className="h-4 w-4" />
                        <span>{t("invitations")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/teams")}>
                      <Link href="/dashboard/teams">
                        <Building2 className="h-4 w-4" />
                        <span>{t("teams")}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup> 
        {/* )} */}

        <SidebarGroup>
          <SidebarGroupLabel>{t("settings")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      <span>{t("dark_mode")}</span>
                    </div>
                    <Switch checked={isDarkMode} onCheckedChange={toggleTheme} className="ml-auto" />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>{t("language")}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          {language === "en" ? "EN" : "PT"}
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuRadioGroup
                          value={language}
                          onValueChange={(value) => setLanguage(value as "en" | "pt-BR")}
                        >
                          <DropdownMenuRadioItem value="en">{t("english")}</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="pt-BR">{t("portuguese")}</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="h-4 w-4" />
                    <span>{t("settings")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/help">
                    <HelpCircle className="h-4 w-4" />
                    <span>{t("help")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile Footer */}
      <SidebarFooter className="mt-auto border-t border-border/40">
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium truncate max-w-[140px]">{userName}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">{userEmail}</span>
                  </div>
                </div>
                <MoreHorizontal className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">{t("profile")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">{t("account_settings")}</Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/admin">{t("admin_panel")}</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                {t("sign_out")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

