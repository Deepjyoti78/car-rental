"use client"

import * as React from "react"
import {
  IconCar,
  IconCoins,
  IconGauge,
  IconTrendingUp,
  IconTool,
} from "@tabler/icons-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SectionCards() {
  const cards = [
    {
      title: "Total Active Fleet",
      value: "250 Vehicles",
      change: "+12.4% MoM",
      trend: "up",
      desc: "Commercial yellow-plate verified across 6 hubs",
      icon: IconCar,
      badge: "112 Available Now",
      badgeVariant: "secondary" as const,
    },
    {
      title: "Fleet Utilization",
      value: "84.8%",
      change: "+5.2% vs avg",
      trend: "up",
      desc: "138 cars on active reservation today",
      icon: IconGauge,
      badge: "High Demand",
      badgeVariant: "default" as const,
    },
    {
      title: "Security Escrow Held",
      value: "₹4,25,000",
      change: "100% On-Time",
      trend: "up",
      desc: "Automated 24h refund compliance guarantee",
      icon: IconCoins,
      badge: "Razorpay Protected",
      badgeVariant: "outline" as const,
    },
    {
      title: "Scheduled Maintenance",
      value: "18 Vehicles",
      change: "4 Routine today",
      trend: "neutral",
      desc: "Periodic safety, brake pad, and FASTag checks",
      icon: IconTool,
      badge: "Zero Grounded",
      badgeVariant: "secondary" as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight">
                  {card.value}
                </span>
                <Badge variant={card.badgeVariant} className="text-[10px] px-1.5 py-0">
                  {card.badge}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-emerald-500 inline-flex items-center gap-0.5">
                  <IconTrendingUp className="size-3" />
                  {card.change}
                </span>
                <span>•</span>
                <span className="truncate">{card.desc}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
