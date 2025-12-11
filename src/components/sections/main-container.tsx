import React from 'react';
import { cn } from "@/lib/utils";

const NOISE_IMAGE_URL = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/f5b8a575-e4db-4f8a-8172-3a3bd8075b89-t3-chat/assets/images/noise-1.png";

interface MainContainerProps {
  children?: React.ReactNode;
  sidebarOpen?: boolean;
}

export default function MainContainer({ children, sidebarOpen = true }: MainContainerProps) {
  return (
    <main className={cn(
      "min-h-screen relative flex w-full flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out",
      sidebarOpen ? "" : "md:ml-0"
    )}>
      <div className="border-border bg-background absolute top-0 bottom-0 w-full overflow-hidden border-t border-l bg-fixed pb-[140px] transition-all select-none max-sm:border-none sm:translate-y-3.5 sm:rounded-tl-xl">
        <div 
          className="absolute inset-0 -top-3.5 bg-fixed bg-bottom-right transition-transform opacity-40 bg-repeat"
          style={{ backgroundImage: `url(${NOISE_IMAGE_URL})` }}
        />
      </div>

      {/* Curved header swoop - matches AppleLamps.chat design */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none max-sm:hidden">
        <svg
          className="w-full drop-shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
          viewBox="0 0 1440 132"
          preserveAspectRatio="none"
          style={{ height: "96px" }}
        >
          <path
            d="M0 0H960C1145 0 1240 18 1345 60C1390 78 1420 104 1440 132V0Z"
            className="fill-sidebar"
          />
        </svg>
      </div>

      <div className="absolute top-0 bottom-0 w-full overflow-y-auto">
        {children}
      </div>
    </main>
  );
}