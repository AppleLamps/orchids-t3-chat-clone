"use client";

import { useEffect, useRef, memo, useState } from "react";
import type { Message, MessageContent } from "@/types/chat";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Copy, Check, RefreshCw, AlertCircle, ArrowDown, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

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

const getMessageImages = (content: MessageContent): string[] => {
  if (typeof content === "string") return [];
  return content
    .filter((c) => c.type === "image_url")
    .map((c) => ("image_url" in c ? c.image_url.url : ""))
    .filter(Boolean);
};

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return messageDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const UserMessage = memo(function UserMessage({
  content,
  timestamp,
  images,
}: {
  content: string;
  timestamp?: Date;
  images?: string[];
}) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <div className="flex justify-end w-full group">
      <div className="max-w-[85%] py-2 border-r-2 border-[#00ff41] pr-4">
        {images && images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 justify-end">
            {images.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setLightboxImage(src)}
                className="relative group/img cursor-zoom-in"
                aria-label={`View attachment ${idx + 1} full size`}
              >
                <img
                  src={src}
                  alt={`Attachment ${idx + 1}`}
                  className="max-w-[200px] max-h-[200px] object-cover border border-[#00ff4130] rounded transition-all hover:border-[#00ff41]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </button>
            ))}
          </div>
        )}
        {content && (
          <p className="text-[14px] leading-relaxed break-words text-[#00ff41] text-right">
            <span className="text-[#00cc33] mr-2">$</span>
            {content}
          </p>
        )}
        {timestamp && (
          <p className="text-[10px] text-[#00ff4140] text-right mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTimestamp(timestamp)}
          </p>
        )}
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent
          className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none overflow-hidden"
          style={{ width: 'auto', height: 'auto' }}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-2 right-2 z-10 p-2 bg-black/70 text-white hover:bg-black transition-colors rounded-full"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>
          {lightboxImage && (
            <img
              src={lightboxImage}
              alt="Full size attachment"
              className="max-w-[90vw] max-h-[85vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

const TypingCursor = memo(function TypingCursor() {
  return (
    <span
      className="inline-block w-2 h-4 bg-[#00ff41] ml-0.5 align-middle animate-pulse"
      style={{ animationDuration: "530ms" }}
      aria-hidden="true"
    />
  );
});

const AssistantMessage = memo(function AssistantMessage({
  content,
  isLast,
  onRegenerate,
  isError,
  timestamp,
  isStreaming,
}: {
  content: string;
  isLast?: boolean;
  onRegenerate?: () => void;
  isError?: boolean;
  timestamp?: Date;
  isStreaming?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            {isStreaming && <TypingCursor />}
          </div>
          {content && (
            <div className={cn(
              "flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity",
              isLast && "opacity-100"
            )}>
              <button
                onClick={handleCopy}
                className="p-1.5 text-[#00ff4160] hover:text-[#00ff41] hover:bg-[#00ff4120] transition-all"
                aria-label={copied ? "Copied" : "Copy message"}
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
                  aria-label="Regenerate response"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
              {timestamp && (
                <span className="text-[10px] text-[#00ff4140] ml-auto">
                  {formatTimestamp(timestamp)}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
});

const LoadingIndicator = memo(function LoadingIndicator({ isStreaming }: { isStreaming?: boolean }) {
  return (
    <div className="flex flex-col" role="status" aria-live="polite">
      <div className="flex items-center gap-3 py-2">
        <div className="flex gap-1.5">
          <span className="w-2 h-4 bg-[#00ff41] animate-pulse" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-4 bg-[#00ff41] animate-pulse" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-4 bg-[#00ff41] animate-pulse" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-[12px] text-[#00ff4180]">
          {isStreaming ? "Generating..." : "Connecting..."}
        </span>
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
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    userScrolledRef.current = false;
    setShowScrollButton(false);
  };

  // Detect if user has scrolled up
  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      userScrolledRef.current = !isAtBottom;
      setShowScrollButton(!isAtBottom && messages.length > 0);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [messages.length]);

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
        const images = message.role === "user" ? getMessageImages(message.content) : [];
        const isError = message.role === "assistant" && content.startsWith("Error:");
        const isLastAssistant = index === lastAssistantIndex;
        const isCurrentlyStreaming = message.id === streamingMessageId;

        return (
          <div key={message.id}>
            {message.role === "user" ? (
              <UserMessage content={content} timestamp={message.createdAt} images={images} />
            ) : (
              <AssistantMessage
                content={content}
                isLast={isLastAssistant && !isCurrentlyStreaming}
                onRegenerate={onRegenerate}
                isError={isError}
                timestamp={!isCurrentlyStreaming ? message.createdAt : undefined}
                isStreaming={isCurrentlyStreaming}
              />
            )}
          </div>
        );
      })}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <LoadingIndicator isStreaming={!!streamingContent} />
      )}
      <div ref={bottomRef} />

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className={cn(
            "fixed bottom-[220px] right-8 z-40 p-2.5",
            "bg-[#111111] border border-[#00ff41] text-[#00ff41]",
            "hover:bg-[#00ff41] hover:text-[#0a0a0a]",
            "transition-all duration-200 shadow-[0_0_10px_#00ff4140]",
            "animate-in fade-in slide-in-from-bottom-2"
          )}
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
