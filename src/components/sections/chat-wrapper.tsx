"use client";

import { useState } from "react";
import { useChatStore } from "@/hooks/use-chat-store";
import Sidebar from "@/components/sections/sidebar";
import WelcomeHeader from "@/components/sections/welcome-header";
import TermsDisclaimer from "@/components/sections/terms-disclaimer";
import ChatInputForm from "@/components/sections/chat-input-form";
import MobileWarning from "@/components/sections/mobile-warning";
import SidebarToggleButtons from "@/components/sections/sidebar-toggle-buttons";
import TopRightSettings from "@/components/sections/top-right-settings";
import { ChatMessages } from "@/components/sections/chat-messages";

export function ChatWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const {
    chats,
    currentChat,
    currentChatId,
    selectedModel,
    setSelectedModel,
    webSearchEnabled,
    setWebSearchEnabled,
    isLoading,
    attachments,
    addAttachment,
    removeAttachment,
    createNewChat,
    sendMessage,
    selectChat,
    deleteChat,
    searchChats,
    selectedCategory,
    setSelectedCategory,
  } = useChatStore();

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
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={selectChat}
          onDeleteChat={deleteChat}
          onNewChat={createNewChat}
          searchChats={searchChats}
          isOpen={sidebarOpen}
        />
        
        <SidebarToggleButtons 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
          <div className="relative flex h-full flex-col">
            <TopRightSettings />
            
            <div className="flex-1 overflow-y-auto pb-[200px]">
              {currentChat ? (
                <ChatMessages 
                  messages={currentChat.messages} 
                  isLoading={isLoading} 
                />
              ) : (
                <WelcomeHeader 
                  onSendMessage={sendMessage}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />
              )}
            </div>
            
            <div className={`pointer-events-none fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center transition-[left] duration-300 ease-in-out ${sidebarOpen ? 'md:left-[240px]' : 'md:left-0'}`}>
              <TermsDisclaimer />
              <ChatInputForm
                onSend={sendMessage}
                isLoading={isLoading}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                webSearchEnabled={webSearchEnabled}
                onWebSearchToggle={() => setWebSearchEnabled(!webSearchEnabled)}
                attachments={attachments}
                onAddAttachment={addAttachment}
                onRemoveAttachment={removeAttachment}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
