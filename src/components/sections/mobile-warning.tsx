'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export default function MobileWarning() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed left-0 right-0 top-0 z-[100] block p-3 text-center text-sm md:hidden bg-[#febc2e20] text-[#febc2e] border-b border-[#febc2e30]"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="mx-8 px-6 text-[12px]">// WARNING: Mobile not supported. Use with caution.</span>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-sm font-medium transition-colors border border-[#febc2e30] hover:bg-[#febc2e20] hover:border-[#febc2e] text-[#febc2e]"
          aria-label="Close mobile warning"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
