"use client";

import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopRightSettings() {
  return (
    <div className="absolute right-6 top-3 z-30 flex items-center gap-3">
      <button
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground shadow-sm backdrop-blur",
          "hover:bg-muted/70 hover:text-foreground",
          "focus-visible:ring-1 focus-visible:outline-hidden focus-visible:ring-ring"
        )}
        aria-label="Settings"
      >
        <Settings2 className="size-4" />
      </button>
    </div>
  );
}