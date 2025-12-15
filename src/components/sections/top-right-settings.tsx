"use client";

import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopRightSettings() {
  return (
    <div className="absolute right-6 top-6 z-30 flex items-center gap-3">
      <button
        className={cn(
          "inline-flex size-8 items-center justify-center",
          "bg-[#1a1a1a] border border-[#00ff4130] text-[#00ff4180]",
          "hover:border-[#00ff41] hover:text-[#00ff41] hover:shadow-[0_0_10px_#00ff4140]",
          "transition-all duration-200"
        )}
        aria-label="Settings"
      >
        <Settings2 className="size-4" />
      </button>
    </div>
  );
}
