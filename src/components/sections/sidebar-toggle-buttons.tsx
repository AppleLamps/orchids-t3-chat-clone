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
      "fixed top-14 z-50 flex flex-row gap-1 p-1 transition-[left] duration-300 ease-in-out",
      isOpen ? "left-[248px]" : "left-2"
    )}>
      <button
        onClick={onToggle}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center text-sm transition-all duration-200 z-10",
          "bg-[#111111] border border-[#00ff4130] text-[#00ff4180]",
          "hover:border-[#00ff41] hover:text-[#00ff41] hover:shadow-[0_0_10px_#00ff4140]"
        )}
        aria-label="Toggle Sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      <button
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center text-sm transition-all duration-200",
          "bg-[#111111] border border-[#00ff4130] text-[#00ff4180]",
          "hover:border-[#00ff41] hover:text-[#00ff41]",
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
          "inline-flex h-8 w-8 items-center justify-center text-sm transition-all duration-200 no-underline",
          "bg-[#111111] border border-[#00ff4130] text-[#00ff4180]",
          "hover:border-[#00ff41] hover:text-[#00ff41]",
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
