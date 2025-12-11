'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export default function MobileWarning() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] block p-3 text-center text-sm backdrop-blur-[2px] md:hidden bg-yellow-500/20 text-foreground">
      <div className="flex items-center justify-center gap-2">
        <span className="mx-8 px-6">We do NOT support mobile yet. Use with caution.</span>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md bg-yellow-500/20 text-sm font-medium transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Close mobile warning"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
