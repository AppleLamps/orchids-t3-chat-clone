"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { Chat } from "@/types/chat";
import { cn } from "@/lib/utils";

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onNewChat: () => void;
  onClearHistory: () => void;
  hasCurrentChat: boolean;
  searchChats: (query: string) => Chat[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  onClearHistory,
  hasCurrentChat,
  searchChats,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const displayedChats = searchQuery ? searchChats(searchQuery) : chats;

  const handleSelectChat = (id: string) => {
    onSelectChat(id);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "h-screen w-[240px] flex-shrink-0 flex-col bg-[#111111] border-r border-[#00ff4130] transition-all duration-300 ease-in-out overflow-hidden z-50",
          // Mobile: fixed position, slide in from left
          "fixed left-0 top-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: relative position with different animation
          "md:relative md:z-auto",
          isOpen ? "md:flex md:translate-x-0" : "md:flex md:w-0 md:border-r-0 md:opacity-0 md:-translate-x-0"
        )}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
      <div className="flex h-full flex-col p-4">
        {/* Logo */}
        <div className="text-center mb-5">
          <Link
            href="/"
            className="text-[16px] font-bold text-[#00ff41] no-underline green-glow"
          >
            <span className="text-[#00cc33]">{"> "}</span>
            lamps.chat
          </Link>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full bg-[#00ff4120] border border-[#00ff41] text-[#00ff41] py-3 px-4 text-[14px] font-medium cursor-pointer transition-all duration-200 green-glow hover:bg-[#00ff41] hover:text-[#0a0a0a] hover:green-glow-box"
        >
          + New Chat
        </button>

        {/* Search Input */}
        <input
          type="text"
          className="mt-4 w-full bg-[#1a1a1a] border border-[#00ff4130] text-[#00ff41] py-2.5 px-3 text-[12px] outline-none placeholder:text-[#00ff4180] focus:border-[#00ff41] focus:green-glow-box transition-all"
          placeholder="$ grep threads..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Chat List */}
        <div className="flex-1 overflow-auto py-4">
          {displayedChats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-2 py-2 px-2 cursor-pointer transition-all duration-200 border-b border-[#00ff4130]",
                currentChatId === chat.id
                  ? "bg-[#00ff4120] text-[#00ff41]"
                  : "text-[#00ff4180] hover:text-[#00ff41] hover:pl-3"
              )}
              onClick={() => handleSelectChat(chat.id)}
            >
              <span className={cn(
                "text-[#00cc33] opacity-0 transition-opacity duration-200",
                currentChatId === chat.id ? "opacity-100" : "group-hover:opacity-100"
              )}>→</span>
              <span className="flex-1 text-[13px] truncate">
                {chat.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#00ff4180] hover:text-[#ff5f57] transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {displayedChats.length === 0 && chats.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-[11px] text-[#00ff4180] text-center p-5">
              <span>// No chats yet. Start a new conversation!</span>
            </div>
          )}
          {displayedChats.length === 0 && chats.length > 0 && searchQuery && (
            <div className="flex-1 flex items-center justify-center text-[11px] text-[#00ff4180] text-center p-5">
              <span>// No matching chats found.</span>
            </div>
          )}
        </div>

        {/* Clear History Button - only show if there's a current chat with messages */}
        {hasCurrentChat && (
          <button
            onClick={onClearHistory}
            className="w-full mb-4 bg-transparent border border-[#ff5f5730] text-[#ff5f57] py-2 px-3 text-[12px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#ff5f5720] hover:border-[#ff5f57]"
          >
            Clear History
          </button>
        )}

        {/* Footer */}
        <div className="text-[10px] text-[#00ff4180] text-center pt-4 border-t border-[#00ff4130]">
          API costs covered by<br />
          <a
            href="https://x.com/lamps_apple"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00cc33] no-underline hover:text-[#00ff41]"
          >
            Apple Lamps
          </a>
        </div>
      </div>
      </aside>
    </>
  );
}
