"use client"

import * as React from "react"
import {
  BarChartIcon,
  Building2,
  CameraIcon,
  ClipboardListIcon,
  FileCodeIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  Mail,
  Newspaper,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { createClient } from "@/app/utils/supabase/client"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { setCookie } from "nookies"
import { Team } from "@/entities"
import { TeamSwitcher } from "./team-switcher"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChartIcon,
    },
    {
      title: "Team Profile",
      url: "/dashboard/team",
      icon: Building2,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: FileCodeIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
  ],
  content: [
    {
      name: "News",
      url: "/dashboard/news",
      icon: Newspaper,
      show: true,
    },
    {
      name: "Projects",
      url: "/dashboard/projects",
      icon: FolderIcon,
      show: true,
    },
  ],
  management: [
    {
      name: "Users",
      url: "/dashboard/users",
      icon: UsersIcon,
      show: true,
    },
    {
      name: "Invitations",
      url: "/dashboard/invitations",
      icon: Mail,
      show: true,
    },
    {
      name: "Squads",
      url: "/dashboard/squads",
      icon: ClipboardListIcon,
      show: true,
    },
    {
      name: "Teams",
      url: "/dashboard/teams",
      icon: FolderIcon,
      show: true,
    },
  ],
}

type SidebarProps = React.ComponentProps<typeof Sidebar>
type SidebarPropsWithVariantAndActiveTeam = SidebarProps & {
  profile: any
  activeTeam: Team
  isAdmin: boolean
  isStaff: boolean
  teams: Team[]
}


export function AppSidebar({profile, isAdmin, isStaff, activeTeam, teams, ...props  }: SidebarPropsWithVariantAndActiveTeam) {
  const supabase = createClient()
  const pathname = usePathname()
  const router = useRouter()
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)
  data.management.forEach((item) => {
    if (item.name === "Teams" && !isAdmin) {
      item.show = false
    }
    if (item.name === "Users" && !isStaff) {
      item.show = false
    }
    if (item.name === "Invitations" && !isStaff) {
      item.show = false
    }
    if (item.name === "Squads" && !isStaff) {
      item.show = false
    }
  }
  )

  React.useEffect(() => {
    if (activeTeam && !selectedTeam) {
      setSelectedTeam(activeTeam)
      setCookie(null, 'selectedTeamId', activeTeam.id, {
        path: '/', // disponível em toda a aplicação
        maxAge: 30 * 24 * 60 * 60, // 30 dias
      })
    }
  }, [activeTeam, selectedTeam])

  const switchTeam = (team: Team) => {
    setSelectedTeam(team)
    setCookie(null, 'selectedTeamId', team.id, {
      path: '/', // disponível em toda a aplicação
      maxAge: 30 * 24 * 60 * 60, // 30 dias
    })
    router.refresh()
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <TeamSwitcher teams={teams} activeTeam={activeTeam} setSelectedTeam={switchTeam} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments name={"Content"} items={data.content} />
        {(isAdmin || isStaff) && <NavDocuments name={"Management"} items={data.management} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={profile} />
      </SidebarFooter>
    </Sidebar>
  )
}
