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
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl bg-[#E8E8E8] text-[#333] px-5 py-3">
        <p className="text-[15px] leading-relaxed break-words">{content}</p>
      </div>
    </div>
  );
});

const AssistantMessage = memo(function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="flex flex-col">
      <div className="text-[#1A1A1A] text-[15px]">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
});

const LoadingIndicator = memo(function LoadingIndicator() {
  return (
    <div className="flex flex-col">
      <div className="flex gap-1.5 py-2">
        <span className="w-2 h-2 bg-[#000000] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-[#000000] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-[#000000] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
});

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 px-4 pt-16 pb-8 max-w-6xl mx-auto" role="log" aria-live="polite">
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