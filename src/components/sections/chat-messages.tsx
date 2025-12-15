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
      <div className="max-w-[85%] pl-4 border-l-2 border-[#22c55e] py-1">
        <p className="text-[15px] leading-relaxed break-words font-bold text-[#22c55e] font-mono text-right">
          <span className="mr-2 opacity-50">$</span>
          {content}
        </p>
      </div>
    </div>
  );
});

const AssistantMessage = memo(function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="flex flex-col w-full">
      <div className="text-[#22c55e] text-[15px] font-mono">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
});

const LoadingIndicator = memo(function LoadingIndicator() {
  return (
    <div className="flex flex-col">
      <div className="flex gap-2 py-2">
        <span className="w-3 h-3 bg-[#22c55e] animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-3 h-3 bg-[#22c55e] animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-3 h-3 bg-[#22c55e] animate-bounce" style={{ animationDelay: "300ms" }} />
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
    <div ref={containerRef} className="flex flex-col gap-8 px-4 pt-8 pb-8 max-w-3xl mx-auto font-mono" role="log" aria-live="polite">
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
