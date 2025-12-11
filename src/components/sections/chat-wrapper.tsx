"use client";

import { useState } from "react";
import { useChatStore } from "@/hooks/use-chat-store";
import Sidebar from "@/components/sections/sidebar";
import MainContainer from "@/components/sections/main-container";
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
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <MobileWarning />
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
      
      <MainContainer sidebarOpen={sidebarOpen}>
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
          
          <div className={`pointer-events-none fixed bottom-0 left-0 right-0 z-30 flex flex-col items-center transition-[left] duration-300 ease-in-out ${sidebarOpen ? 'md:left-[250px]' : 'md:left-0'}`}>
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
      </MainContainer>
    </div>
  );
}