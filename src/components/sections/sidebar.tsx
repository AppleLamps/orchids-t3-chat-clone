"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, LogIn, Trash2, MessageSquare, Terminal } from "lucide-react";
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
        "relative h-screen w-[250px] flex-shrink-0 flex-col border-r border-[#15803d] bg-black text-[#22c55e] font-mono transition-all duration-300 ease-in-out",
        isOpen ? "md:flex md:translate-x-0" : "md:flex md:-translate-x-full md:w-0 md:border-r-0",
        "hidden"
      )}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-col space-y-4 m-0 p-4 pt-4 border-b border-[#15803d]">
           {/* Window Controls */}
           <div className="flex gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"></div>
          </div>

          <h1 className="flex h-8 shrink-0 items-center text-lg">
            <Link 
              href="/" 
              className="relative flex items-center gap-2 text-sm font-bold text-[#22c55e] hover:text-[#4ade80] no-underline transition-colors"
            >
              <span className="text-[#22c55e]">{">"}</span>
              <span>lamps.chat</span>
            </Link>
          </h1>

          <div>
            <button
              onClick={onNewChat}
              className="group w-full flex items-center justify-center gap-2 border border-[#22c55e] bg-transparent px-4 py-2 text-sm font-bold text-[#22c55e] hover:bg-[#22c55e] hover:text-black transition-all duration-200 uppercase tracking-wider"
            >
              <span>+ New Chat</span>
            </button>
          </div>

          <div className="pt-2">
            <div className="flex items-center border border-[#15803d] px-2 py-1 bg-black">
              <span className="text-[#22c55e] mr-2">$</span>
              <input
                type="search"
                className="w-full bg-transparent py-1 text-sm text-[#22c55e] placeholder-[#15803d] outline-none focus:outline-none font-mono"
                placeholder="grep threads..."
                aria-label="Search threads"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-auto relative py-2 px-2 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-black">
          {displayedChats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors border border-transparent hover:border-[#15803d] hover:bg-[#0a0a0a]",
                currentChatId === chat.id
                  ? "border-[#22c55e] bg-[#0a0a0a]"
                  : ""
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <span className="text-[#15803d] group-hover:text-[#22c55e]">{">"}</span>
              <span className="flex-1 text-sm truncate text-[#22c55e]/80 group-hover:text-[#22c55e]">
                {chat.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          {displayedChats.length === 0 && chats.length === 0 && (
            <div className="p-4 text-xs text-[#15803d] font-mono">
              <p className="mb-1">// No chats yet.</p>
              <p>// Start a new conversation!</p>
            </div>
          )}
          {displayedChats.length === 0 && chats.length > 0 && searchQuery && (
            <div className="p-4 text-xs text-[#15803d] font-mono">
              <p>// No matching chats found.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 m-0 p-4 border-t border-[#15803d]">
          <a
            href="https://x.com/lamps_apple"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2 text-[#15803d] hover:text-[#22c55e] transition-colors select-none no-underline text-xs"
          >
            <span>{"->"}</span>
            <span className="font-medium">API costs covered by Apple Lamps</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
