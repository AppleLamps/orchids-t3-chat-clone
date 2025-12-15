"use client";

import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopRightSettings() {
  return (
    <div className="absolute right-6 top-10 z-30 flex items-center gap-3">
      <button
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-sm border border-[#15803d] bg-transparent text-[#22c55e]",
          "hover:bg-[#15803d]/20 hover:text-[#4ade80]",
          "focus-visible:ring-1 focus-visible:outline-hidden focus-visible:ring-[#22c55e]"
        )}
        aria-label="Settings"
      >
        <Settings2 className="size-4" />
      </button>
    </div>
  );
}
