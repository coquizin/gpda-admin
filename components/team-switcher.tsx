"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Team } from "@/entities"
import { getInitials } from "@/app/utils/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export function TeamSwitcher({
  teams,
  activeTeam,
  setSelectedTeam,
}: {
  teams: Team[] | undefined
  activeTeam: Team | undefined
  setSelectedTeam: (team: Team) => void
  }
) {
  const { isMobile } = useSidebar()

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
                <Avatar className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <AvatarImage src={activeTeam.logo_url || undefined} alt={activeTeam.name} />
                  <AvatarFallback className=" bg-primary text-primary-foreground size-8 rounded-lg">
                    {activeTeam.name?.substring(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
                <span className="truncate text-xs">{activeTeam.description}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {teams?.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setSelectedTeam(team)}
                className="gap-2 p-2"
              >
                <Avatar className="flex size-6 items-center justify-center rounded-sm border">
                  <AvatarImage src={team.logo_url || undefined} alt={team.name} />
                  <AvatarFallback className="rounded-sm size-6 border">
                    {getInitials(team.name)}
                  </AvatarFallback>
                </Avatar>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
