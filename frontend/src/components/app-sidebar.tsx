"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconCar,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

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

const data = {
  user: {
    name: "Alex Morgan",
    email: "admin@drivio.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
  },
  navMain: [
    {
      title: "Fleet Operations",
      url: "#overview",
      icon: IconDashboard,
    },
    {
      title: "Vehicle Lifecycle",
      url: "#lifecycle",
      icon: IconListDetails,
    },
    {
      title: "Utilization Analytics",
      url: "#analytics",
      icon: IconChartBar,
    },
    {
      title: "Active Inventory",
      url: "#inventory",
      icon: IconFolder,
    },
    {
      title: "Hosts & Drivers",
      url: "#team",
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: "Console Settings",
      url: "#settings",
      icon: IconSettings,
    },
    {
      title: "Operations Support",
      url: "#support",
      icon: IconHelp,
    },
    {
      title: "Search Registry",
      url: "#search",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Handover Records",
      url: "#inspections",
      icon: IconDatabase,
    },
    {
      name: "Toll & FASTag Ledger",
      url: "#fastag",
      icon: IconReport,
    },
    {
      name: "Rental Agreements",
      url: "#agreements",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconCar className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="text-base font-semibold tracking-tight">DriveLoop Fleet</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Operations Console</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
