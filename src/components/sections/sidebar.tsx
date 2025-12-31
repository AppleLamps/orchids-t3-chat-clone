"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Trash2, X, Pencil, Check, Download } from "lucide-react";
import type { Chat } from "@/types/chat";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat?: (id: string, newTitle: string) => void;
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
  onRenameChat,
  onNewChat,
  onClearHistory,
  hasCurrentChat,
  searchChats,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  const displayedChats = searchQuery ? searchChats(searchQuery) : chats;

  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  const handleSelectChat = (id: string) => {
    if (editingChatId) return; // Don't select while editing
    onSelectChat(id);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onClose?.();
    }
  };

  const handleConfirmDelete = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete.id);
      setChatToDelete(null);
    }
  };

  const startEditing = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditValue(chat.title);
  };

  const saveEdit = () => {
    if (editingChatId && editValue.trim() && onRenameChat) {
      onRenameChat(editingChatId, editValue.trim());
    }
    setEditingChatId(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingChatId(null);
    setEditValue("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const exportChat = (chat: Chat) => {
    const getTextContent = (content: Chat["messages"][0]["content"]): string => {
      if (typeof content === "string") return content;
      return content
        .filter((c) => c.type === "text")
        .map((c) => ("text" in c ? c.text : ""))
        .join("");
    };

    const lines: string[] = [
      `# ${chat.title}`,
      "",
      `**Exported:** ${new Date().toLocaleString()}`,
      `**Created:** ${new Date(chat.createdAt).toLocaleString()}`,
      "",
      "---",
      "",
    ];

    for (const msg of chat.messages) {
      const role = msg.role === "user" ? "**You:**" : "**Assistant:**";
      const content = getTextContent(msg.content);
      lines.push(role);
      lines.push("");
      lines.push(content);
      lines.push("");
      lines.push("---");
      lines.push("");
    }

    const markdown = lines.join("\n");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chat.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="relative mt-4">
          <input
            type="text"
            className="w-full bg-[#1a1a1a] border border-[#00ff4130] text-[#00ff41] py-2.5 px-3 pr-8 text-[12px] outline-none placeholder:text-[#00ff4180] focus:border-[#00ff41] focus:green-glow-box transition-all"
            placeholder="$ grep threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search chats"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#00ff4180] hover:text-[#00ff41] transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-auto py-4">
          {displayedChats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-2 py-2 px-2 cursor-pointer transition-all duration-200 border-b border-[#00ff4130]",
                currentChatId === chat.id
                  ? "bg-[#00ff4120] text-[#00ff41]"
                  : "text-[#00ff4180] hover:text-[#00ff41] hover:pl-3",
                editingChatId === chat.id && "bg-[#00ff4120]"
              )}
              onClick={() => handleSelectChat(chat.id)}
            >
              <span className={cn(
                "text-[#00cc33] opacity-0 transition-opacity duration-200",
                currentChatId === chat.id ? "opacity-100" : "group-hover:opacity-100"
              )}>→</span>
              {editingChatId === chat.id ? (
                <div className="flex-1 flex items-center gap-1">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={saveEdit}
                    className="flex-1 bg-[#0a0a0a] border border-[#00ff41] text-[#00ff41] text-[13px] px-2 py-0.5 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveEdit();
                    }}
                    className="p-1 text-[#28c840] hover:bg-[#00ff4120] transition-all"
                    aria-label="Save title"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-[13px] truncate">
                    {chat.title}
                  </span>
                  {onRenameChat && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(chat);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#00ff4180] hover:text-[#00ff41] transition-all"
                      aria-label={`Rename chat: ${chat.title}`}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportChat(chat);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#00ff4180] hover:text-[#00ff41] transition-all"
                    aria-label={`Export chat: ${chat.title}`}
                  >
                    <Download className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatToDelete(chat);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#00ff4180] hover:text-[#ff5f57] transition-all"
                    aria-label={`Delete chat: ${chat.title}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!chatToDelete} onOpenChange={(open) => !open && setChatToDelete(null)}>
        <AlertDialogContent
          className="bg-[#111111] border border-[#ff5f57] max-w-sm"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#ff5f57]">Delete Chat?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#00ff4180] text-[13px]">
              This will permanently delete &quot;{chatToDelete?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              className="bg-transparent border border-[#00ff4130] text-[#00ff41] hover:bg-[#00ff4120] hover:border-[#00ff41] hover:text-[#00ff41]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-[#ff5f5720] border border-[#ff5f57] text-[#ff5f57] hover:bg-[#ff5f57] hover:text-[#0a0a0a]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
