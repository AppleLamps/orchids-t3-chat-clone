"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowUp, ChevronDown, Globe, Paperclip, X, FileText, Image, Search, Eye, Brain, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODELS } from "@/types/chat";
import type { ModelId, Attachment } from "@/types/chat";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const SUPPORTED_FILE_TYPES = [...SUPPORTED_IMAGE_TYPES, "application/pdf"];

interface ChatInputFormProps {
  onSend: (content: string) => void;
  isLoading: boolean;
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
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M3.5 3L10.5 12L3.5 21H6.5L12 14L15.5 18.5L13 21H16L18.5 18.5L20.5 21H23.5L18.5 14.5L16 12L14 9.5L11 13L8 9L12 3H9L6.5 7L4 3H3.5ZM18 3L15 7L17 10L21 3H18Z" />
        </svg>
      );
    case "xai":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M2.5 3L9.5 12L2.5 21H5.5L12 13L18.5 21H21.5L14.5 12L21.5 3H18.5L12 11L5.5 3H2.5Z" />
        </svg>
      );
    case "mistral":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
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
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.1408 1.6465 4.4708 4.4708 0 0 1 .5765 3.0037zM8.3 12.7668l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
        </svg>
      );
    case "nvidia":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M8.948 8.798v-1.43a6.7 6.7 0 0 1 .424-.018c3.922-.124 6.493 3.374 6.493 3.374s-2.774 3.851-5.75 3.851c-.422 0-.832-.068-1.167-.181v-4.987a1.7 1.7 0 0 1 1.167.207l1.893 1.143 2.27-1.903s-1.827-2.142-4.483-2.142a7 7 0 0 0-.847.086m0-3.59v1.205l.424-.035c5.416-.182 8.94 4.553 8.94 4.553s-4.04 5.062-8.008 5.062c-.46 0-.895-.054-1.356-.166v1.349a7.4 7.4 0 0 0 1.194.091c4.04 0 6.972-2.063 9.829-4.553.474.379 2.416 1.308 2.815 1.713-2.711 2.24-9.03 4.101-12.544 4.101-.437 0-.85-.027-1.294-.073v1.825l-3.126.003V5.208z" />
        </svg>
      );
    case "gemini":
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 24A14.3 14.3 0 0 0 0 12 14.3 14.3 0 0 0 12 0a14.3 14.3 0 0 0 12 12 14.3 14.3 0 0 0-12 12z" />
        </svg>
      );
    default:
      return <Brain className="w-5 h-5" />;
  }
};

const getIconColor = (icon: string) => {
  switch (icon) {
    case "grok":
      return "text-black";
    case "xai":
      return "text-slate-700";
    case "mistral":
      return "text-orange-500";
    case "openai":
      return "text-emerald-600";
    case "nvidia":
      return "text-green-500";
    case "gemini":
      return "text-blue-500";
    default:
      return "text-gray-500";
  }
};

export default function ChatInputForm({
  onSend,
  isLoading,
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

        const reader = new FileReader();
        reader.onerror = () => {
          setFileError(`Failed to read file: ${file.name}`);
        };
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const isImage = file.type.startsWith("image/");
          const isPdf = file.type === "application/pdf";

          if (isImage || isPdf) {
            onAddAttachment({
              type: isImage ? "image" : "pdf",
              name: file.name,
              data: dataUrl,
              mimeType: file.type,
            });
          }
        };
        reader.readAsDataURL(file);
      }
      e.target.value = "";
    },
    [onAddAttachment]
  );

  const filteredModels = MODELS.filter((model) =>
    model.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const currentModel = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

  const getModalPosition = () => {
    if (!modelButtonRef.current) return { bottom: 0, left: 0 };
    const rect = modelButtonRef.current.getBoundingClientRect();
    return {
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left,
    };
  };

  const modalPosition = getModalPosition();

  return (
    <div className="pointer-events-auto w-full max-w-6xl mx-auto px-4 pb-0">
      {fileError && (
        <div className="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
          <span>{fileError}</span>
          <button type="button" onClick={() => setFileError(null)} className="p-0.5 hover:bg-red-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="min-w-0 rounded-2xl bg-white/90 p-1.5 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.08),0_2px_12px_rgba(0,0,0,0.04)]">
        <form
          className={cn(
            "text-secondary-foreground pointer-events-auto relative flex w-full min-w-0 flex-col items-stretch gap-2",
            "rounded-xl bg-white/95 px-5 py-4",
            "sm:max-w-6xl"
          )}
          onSubmit={handleSubmit}
        >
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="relative flex items-center gap-2 px-3 py-2 bg-[#F0F0F0] rounded-lg border border-[#E5E5E5]"
                >
                  {att.type === "image" ? (
                    <Image className="w-4 h-4 text-[#333333]" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#333333]" />
                  )}
                  <span className="text-xs text-[#1A1A1A] max-w-[100px] truncate">
                    {att.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(att.id)}
                    className="ml-1 p-0.5 rounded-full hover:bg-[#E5E5E5] transition-colors"
                  >
                    <X className="w-3 h-3 text-[#1A1A1A]" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex min-w-0 grow flex-row items-start">
            <textarea
              ref={textareaRef}
              className="text-foreground placeholder:text-secondary-foreground/60 w-full min-w-0 resize-none bg-transparent text-[17px] leading-7 outline-none disabled:opacity-50"
              aria-label="Message input"
              placeholder="Type your message here..."
              rows={1}
              style={{ minHeight: "44px" }}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>

          <div className="mt-2 flex w-full min-w-0 flex-row-reverse justify-between">
            <div className="-mt-0.5 -mr-0.5 flex shrink-0 items-center justify-center gap-2">
              <button
                className={cn(
                  "inline-flex items-center justify-center gap-2 text-sm whitespace-nowrap transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "shadow-sm",
                  "bg-[#000000] hover:bg-[#333333] active:bg-[#000000]",
                  "disabled:hover:bg-[#000000]",
                  "size-9 relative rounded-lg p-2 text-white font-semibold"
                )}
                aria-label="Send message"
                type="submit"
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
              >
                <ArrowUp className="size-5" />
              </button>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1 relative">
                <button
                  ref={modelButtonRef}
                  className={cn(
                    "justify-center font-medium whitespace-nowrap transition-colors",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "hover:bg-muted/40 hover:text-foreground",
                    "h-8 rounded-md text-xs relative flex max-w-[150px] min-w-0 items-center gap-1 px-1 py-1.5",
                    "sm:gap-2 sm:px-2 md:max-w-none text-muted-foreground"
                  )}
                  type="button"
                  onClick={() => setShowModelSelector(!showModelSelector)}
                >
                  <div className="min-w-0 flex-1 text-left text-sm font-medium">
                    <div className="truncate">{currentModel.name}</div>
                  </div>
                  <ChevronDown className="right-0 size-4" />
                </button>

                {showModelSelector && typeof window !== "undefined" && createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setShowModelSelector(false)}
                    />
                    <div 
                      className="fixed w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden"
                      style={{
                        bottom: modalPosition.bottom,
                        left: modalPosition.left,
                      }}
                    >
                      <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search models..."
                            value={modelSearch}
                            onChange={(e) => setModelSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000000]/20 focus:border-[#000000]/40"
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
                              "w-full px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors",
                              selectedModel === model.id && "bg-[#F0F0F0]"
                            )}
                            onClick={() => {
                              onModelChange(model.id);
                              setShowModelSelector(false);
                              setModelSearch("");
                            }}
                          >
                            <div className={cn("flex-shrink-0", getIconColor(model.icon))}>
                              <ModelIcon icon={model.icon} />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-sm font-medium",
                                  selectedModel === model.id ? "text-[#000000]" : "text-gray-800"
                                )}>
                                  {model.name}
                                </span>
                                {model.id.includes(":free") && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded">
                                    FREE
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {model.capabilities.includes("vision") && (
                                <div className="p-1 rounded bg-sky-100" title="Vision">
                                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                                </div>
                              )}
                              {model.capabilities.includes("reasoning") && (
                                <div className="p-1 rounded bg-violet-100" title="Reasoning">
                                  <Brain className="w-3.5 h-3.5 text-violet-600" />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                        {filteredModels.length === 0 && (
                          <div className="px-3 py-6 text-center text-sm text-gray-500">
                            No models found
                          </div>
                        )}
                      </div>
                      <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
                        <button
                          type="button"
                          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                          <span>Show all</span>
                          <span className="w-2 h-2 rounded-full bg-[#000000]"></span>
                        </button>
                        <Filter className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </>,
                  document.body
                )}
              </div>

              <div className="shrink-0">
                <button
                  className={cn(
                    "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors",
                    "hover:bg-muted/40 hover:text-foreground",
                    "text-xs border-secondary-foreground/10 h-8 gap-2 rounded-full border border-solid px-2 sm:px-2.5",
                    webSearchEnabled
                      ? "bg-[#000000] text-white border-[#000000]"
                      : "text-muted-foreground"
                  )}
                  type="button"
                  onClick={onWebSearchToggle}
                >
                  <Globe className="size-4" />
                  <span className="hidden sm:block">Search</span>
                </button>
              </div>

              <div className="shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleFileChange}
                />
                <button
                  className={cn(
                    "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors",
                    "hover:bg-muted/40 hover:text-foreground",
                    "text-xs border-secondary-foreground/10 text-muted-foreground h-8 gap-2 rounded-full border border-solid px-2 sm:px-2.5"
                  )}
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="size-4" />
                  <span className="hidden sm:block">Attach</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}