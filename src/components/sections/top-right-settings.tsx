"use client";

import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopRightSettings() {
  return (
    <div className="fixed top-2 right-2 z-20">
      <div className="pointer-events-none absolute inset-0 left-auto -z-10 w-0 rounded-md bg-transparent backdrop-blur-[2px] transition-[background-color,width] delay-0 duration-250 max-sm:bg-sidebar/50 max-sm:delay-125 max-sm:duration-125 max-sm:w-10" />
      
      <div className="text-muted-foreground flex flex-row items-center gap-0.5 rounded-md p-1 transition-all rounded-bl-xl">
        <button
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
            "focus-visible:ring-1 focus-visible:outline-hidden focus-visible:ring-ring",
            "hover:bg-muted/40 hover:text-foreground",
            "relative z-10 size-8"
          )}
          aria-label="Settings"
        >
          <Settings2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
