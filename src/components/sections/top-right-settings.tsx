"use client";

import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopRightSettings() {
  return (
    <div className="absolute right-4 top-1 z-30">
      <div className="relative hidden h-[52px] w-20 sm:block">
        <div className="absolute inset-x-0 bottom-0 h-[44px] rounded-bl-3xl rounded-br-[30px] rounded-tl-2xl border border-border border-t-0 bg-sidebar shadow-[0_10px_24px_rgba(15,23,42,0.08)]" />
        <button
          className={cn(
            "absolute right-2 top-2 inline-flex size-9 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
            "focus-visible:ring-1 focus-visible:outline-hidden focus-visible:ring-ring",
            "hover:bg-muted/50 hover:text-foreground",
            "text-muted-foreground"
          )}
          aria-label="Settings"
        >
          <Settings2 className="size-4" />
        </button>
      </div>

      <button
        className={cn(
          "sm:hidden inline-flex size-8 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors",
          "focus-visible:ring-1 focus-visible:outline-hidden focus-visible:ring-ring",
          "hover:bg-muted/40 hover:text-foreground"
        )}
        aria-label="Settings"
      >
        <Settings2 className="size-4" />
      </button>
    </div>
  );
}