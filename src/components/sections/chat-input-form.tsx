"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { ArrowUp, ChevronDown, Globe, Paperclip, X, FileText, Image, Search, Eye, Brain, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODELS } from "@/types/chat";
import type { ModelId, Attachment } from "@/types/chat";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const SUPPORTED_FILE_TYPES = [...SUPPORTED_IMAGE_TYPES, "application/pdf"];

interface ChatInputFormProps {
  onSend: (content: string) => void;
  isLoading: boolean;
  isStreaming: boolean;
  onStopGeneration: () => void;
  selectedModel: ModelId;
  onModelChange: (model: ModelId) => void;
  webSearchEnabled: boolean;
  onWebSearchToggle: () => void;
  attachments: Attachment[];
  onAddAttachment: (attachment: Omit<Attachment, "id">) => void;
  onRemoveAttachment: (id: string) => void;
}

const ModelIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case "grok":
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M3.5 3L10.5 12L3.5 21H6.5L12 14L15.5 18.5L13 21H16L18.5 18.5L20.5 21H23.5L18.5 14.5L16 12L14 9.5L11 13L8 9L12 3H9L6.5 7L4 3H3.5ZM18 3L15 7L17 10L21 3H18Z" />
        </svg>
      );
    case "xai":
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M2.5 3L9.5 12L2.5 21H5.5L12 13L18.5 21H21.5L14.5 12L21.5 3H18.5L12 11L5.5 3H2.5Z" />
        </svg>
      );
    case "mistral":
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <rect x="2" y="2" width="5" height="5" />
          <rect x="9.5" y="2" width="5" height="5" />
          <rect x="17" y="2" width="5" height="5" />
          <rect x="2" y="9.5" width="5" height="5" />
          <rect x="9.5" y="9.5" width="5" height="5" />
          <rect x="17" y="9.5" width="5" height="5" />
          <rect x="2" y="17" width="5" height="5" />
          <rect x="9.5" y="17" width="5" height="5" />
          <rect x="17" y="17" width="5" height="5" />
        </svg>
      );
    case "openai":
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.1408 1.6465 4.4708 4.4708 0 0 1 .5765 3.0037zM8.3 12.7668l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
        </svg>
      );
    case "nvidia":
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M8.948 8.798v-1.43a6.7 6.7 0 0 1 .424-.018c3.922-.124 6.493 3.374 6.493 3.374s-2.774 3.851-5.75 3.851c-.422 0-.832-.068-1.167-.181v-4.987a1.7 1.7 0 0 1 1.167.207l1.893 1.143 2.27-1.903s-1.827-2.142-4.483-2.142a7 7 0 0 0-.847.086m0-3.59v1.205l.424-.035c5.416-.182 8.94 4.553 8.94 4.553s-4.04 5.062-8.008 5.062c-.46 0-.895-.054-1.356-.166v1.349a7.4 7.4 0 0 0 1.194.091c4.04 0 6.972-2.063 9.829-4.553.474.379 2.416 1.308 2.815 1.713-2.711 2.24-9.03 4.101-12.544 4.101-.437 0-.85-.027-1.294-.073v1.825l-3.126.003V5.208z" />
        </svg>
      );
    case "gemini":
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M12 24A14.3 14.3 0 0 0 0 12 14.3 14.3 0 0 0 12 0a14.3 14.3 0 0 0 12 12 14.3 14.3 0 0 0-12 12z" />
        </svg>
      );
    default:
      return <Brain className="w-4 h-4" />;
  }
};

export default function ChatInputForm({
  onSend,
  isLoading,
  isStreaming,
  onStopGeneration,
  selectedModel,
  onModelChange,
  webSearchEnabled,
  onWebSearchToggle,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}: ChatInputFormProps) {
  const [input, setInput] = useState("");
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    onSend(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "24px";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      setFileError(null);

      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE) {
          setFileError(`File "${file.name}" exceeds 10MB limit`);
          continue;
        }

        if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
          setFileError(`File type not supported: ${file.type}`);
          continue;
        }

        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf";

        if (isImage || isPdf) {
          onAddAttachment({
            type: isImage ? "image" : "pdf",
            name: file.name,
            mimeType: file.type,
            size: file.size,
            file,
            previewUrl: isImage ? URL.createObjectURL(file) : undefined,
          });
        }
      }
      e.target.value = "";
    },
    [onAddAttachment]
  );

  const filteredModels = MODELS.filter((model) =>
    model.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const currentModel = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

  // Only calculate position when modal is open
  const modalPosition = useMemo(() => {
    if (!showModelSelector || !modelButtonRef.current) return { bottom: 0, left: 0 };
    const rect = modelButtonRef.current.getBoundingClientRect();
    return {
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left,
    };
  }, [showModelSelector]);

  return (
    <div 
      className="pointer-events-auto w-full max-w-[700px] mx-auto px-4 pb-6"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {fileError && (
        <div className="mb-2 px-3 py-2 bg-[#ff5f5720] border border-[#ff5f57] text-sm text-[#ff5f57] flex items-center justify-between">
          <span>{fileError}</span>
          <button type="button" onClick={() => setFileError(null)} className="p-0.5 hover:bg-[#ff5f5740]" aria-label="Dismiss error">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Input Container */}
      <div className={cn(
        "bg-[#1a1a1a] border border-[#00ff4130] p-4 transition-all duration-200",
        "focus-within:border-[#00ff41] focus-within:shadow-[0_0_10px_#00ff4140,0_0_20px_#00ff4120]"
      )}>
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative flex items-center gap-2 px-3 py-2 bg-[#111111] border border-[#00ff4130]"
              >
                {att.type === "image" && att.previewUrl ? (
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="w-12 h-12 object-cover border border-[#00ff4130] rounded"
                  />
                ) : att.type === "image" ? (
                  <Image className="w-4 h-4 text-[#00ff41]" />
                ) : (
                  <FileText className="w-4 h-4 text-[#00ff41]" />
                )}
                <span className="text-xs text-[#00ff41] max-w-[100px] truncate">
                  {att.name}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(att.id)}
                  className="ml-1 p-0.5 hover:bg-[#00ff4120] transition-colors"
                  aria-label={`Remove ${att.name}`}
                >
                  <X className="w-3 h-3 text-[#00ff41]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent text-[#00ff41] text-[14px] leading-6 outline-none resize-none placeholder:text-[#00ff4180] disabled:opacity-50"
            aria-label="Message input"
            placeholder="Type your message here..."
            rows={1}
            style={{ minHeight: "24px" }}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          {/* Controls */}
          <div className="flex items-center mt-3 gap-2">
            {/* Model Selector */}
            <button
              ref={modelButtonRef}
              type="button"
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-1.5 bg-[#111111] border border-[#00ff4130] text-[#00ff41] py-1.5 px-3 text-[12px] cursor-pointer hover:border-[#00ff41] transition-colors"
              aria-label={`Select model, current: ${currentModel.name}`}
              aria-expanded={showModelSelector}
              aria-haspopup="listbox"
            >
              {currentModel.name}
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Search Button */}
            <button
              type="button"
              onClick={onWebSearchToggle}
              className={cn(
                "flex items-center gap-1.5 bg-transparent border border-[#00ff4130] py-1.5 px-3 text-[12px] cursor-pointer transition-all duration-200",
                webSearchEnabled
                  ? "text-[#00ff41] border-[#00ff41] bg-[#00ff4120]"
                  : "text-[#00ff4180] hover:text-[#00ff41] hover:border-[#00ff41]"
              )}
              aria-label={webSearchEnabled ? "Disable web search" : "Enable web search"}
              aria-pressed={webSearchEnabled}
            >
              <Globe className="w-3.5 h-3.5" />
              Search
            </button>

            {/* Attach Button */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 bg-transparent border border-[#00ff4130] text-[#00ff4180] py-1.5 px-3 text-[12px] cursor-pointer transition-all duration-200 hover:text-[#00ff41] hover:border-[#00ff41]"
              aria-label="Attach files"
            >
              <Paperclip className="w-3.5 h-3.5" />
              Attach
            </button>

            {/* Send/Stop Button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className={cn(
                  "ml-auto w-9 h-9 flex items-center justify-center bg-[#ff5f5720] border border-[#ff5f57] text-[#ff5f57] cursor-pointer transition-all duration-200",
                  "hover:bg-[#ff5f57] hover:text-[#0a0a0a] hover:shadow-[0_0_10px_#ff5f5740,0_0_20px_#ff5f5720]"
                )}
                aria-label="Stop generation"
              >
                <Square className="w-[14px] h-[14px] fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
                className={cn(
                  "ml-auto w-9 h-9 flex items-center justify-center bg-[#00ff4120] border border-[#00ff41] text-[#00ff41] cursor-pointer transition-all duration-200",
                  "hover:bg-[#00ff41] hover:text-[#0a0a0a] hover:shadow-[0_0_10px_#00ff4140,0_0_20px_#00ff4120]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#00ff4120] disabled:hover:text-[#00ff41]"
                )}
                aria-label="Send message"
              >
                <ArrowUp className="w-[18px] h-[18px]" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Model Selector Modal */}
      {showModelSelector && typeof window !== "undefined" && createPortal(
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowModelSelector(false)}
          />
          <div 
            className="fixed w-80 bg-[#111111] border border-[#00ff41] z-[9999] overflow-hidden shadow-[0_0_20px_#00ff4140]"
            style={{
              bottom: modalPosition.bottom,
              left: modalPosition.left,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <div className="p-3 border-b border-[#00ff4130]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ff4180]" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#1a1a1a] border border-[#00ff4130] text-[#00ff41] placeholder-[#00ff4180] focus:outline-none focus:border-[#00ff41]"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-[320px] overflow-y-auto py-1">
              {filteredModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  className={cn(
                    "w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#00ff4120] transition-colors text-left",
                    selectedModel === model.id && "bg-[#00ff4120]"
                  )}
                  onClick={() => {
                    onModelChange(model.id);
                    setShowModelSelector(false);
                    setModelSearch("");
                  }}
                >
                  <div className="flex-shrink-0 text-[#00ff41]">
                    <ModelIcon icon={model.icon} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[13px] font-medium",
                        selectedModel === model.id ? "text-[#00ff41]" : "text-[#00ff4180]"
                      )}>
                        {model.name}
                      </span>
                      {model.id.includes(":free") && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium border border-[#00ff41] text-[#00ff41]">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {model.capabilities.includes("vision") && (
                      <div className="p-1 bg-[#00ff4120]" title="Vision">
                        <Eye className="w-3 h-3 text-[#00ff41]" />
                      </div>
                    )}
                    {model.capabilities.includes("reasoning") && (
                      <div className="p-1 bg-[#00ff4120]" title="Reasoning">
                        <Brain className="w-3 h-3 text-[#00ff41]" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
              {filteredModels.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-[#00ff4180]">
                  No models found
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
