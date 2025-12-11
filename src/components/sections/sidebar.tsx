"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, LogIn, Trash2, MessageSquare } from "lucide-react";
import type { Chat } from "@/types/chat";
import { cn } from "@/lib/utils";

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onNewChat: () => void;
  searchChats: (query: string) => Chat[];
  isOpen?: boolean;
}

export default function Sidebar({
  chats,
  currentChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  searchChats,
  isOpen = true,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const displayedChats = searchQuery ? searchChats(searchQuery) : chats;

  return (
    <aside 
      className={cn(
        "relative h-screen w-[250px] flex-shrink-0 flex-col border-r border-[#E0D0DB] bg-[#F5E6F0] text-[#4A1A3F] font-sans transition-all duration-300 ease-in-out",
        isOpen ? "md:flex md:translate-x-0" : "md:flex md:-translate-x-full md:w-0 md:border-r-0",
        "hidden"
      )}
    >
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-40 mix-blend-soft-light"
        style={{
          backgroundImage: `url('https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/f5b8a575-e4db-4f8a-8172-3a3bd8075b89-t3-chat/assets/images/noise-1.png')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '150px' 
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-col space-y-1 m-1 mb-0 p-0 pt-2">
          <h1 className="flex h-8 shrink-0 items-center justify-center text-lg transition-opacity delay-75 duration-75">
            <Link 
              href="/" 
              className="relative flex h-8 w-24 items-center justify-center text-sm font-semibold text-[#4A1A3F] no-underline"
            >
              <div className="flex h-3.5 items-center justify-center gap-1 select-none">
                lamps.chat
              </div>
            </Link>
          </h1>

          <div className="px-1">
            <button
              onClick={onNewChat}
              className="group inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-lg bg-[#A23B67] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#d56698] active:bg-[#A23B67] no-underline"
            >
              New Chat
            </button>
          </div>

          <div className="border-b border-[#E0D0DB] px-3 pt-1">
            <div className="flex items-center">
              <Search className="mr-3 -ml-[3px] h-4 w-4 min-w-4 text-[#A88A9F]" />
              <input
                type="search"
                className="w-full bg-transparent py-2 text-sm text-[#4A1A3F] placeholder-[#A88A9F]/50 outline-none placeholder:select-none focus:outline-none"
                placeholder="Search your threads..."
                aria-label="Search threads"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-auto relative py-2 px-1">
          {displayedChats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors",
                currentChatId === chat.id
                  ? "bg-[#E8D5E5]"
                  : "hover:bg-[#E8D5E5]/50"
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0 text-[#A88A9F]" />
              <span className="flex-1 text-sm truncate text-[#4A1A3F]">
                {chat.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#E0D0DB] transition-all"
              >
                <Trash2 className="h-3 w-3 text-[#A88A9F]" />
              </button>
            </div>
          ))}
          {displayedChats.length === 0 && chats.length === 0 && (
            <p className="text-xs text-[#A88A9F] text-center py-4">
              No chats yet. Start a new conversation!
            </p>
          )}
          {displayedChats.length === 0 && chats.length > 0 && searchQuery && (
            <p className="text-xs text-[#A88A9F] text-center py-4">
              No matching chats found.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 m-0 p-2 pt-0">
          <a
            href="https://x.com/lamps_apple"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-4 rounded-lg p-4 text-[#A88A9F] hover:bg-[#E8D5E5] transition-colors select-none no-underline"
          >
            <LogIn className="h-4 w-4" />
            <span className="text-sm font-medium">API costs covered by Apple Lamps</span>
          </a>
        </div>
      </div>
    </aside>
  );
}