"use client"

import * as React from "react"
import {
  IconBell,
  IconCar,
  IconMoon,
  IconSearch,
  IconSun,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useThemeStore } from "@/store/themeStore"

export function SiteHeader() {
  const { theme, toggleTheme } = useThemeStore()
  const isLight = theme === "light"

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 lg:px-6 transition-colors">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <span className="text-muted-foreground hidden sm:inline">DriveLoop</span>
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <span className="text-foreground">Fleet Operations & Lifecycle</span>
          </div>
          <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white border border-white/20">
            ● Live Fleet Telematics
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block w-48 md:w-64">
          <IconSearch className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search fleet, plates, hubs..."
            className="h-8 pl-8 text-xs bg-muted/40 focus:bg-background"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={toggleTheme}
          title={isLight ? "Switch to OLED Black Mode" : "Switch to Light Mode"}
          aria-label="Toggle Theme"
        >
          {isLight ? <IconMoon className="size-4" /> : <IconSun className="size-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 relative"
          aria-label="Fleet Notifications"
        >
          <IconBell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-white" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs font-semibold gap-1.5"
          onClick={() => { window.location.href = "/" }}
        >
          <IconCar className="size-3.5" />
          <span className="hidden sm:inline">Marketplace</span>
        </Button>
      </div>
    </header>
  )
}
