"use client";

import { useEffect, useRef, memo, useState } from "react";
import type { Message } from "@/types/chat";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Copy, Check, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  streamingMessageId?: string | null;
  streamingContent?: string;
  onRegenerate?: () => void;
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

const AssistantMessage = memo(function AssistantMessage({
  content,
  isLast,
  onRegenerate,
  onCopy,
  isError,
}: {
  content: string;
  isLast?: boolean;
  onRegenerate?: () => void;
  onCopy?: () => void;
  isError?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <div className="flex flex-col w-full group">
      {isError ? (
        <div className="flex items-start gap-3 p-4 bg-[#ff5f5710] border border-[#ff5f5730]">
          <AlertCircle className="w-5 h-5 text-[#ff5f57] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[#ff5f57] text-[14px] mb-3">{content}</p>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-2 px-3 py-1.5 text-[12px] bg-[#ff5f5720] border border-[#ff5f57] text-[#ff5f57] hover:bg-[#ff5f57] hover:text-[#0a0a0a] transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="text-[#00ff41] text-[14px]">
            <MarkdownRenderer content={content} />
          </div>
          {content && (
            <div className={cn(
              "flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
              isLast && "opacity-100"
            )}>
              <button
                onClick={handleCopy}
                className="p-1.5 text-[#00ff4160] hover:text-[#00ff41] hover:bg-[#00ff4120] transition-all"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-[#28c840]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              {isLast && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 text-[#00ff4160] hover:text-[#00ff41] hover:bg-[#00ff4120] transition-all"
                  title="Regenerate response"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </>
      )}
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

export function ChatMessages({ messages, isLoading, streamingMessageId, streamingContent, onRegenerate }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(messages.length);
  const lastContentLengthRef = useRef(0);
  const userScrolledRef = useRef(false);

  // Detect if user has scrolled up
  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      userScrolledRef.current = !isAtBottom;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const currentContentLength = messages.reduce((acc, m) => {
      const isStreaming = m.id === streamingMessageId;
      if (isStreaming) return acc + (streamingContent?.length ?? 0);
      return acc + (typeof m.content === "string" ? m.content.length : 0);
    }, 0);

    // Only auto-scroll if user hasn't scrolled up
    if (!userScrolledRef.current) {
      if (messages.length > lastMessageCountRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        userScrolledRef.current = false;
      } else if (currentContentLength > lastContentLengthRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: "instant" });
      }
    }

    lastMessageCountRef.current = messages.length;
    lastContentLengthRef.current = currentContentLength;
  }, [messages, streamingMessageId, streamingContent]);

  if (messages.length === 0) {
    return null;
  }

  const lastAssistantIndex = messages.reduce((lastIdx, msg, idx) =>
    msg.role === "assistant" ? idx : lastIdx, -1);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-8 px-10 pt-16 pb-10 max-w-[700px] mx-auto"
      role="log"
      aria-live="polite"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {messages.map((message, index) => {
        const content = message.id === streamingMessageId
          ? (streamingContent ?? "")
          : getMessageContent(message);
        const isError = message.role === "assistant" && content.startsWith("Error:");
        const isLastAssistant = index === lastAssistantIndex;
        const isCurrentlyStreaming = message.id === streamingMessageId;

        return (
          <div key={message.id}>
            {message.role === "user" ? (
              <UserMessage content={content} />
            ) : (
              <AssistantMessage
                content={content}
                isLast={isLastAssistant && !isCurrentlyStreaming}
                onRegenerate={onRegenerate}
                isError={isError}
              />
            )}
          </div>
        );
      })}
      {isLoading && messages[messages.length - 1]?.role === "user" && <LoadingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
