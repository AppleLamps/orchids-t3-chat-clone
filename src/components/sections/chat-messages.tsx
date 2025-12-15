"use client";

import { useEffect, useRef, memo } from "react";
import type { Message } from "@/types/chat";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
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

const UserMessage = memo(function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end w-full">
      <div className="max-w-[85%] py-2 border-r-2 border-[#00ff41] pr-4">
        <p className="text-[14px] leading-relaxed break-words text-[#00ff41] text-right">
          <span className="text-[#00cc33] mr-2">$</span>
          {content}
        </p>
      </div>
    </div>
  );
});

const AssistantMessage = memo(function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="flex flex-col w-full">
      <div className="text-[#00ff41] text-[14px]">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
});

const LoadingIndicator = memo(function LoadingIndicator() {
  return (
    <div className="flex flex-col">
      <div className="flex gap-2 py-2">
        <span className="w-2 h-4 bg-[#00ff41] animate-pulse" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-4 bg-[#00ff41] animate-pulse" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-4 bg-[#00ff41] animate-pulse" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
});

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(messages.length);
  const lastContentLengthRef = useRef(0);

  useEffect(() => {
    const currentContentLength = messages.reduce((acc, m) => acc + (typeof m.content === "string" ? m.content.length : 0), 0);
    
    if (messages.length > lastMessageCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (currentContentLength > lastContentLengthRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
    
    lastMessageCountRef.current = messages.length;
    lastContentLengthRef.current = currentContentLength;
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col gap-8 p-10 max-w-[700px] mx-auto" 
      role="log" 
      aria-live="polite"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? (
            <UserMessage content={getMessageContent(message)} />
          ) : (
            <AssistantMessage content={getMessageContent(message)} />
          )}
        </div>
      ))}
      {isLoading && messages[messages.length - 1]?.role === "user" && <LoadingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
