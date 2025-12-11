"use client";

import Link from "next/link";
import { PanelLeft, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleButtonsProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SidebarToggleButtons({ isOpen, onToggle }: SidebarToggleButtonsProps) {
  return (
    <div className={cn(
      "fixed top-2 z-50 flex flex-row gap-0.5 p-1 transition-[left] duration-300 ease-in-out",
      isOpen ? "left-[258px]" : "left-2"
    )}>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 right-auto -z-10 rounded-md bg-transparent",
          "transition-[background-color,width] delay-0 duration-250",
          "max-sm:w-[108px] max-sm:bg-[#F5E6F0]/50 max-sm:delay-125 max-sm:duration-125",
          "w-10 backdrop-blur-[2px]"
        )}
      />

      <button
        onClick={onToggle}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors z-10",
          "text-[#A88A9F]",
          "hover:bg-[#A88A9F]/40 hover:text-[#4A1A3F]",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A23B67]"
        )}
        aria-label="Toggle Sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      <button
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
          "text-[#A88A9F]",
          "hover:bg-[#A88A9F]/40 hover:text-[#4A1A3F]",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A23B67]",
          "transition-[transform,opacity] delay-150 duration-250",
          "translate-x-0 opacity-100",
          "sm:pointer-events-none sm:-translate-x-[34px] sm:opacity-0 sm:delay-0 sm:duration-150"
        )}
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>

      <Link
        href="/"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors no-underline",
          "text-[#A88A9F]",
          "hover:bg-[#A88A9F]/40 hover:text-[#4A1A3F]",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A23B67]",
          "transition-[transform,opacity] delay-150 duration-150",
          "translate-x-0 opacity-100 active:scale-95",
          "sm:pointer-events-none sm:-translate-x-[34px] sm:opacity-0 sm:delay-0 sm:duration-150"
        )}
        aria-label="New Thread"
      >
        <Plus className="h-4 w-4" />
      </Link>
    </div>
  );
}