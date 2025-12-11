"use client"

import * as React from "react"
import { Sparkles, GalleryVertical, Code, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CategoryTabs() {
  const [selected, setSelected] = React.useState<string | null>(null)

  const tabs = [
    {
      id: "create",
      label: "Create",
      icon: Sparkles,
    },
    {
      id: "explore",
      label: "Explore",
      icon: GalleryVertical,
    },
    {
      id: "code",
      label: "Code",
      icon: Code,
    },
    {
      id: "learn",
      label: "Learn",
      icon: GraduationCap,
    },
  ]

  return (
    <div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isSelected = selected === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => setSelected(tab.id)}
            data-selected={isSelected}
            className={cn(
              // Layout & Sizing
              "flex items-center gap-1 rounded-xl px-5 py-2 h-9",
              "max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full",
              
              // Typography & Positioning
              "justify-center text-sm font-semibold whitespace-nowrap",
              "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
              
              // Colors & Effects (Base / Selected State)
              "bg-primary text-primary-foreground shadow-sm backdrop-blur-xl",
              "transition-colors",
              "hover:bg-pink-600/90",
              
              // Borders/Outlines
              "outline-1 outline-secondary/70",
              
              // Conditional Styles (Unselected State via data attribute)
              "data-[selected=false]:bg-secondary/30",
              "data-[selected=false]:text-secondary-foreground/90",
              "data-[selected=false]:hover:bg-secondary",
              "data-[selected=false]:outline-solid",

              // Interactive States
              "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-hidden",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary"
            )}
          >
            <Icon className="max-sm:block" />
            <div>{tab.label}</div>
          </button>
        )
      })}
    </div>
  )
}