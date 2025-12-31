"use client";

import { useState, useEffect, useCallback } from "react";
import { useChatStore, useHydrateStore } from "@/hooks/use-chat-store";
import Sidebar from "@/components/sections/sidebar";
import WelcomeHeader from "@/components/sections/welcome-header";
import TermsDisclaimer from "@/components/sections/terms-disclaimer";
import ChatInputForm from "@/components/sections/chat-input-form";
import MobileWarning from "@/components/sections/mobile-warning";
import SidebarToggleButtons from "@/components/sections/sidebar-toggle-buttons";
import { ChatMessages } from "@/components/sections/chat-messages";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function SidebarPane({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const selectChat = useChatStore((s) => s.selectChat);
  const deleteChat = useChatStore((s) => s.deleteChat);
  const renameChat = useChatStore((s) => s.renameChat);
  const createNewChat = useChatStore((s) => s.createNewChat);
  const clearCurrentChatHistory = useChatStore((s) => s.clearCurrentChatHistory);
  const searchChats = useChatStore((s) => s.searchChats);
  const hasCurrentChat = useChatStore((s) => {
    const current = s.chats.find((c) => c.id === s.currentChatId) ?? null;
    return !!current && current.messages.length > 0;
  });

  return (
    <Sidebar
      chats={chats}
      currentChatId={currentChatId}
      onSelectChat={selectChat}
      onDeleteChat={deleteChat}
      onRenameChat={renameChat}
      onNewChat={createNewChat}
      onClearHistory={clearCurrentChatHistory}
      hasCurrentChat={hasCurrentChat}
      searchChats={searchChats}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}

function MessagesPane() {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const isLoading = useChatStore((s) => s.isLoading);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const regenerateLastMessage = useChatStore((s) => s.regenerateLastMessage);
  const selectedCategory = useChatStore((s) => s.selectedCategory);
  const setSelectedCategory = useChatStore((s) => s.setSelectedCategory);
  const streamingMessageId = useChatStore((s) => s.streaming.messageId);
  const streamingContent = useChatStore((s) => s.streaming.content);

  const currentChat = chats.find((c) => c.id === currentChatId) ?? null;

  return (
    <div className="flex-1 overflow-y-auto pb-[200px]">
      {currentChat ? (
        <ChatMessages
          messages={currentChat.messages}
          isLoading={isLoading}
          streamingMessageId={streamingMessageId}
          streamingContent={streamingContent}
          onRegenerate={regenerateLastMessage}
        />
      ) : (
        <WelcomeHeader
          onSendMessage={sendMessage}
          selectedCategory={selectedCategory}
          onCategoryChange={(category) => setSelectedCategory(category)}
        />
      )}
    </div>
  );
}

function ComposerPane({ sidebarOpen }: { sidebarOpen: boolean }) {
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isLoading = useChatStore((s) => s.isLoading);
  const isStreaming = useChatStore((s) => s.streaming.messageId !== null);
  const stopGeneration = useChatStore((s) => s.stopGeneration);
  const selectedModel = useChatStore((s) => s.selectedModel);
  const setSelectedModel = useChatStore((s) => s.setSelectedModel);
  const webSearchEnabled = useChatStore((s) => s.webSearchEnabled);
  const toggleWebSearchEnabled = useChatStore((s) => s.toggleWebSearchEnabled);
  const attachments = useChatStore((s) => s.attachments);
  const addAttachment = useChatStore((s) => s.addAttachment);
  const removeAttachment = useChatStore((s) => s.removeAttachment);

  return (
    <div
      className={`pointer-events-none fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center transition-[left] duration-300 ease-in-out ${sidebarOpen ? "md:left-[240px]" : "md:left-0"}`}
    >
      <TermsDisclaimer />
      <ChatInputForm
        onSend={sendMessage}
        isLoading={isLoading}
        isStreaming={isStreaming}
        onStopGeneration={stopGeneration}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        webSearchEnabled={webSearchEnabled}
        onWebSearchToggle={toggleWebSearchEnabled}
        attachments={attachments}
        onAddAttachment={addAttachment}
        onRemoveAttachment={removeAttachment}
      />
    </div>
  );
}

const KEYBOARD_SHORTCUTS = [
  { keys: ["⌘", "N"], description: "New chat" },
  { keys: ["⌘", "⇧", "S"], description: "Toggle sidebar" },
  { keys: ["⌘", "/"], description: "Show keyboard shortcuts" },
  { keys: ["Esc"], description: "Stop generation" },
  { keys: ["Enter"], description: "Send message" },
  { keys: ["⇧", "Enter"], description: "New line in message" },
];

export function ChatWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const createNewChat = useChatStore((s) => s.createNewChat);
  const stopGeneration = useChatStore((s) => s.stopGeneration);
  const isStreaming = useChatStore((s) => s.streaming.messageId !== null);

  // Hydrate the store from localStorage on the client side
  useHydrateStore();

  // Global keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMod = e.metaKey || e.ctrlKey;

    // Cmd/Ctrl+N: New chat
    if (isMod && e.key === "n") {
      e.preventDefault();
      createNewChat();
      return;
    }

    // Cmd/Ctrl+Shift+S: Toggle sidebar
    if (isMod && e.shiftKey && e.key === "s") {
      e.preventDefault();
      setSidebarOpen((prev) => !prev);
      return;
    }

    // Cmd/Ctrl+/: Show keyboard shortcuts
    if (isMod && e.key === "/") {
      e.preventDefault();
      setShowShortcuts((prev) => !prev);
      return;
    }

    // Escape: Stop generation if streaming, or close shortcuts dialog
    if (e.key === "Escape") {
      if (showShortcuts) {
        setShowShortcuts(false);
        return;
      }
      if (isStreaming) {
        e.preventDefault();
        stopGeneration();
        return;
      }
    }
  }, [createNewChat, stopGeneration, isStreaming, showShortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden bg-[#0a0a0a] border border-[#00ff4130]"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Scanline Overlay */}
      <div className="scanlines" />

      <MobileWarning />

      {/* Title Bar */}
      <div className="flex items-center py-3 px-4 bg-[#111111] border-b border-[#00ff4130] gap-2 relative z-10">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 text-center text-[12px] text-[#00ff4180]">
          lamps.chat — zsh — 80×24
        </div>
        <button
          onClick={() => setShowShortcuts(true)}
          className="p-1.5 text-[#00ff4160] hover:text-[#00ff41] hover:bg-[#00ff4120] transition-all rounded"
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (⌘/)"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent
          className="bg-[#111111] border border-[#00ff41] max-w-sm"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <DialogHeader>
            <DialogTitle className="text-[#00ff41] flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {KEYBOARD_SHORTCUTS.map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-[13px] text-[#00ff4180]">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIdx) => (
                    <kbd
                      key={keyIdx}
                      className="px-2 py-1 text-[11px] bg-[#0a0a0a] border border-[#00ff4130] text-[#00ff41] rounded"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#00ff4140] mt-4 text-center">
            Use Ctrl instead of ⌘ on Windows/Linux
          </p>
        </DialogContent>
      </Dialog>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarPane isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <SidebarToggleButtons
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
          <div className="relative flex h-full flex-col">
            <MessagesPane />
            <ComposerPane sidebarOpen={sidebarOpen} />
          </div>
        </main>
      </div>
    </div>
  );
}
