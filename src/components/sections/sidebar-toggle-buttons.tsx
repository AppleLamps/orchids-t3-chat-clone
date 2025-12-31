"use client";

import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleButtonsProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function SidebarToggleButtons({ isOpen, onToggle }: SidebarToggleButtonsProps) {
  return (
    <div className={cn(
      "fixed top-14 z-[60] flex flex-row gap-1 p-1 transition-[left] duration-300 ease-in-out",
      // On mobile: always show on left when closed, hide when open
      isOpen ? "left-[248px] md:left-[248px]" : "left-2",
      // Hide toggle when sidebar is open on mobile (overlay handles close)
      isOpen && "max-md:opacity-0 max-md:pointer-events-none"
    )}>
      <button
        onClick={onToggle}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center text-sm transition-all duration-200 z-10",
          "bg-[#111111] border border-[#00ff4130] text-[#00ff4180]",
          "hover:border-[#00ff41] hover:text-[#00ff41] hover:shadow-[0_0_10px_#00ff4140]"
        )}
        aria-label={isOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        <PanelLeft className="h-4 w-4" />
      </button>
    </div>
  );
}
