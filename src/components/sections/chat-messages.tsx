"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

function ReasoningSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="flex items-center gap-2 text-sm text-[#6b5060] hover:text-[#4A1A3F] transition-colors mb-3"
    >
      <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <span className="font-medium">Reasoning</span>
      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </button>
  );
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  const getMessageContent = (message: Message): string => {
    if (typeof message.content === "string") {
      return message.content;
    }
    return message.content
      .filter((c) => c.type === "text")
      .map((c) => ("text" in c ? c.text : ""))
      .join("");
  };

  return (
    <div className="flex flex-col gap-8 px-4 pt-16 pb-8 max-w-3xl mx-auto">
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? (
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl bg-[#E8E8E8] text-[#333] px-5 py-3">
                <p className="text-[15px] leading-relaxed">{getMessageContent(message)}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <ReasoningSection />
              <div className="text-[#4A1A3F] text-[15px]">
                <MarkdownRenderer content={getMessageContent(message)} />
              </div>
            </div>
          )}
        </div>
      ))}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="flex flex-col">
          <ReasoningSection />
          <div className="flex gap-1.5 py-2">
            <span className="w-2 h-2 bg-[#A23B67] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-[#A23B67] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-[#A23B67] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}