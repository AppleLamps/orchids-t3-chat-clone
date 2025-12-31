"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Chat, Message, ModelId, Attachment, MessageContent } from "@/types/chat";
import { MODELS } from "@/types/chat";
import { useEffect, useState } from "react";

export type CategoryId = "create" | "explore" | "code" | "learn";

const CATEGORY_SYSTEM_PROMPTS: Record<CategoryId, string> = {
  create: "You are a creative assistant. Help users with writing, brainstorming, storytelling, content creation, and artistic ideas. Be imaginative, inspiring, and offer unique perspectives. Encourage creativity and think outside the box.",
  explore: "You are a research and discovery assistant. Help users explore topics, find information, analyze data, and understand complex subjects. Be thorough, provide multiple perspectives, and cite relevant context when helpful.",
  code: `You are an expert coding assistant. Help users write, debug, and understand code.

When asked to create web content (games, interactive elements, visualizations, demos, etc.):
- ALWAYS create a single HTML file with embedded CSS in <style> tags and JavaScript in <script> tags
- Make it immediately runnable in a browser without any build steps or external dependencies
- Include all styling inline - do not reference external stylesheets
- The HTML should be complete and self-contained

For other code requests:
- Provide clean, efficient, and well-documented solutions
- Explain technical concepts clearly
- Follow best practices for the relevant programming languages`,
  learn: "You are an educational assistant. Help users learn new concepts, understand difficult topics, and develop their skills. Break down complex ideas into digestible parts, use analogies, and adapt your explanations to the user's level of understanding.",
};

const STORAGE_KEY = "t3-chat-history";
const STORAGE_DEBOUNCE_MS = 600;
// Keep well below typical 5MB per-origin limits.
const MAX_STORAGE_BYTES_APPROX = 4_000_000;

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function loadChatsFromStorage(): Chat[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((chat: Chat) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map((msg: Message) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      })),
    }));
  } catch {
    return [];
  }
}

function isQuotaExceededError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  // DOMException name is "QuotaExceededError" in most browsers; message varies.
  return error.name === "QuotaExceededError" || /quota/i.test(error.message);
}

function approximateUtf16Bytes(text: string): number {
  // JS strings are UTF-16; 2 bytes per code unit is a decent approximation for quota sizing.
  return text.length * 2;
}

function normalizeMessageContentForStorage(content: MessageContent): string {
  if (typeof content === "string") return content;
  return content
    .filter((c) => c.type === "text")
    .map((c) => ("text" in c ? c.text : ""))
    .join("");
}

function sanitizeChatsForStorage(chats: Chat[]): Chat[] {
  // Prevent accidental persistence of large/binary fields (e.g., image/file payloads).
  // The UI currently renders only text content anyway.
  return chats.map((chat) => ({
    ...chat,
    messages: chat.messages.map((m) => ({
      ...m,
      content: normalizeMessageContentForStorage(m.content),
    })),
  }));
}

function pruneChatsToFit(chats: Chat[]): Chat[] {
  // Drop oldest chats until we fit. Chats are stored newest-first in this app.
  let pruned = [...chats];
  while (pruned.length > 0) {
    const candidate = JSON.stringify(pruned);
    if (approximateUtf16Bytes(candidate) <= MAX_STORAGE_BYTES_APPROX) return pruned;
    pruned = pruned.slice(0, -1);
  }
  return [];
}

function saveChatsToStorage(chats: Chat[]) {
  if (typeof window === "undefined") return;
  try {
    const sanitized = sanitizeChatsForStorage(chats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    if (isQuotaExceededError(e)) {
      try {
        const pruned = pruneChatsToFit(sanitizeChatsForStorage(chats));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
        return;
      } catch (e2) {
        console.error("Failed to save pruned chats to localStorage:", e2);
        return;
      }
    }
    console.error("Failed to save chats to localStorage:", e);
  }
}

type StreamingState = {
  chatId: string | null;
  messageId: string | null;
  content: string;
  abortController: AbortController | null;
};

interface ChatStoreState {
  chats: Chat[];
  currentChatId: string | null;
  selectedModel: ModelId;
  webSearchEnabled: boolean;
  isLoading: boolean;
  attachments: Attachment[];
  selectedCategory: CategoryId | null;
  streaming: StreamingState;
  _hydrated: boolean;

  setSelectedModel: (model: ModelId) => void;
  toggleWebSearchEnabled: () => void;
  setSelectedCategory: (category: CategoryId | null) => void;

  createNewChat: () => void;
  addAttachment: (attachment: Omit<Attachment, "id">) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;

  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  regenerateLastMessage: () => Promise<void>;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  clearCurrentChatHistory: () => void;
  searchChats: (query: string) => Chat[];
  _hydrateFromStorage: () => void;
}

function revokePreviewUrl(attachment: Attachment) {
  if (typeof window === "undefined") return;
  if (attachment.previewUrl) {
    try {
      URL.revokeObjectURL(attachment.previewUrl);
    } catch {
      // ignore
    }
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

export const useChatStore = create<ChatStoreState>()(
  subscribeWithSelector((set, get) => ({
    // Always start with empty array to prevent hydration mismatch
    chats: [],
    currentChatId: null,
    selectedModel: MODELS.find((m) => m.isDefault)?.id ?? MODELS[0].id,
    webSearchEnabled: false,
    isLoading: false,
    attachments: [],
    selectedCategory: null,
    streaming: { chatId: null, messageId: null, content: "", abortController: null },
    _hydrated: false,

    _hydrateFromStorage: () => {
      if (get()._hydrated) return;
      const chats = loadChatsFromStorage();
      set({ chats, _hydrated: true });
    },

    setSelectedModel: (model) => set({ selectedModel: model }),
    toggleWebSearchEnabled: () => set((s) => ({ webSearchEnabled: !s.webSearchEnabled })),
    setSelectedCategory: (category) => set({ selectedCategory: category }),

    createNewChat: () => {
      const { attachments, streaming } = get();
      attachments.forEach(revokePreviewUrl);
      if (streaming.abortController) {
        streaming.abortController.abort();
      }
      set({ currentChatId: null, attachments: [], selectedCategory: null, streaming: { chatId: null, messageId: null, content: "", abortController: null } });
    },

    addAttachment: (attachment) => {
      set((s) => ({ attachments: [...s.attachments, { ...attachment, id: generateId() }] }));
    },

    removeAttachment: (id) => {
      const { attachments } = get();
      const toRemove = attachments.find((a) => a.id === id);
      if (toRemove) revokePreviewUrl(toRemove);
      set((s) => ({ attachments: s.attachments.filter((a) => a.id !== id) }));
    },

    clearAttachments: () => {
      const { attachments } = get();
      attachments.forEach(revokePreviewUrl);
      set({ attachments: [] });
    },

    sendMessage: async (content: string) => {
      const state = get();
      if (!content.trim() && state.attachments.length === 0) return;

      // Abort any existing generation
      if (state.streaming.abortController) {
        state.streaming.abortController.abort();
      }

      const abortController = new AbortController();
      set({ isLoading: true });

      const userMessageId = generateId();
      const userMessage: Message = {
        id: userMessageId,
        role: "user",
        content,
        createdAt: new Date(),
      };

      let chatId = state.currentChatId;
      if (!chatId) {
        chatId = generateId();
        const newChat: Chat = {
          id: chatId,
          title: content.slice(0, 50) || "New Chat",
          messages: [userMessage],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((s) => ({ chats: [newChat, ...s.chats], currentChatId: chatId }));
      } else {
        set((s) => ({
          chats: s.chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, messages: [...chat.messages, userMessage], updatedAt: new Date() }
              : chat
          ),
        }));
      }

      const assistantMessageId = generateId();
      set((s) => ({
        chats: s.chats.map((chat) =>
          chat.id === chatId
            ? {
              ...chat,
              messages: [
                ...chat.messages,
                { id: assistantMessageId, role: "assistant" as const, content: "", createdAt: new Date() },
              ],
            }
            : chat
        ),
        streaming: { chatId, messageId: assistantMessageId, content: "", abortController },
      }));

      try {
        const { selectedModel, selectedCategory, attachments } = get();

        const chat = get().chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Chat not found");

        // Convert files at send-time (avoid Base64 in state/localStorage).
        const attachmentData = await Promise.all(
          attachments.map(async (att) => ({ att, dataUrl: await fileToDataUrl(att.file) }))
        );

        const messagesForApi = chat.messages
          .filter((m) => m.id !== assistantMessageId)
          .map((msg) => {
            if (msg.id === userMessageId && attachmentData.length > 0) {
              const contentParts: Array<
                { type: "text"; text: string } |
                { type: "image_url"; image_url: { url: string } } |
                { type: "file"; file: { filename: string; file_data: string } }
              > = [];

              if (content.trim()) {
                contentParts.push({ type: "text", text: content });
              }

              for (const { att, dataUrl } of attachmentData) {
                if (att.type === "image") {
                  contentParts.push({ type: "image_url", image_url: { url: dataUrl } });
                } else if (att.type === "pdf") {
                  contentParts.push({ type: "file", file: { filename: att.name, file_data: dataUrl } });
                }
              }

              return { role: msg.role, content: contentParts };
            }
            return { role: msg.role, content: msg.content };
          });

        const systemPrompt = selectedCategory ? CATEGORY_SYSTEM_PROMPTS[selectedCategory] : null;
        const { webSearchEnabled } = get();

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messagesForApi,
            model: selectedModel,
            systemPrompt,
            webSearchEnabled,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        let assistantContent = "";
        let firstContent = true;
        let buffer = "";

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              // Keep the last incomplete line in the buffer
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const delta: unknown = parsed.choices?.[0]?.delta?.content;
                  if (typeof delta === "string" && delta.length > 0) {
                    if (firstContent) {
                      set({ isLoading: false });
                      firstContent = false;
                    }
                    assistantContent += delta;
                    set((s) => ({ streaming: { ...s.streaming, content: assistantContent } }));
                  }
                } catch {
                  // ignore malformed SSE lines
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }

        // Merge streaming content once (prevents full-tree render storms).
        set((s) => ({
          chats: s.chats.map((chatItem) =>
            chatItem.id === chatId
              ? {
                ...chatItem,
                messages: chatItem.messages.map((m) =>
                  m.id === assistantMessageId ? { ...m, content: assistantContent } : m
                ),
                updatedAt: new Date(),
              }
              : chatItem
          ),
          streaming: { chatId: null, messageId: null, content: "", abortController: null },
        }));

        get().clearAttachments();
      } catch (error) {
        // Handle abort gracefully
        if (error instanceof Error && error.name === "AbortError") {
          const currentContent = get().streaming.content;
          set((s) => ({
            chats: s.chats.map((chatItem) =>
              chatItem.id === chatId
                ? {
                  ...chatItem,
                  messages: chatItem.messages.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: currentContent || "[Generation stopped]" }
                      : m
                  ),
                  updatedAt: new Date(),
                }
                : chatItem
            ),
            streaming: { chatId: null, messageId: null, content: "", abortController: null },
            isLoading: false,
          }));
          return;
        }

        console.error("Failed to send message:", error);
        const message = `Error: ${error instanceof Error ? error.message : "Failed to get response"}`;

        set((s) => ({
          chats: s.chats.map((chatItem) =>
            chatItem.id === chatId
              ? {
                ...chatItem,
                messages: chatItem.messages.map((m) =>
                  m.id === assistantMessageId ? { ...m, content: message } : m
                ),
              }
              : chatItem
          ),
          streaming: { chatId: null, messageId: null, content: "", abortController: null },
        }));
      } finally {
        set({ isLoading: false });
      }
    },

    stopGeneration: () => {
      const { streaming } = get();
      if (streaming.abortController) {
        streaming.abortController.abort();
      }
    },

    regenerateLastMessage: async () => {
      const state = get();
      const { currentChatId, chats } = state;
      if (!currentChatId) return;

      const chat = chats.find((c) => c.id === currentChatId);
      if (!chat || chat.messages.length < 2) return;

      // Find the last user message
      let lastUserMessageIndex = -1;
      for (let i = chat.messages.length - 1; i >= 0; i--) {
        if (chat.messages[i].role === "user") {
          lastUserMessageIndex = i;
          break;
        }
      }

      if (lastUserMessageIndex === -1) return;

      const lastUserMessage = chat.messages[lastUserMessageIndex];
      const userContent = typeof lastUserMessage.content === "string"
        ? lastUserMessage.content
        : lastUserMessage.content.filter(c => c.type === "text").map(c => "text" in c ? c.text : "").join("");

      // Remove all messages from the last user message onwards
      set((s) => ({
        chats: s.chats.map((c) =>
          c.id === currentChatId
            ? { ...c, messages: c.messages.slice(0, lastUserMessageIndex) }
            : c
        ),
      }));

      // Re-send the message
      await get().sendMessage(userContent);
    },

    selectChat: (chatId) => {
      const { attachments } = get();
      attachments.forEach(revokePreviewUrl);
      set({ currentChatId: chatId, attachments: [] });
    },

    deleteChat: (chatId) => {
      set((s) => ({
        chats: s.chats.filter((c) => c.id !== chatId),
        currentChatId: s.currentChatId === chatId ? null : s.currentChatId,
      }));
    },

    clearCurrentChatHistory: () => {
      const { currentChatId } = get();
      if (!currentChatId) return;
      set((s) => ({
        chats: s.chats.map((chat) =>
          chat.id === currentChatId ? { ...chat, messages: [], updatedAt: new Date() } : chat
        ),
      }));
    },

    searchChats: (query) => {
      const { chats } = get();
      if (!query.trim()) return chats;
      const lowerQuery = query.toLowerCase();
      return chats.filter(
        (chat) =>
          chat.title.toLowerCase().includes(lowerQuery) ||
          chat.messages.some((msg) =>
            typeof msg.content === "string" ? msg.content.toLowerCase().includes(lowerQuery) : false
          )
      );
    },
  }))
);

let hasStorageSubscription = false;
const STORAGE_SUBSCRIBE_SENTINEL = "__t3_chat_store_storage_subscribed__";
const globalSentinel = globalThis as unknown as Record<string, unknown>;

if (typeof window !== "undefined" && !hasStorageSubscription && !globalSentinel[STORAGE_SUBSCRIBE_SENTINEL]) {
  hasStorageSubscription = true;
  globalSentinel[STORAGE_SUBSCRIBE_SENTINEL] = true;

  let timeoutId: number | null = null;
  let idleId: number | null = null;
  let pendingChats: Chat[] | null = null;

  type IdleDeadline = { didTimeout: boolean; timeRemaining: () => number };
  const requestIdle = (cb: (deadline: IdleDeadline) => void): number => {
    const ric = (window as unknown as { requestIdleCallback?: (c: (d: IdleDeadline) => void, o?: { timeout?: number }) => number })
      .requestIdleCallback;
    if (ric) return ric(cb, { timeout: 2000 });
    return window.setTimeout(() => cb({ didTimeout: true, timeRemaining: () => 0 }), 0);
  };
  const cancelIdle = (id: number) => {
    const cic = (window as unknown as { cancelIdleCallback?: (handle: number) => void }).cancelIdleCallback;
    if (cic) return cic(id);
    window.clearTimeout(id);
  };

  useChatStore.subscribe(
    (s) => s.chats,
    (chats) => {
      if (timeoutId) window.clearTimeout(timeoutId);
      pendingChats = chats;

      timeoutId = window.setTimeout(() => {
        if (idleId) cancelIdle(idleId);
        idleId = requestIdle(() => {
          if (!pendingChats) return;
          saveChatsToStorage(pendingChats);
        });
      }, STORAGE_DEBOUNCE_MS);
    }
  );
}

/**
 * Hook to ensure the store is hydrated from localStorage on the client.
 * Must be called in a component that renders on the client.
 */
export function useHydrateStore() {
  const hydrateFromStorage = useChatStore((s) => s._hydrateFromStorage);
  const hydrated = useChatStore((s) => s._hydrated);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return hydrated;
}
