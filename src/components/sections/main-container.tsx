import React from 'react';
import { cn } from "@/lib/utils";

interface MainContainerProps {
  children?: React.ReactNode;
  sidebarOpen?: boolean;
}

export default function MainContainer({ children, sidebarOpen = true }: MainContainerProps) {
  return (
    <main className={cn(
      "min-h-screen relative flex w-full flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out bg-black",
      sidebarOpen ? "" : "md:ml-0"
    )}>
      {/* Scanline overlay */}
      <div className="scanlines" />

      {/* Main Content Area */}
      <div className="absolute top-0 bottom-0 w-full overflow-y-auto bg-black text-[#22c55e]">
        {children}
      </div>
    </main>
  );
}
