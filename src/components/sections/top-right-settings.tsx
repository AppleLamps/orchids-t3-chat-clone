"use client";

import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopRightSettings() {
  return (
    <div className="absolute right-6 top-0 z-30">
      <div className="relative hidden h-12 w-16 sm:block">
        <div className="absolute bottom-0 left-0 right-0 h-11 rounded-bl-2xl rounded-br-xl rounded-tl-lg border border-border border-t-0 bg-sidebar shadow-sm" />
        <button
          className={cn(
            "absolute right-2 top-2 inline-flex size-8 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
            "focus-visible:ring-1 focus-visible:outline-hidden focus-visible:ring-ring",
            "hover:bg-muted/40 hover:text-foreground",
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