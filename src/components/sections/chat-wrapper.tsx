"use client";

import { useState } from "react";
import { useChatStore, useHydrateStore } from "@/hooks/use-chat-store";
import Sidebar from "@/components/sections/sidebar";
import WelcomeHeader from "@/components/sections/welcome-header";
import TermsDisclaimer from "@/components/sections/terms-disclaimer";
import ChatInputForm from "@/components/sections/chat-input-form";
import MobileWarning from "@/components/sections/mobile-warning";
import SidebarToggleButtons from "@/components/sections/sidebar-toggle-buttons";
import { ChatMessages } from "@/components/sections/chat-messages";

function SidebarPane({ isOpen }: { isOpen: boolean }) {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const selectChat = useChatStore((s) => s.selectChat);
  const deleteChat = useChatStore((s) => s.deleteChat);
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
      onNewChat={createNewChat}
      onClearHistory={clearCurrentChatHistory}
      hasCurrentChat={hasCurrentChat}
      searchChats={searchChats}
      isOpen={isOpen}
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

export function ChatWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Hydrate the store from localStorage on the client side
  useHydrateStore();

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
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarPane isOpen={sidebarOpen} />

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
