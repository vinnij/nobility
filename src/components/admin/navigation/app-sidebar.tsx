"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  Package2,
  PieChart,
  Server,
  Settings2,
  SquareTerminal,
  Ticket,
  Users2,
} from "lucide-react"

import { NavMain } from "@/components/admin/navigation/nav-main"
import { NavUser } from "@/components/admin/navigation/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSiteSettings } from "@/hooks/use-site-settings"
import Link from "next/link"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Users",
      url: "/users",
      icon: Users2,
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: Ticket,
    },
    {
      title: "Map Voting",
      url: "/map-voting",
      icon: Map,
    },
    {
      title: "Servers",
      url: "/servers",
      icon: Server,
      isActive: true,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Ticket Settings",
          url: "/ticket-settings",
        },
        {
          title: "Leaderboard Settings",
          url: "/leaderboard",
        },
        {
          title: "SEO Settings",
          url: "/seo",
        },
        {
          title: "Admin Logs",
          url: "/logs",
        },
        {
          title: "Site Settings",
          url: "/settings",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: siteSettings, isLoading } = useSiteSettings();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Package2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{isLoading ? "Loading..." : siteSettings?.name}</span>
                  <span className="truncate text-xs text-muted-foreground">noblethemes.net</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
