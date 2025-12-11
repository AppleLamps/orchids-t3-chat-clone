"use client";

import { useState, useEffect, useCallback } from "react";
import type { Chat, Message, ModelId, Attachment } from "@/types/chat";
import { MODELS } from "@/types/chat";

const STORAGE_KEY = "t3-chat-history";

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

function saveChatsToStorage(chats: Chat[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (e) {
    console.error("Failed to save chats to localStorage:", e);
  }
}

export function useChatStore() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelId>(
    MODELS.find((m) => m.isDefault)?.id ?? MODELS[0].id
  );
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    setChats(loadChatsFromStorage());
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      saveChatsToStorage(chats);
    }
  }, [chats]);

  const currentChat = chats.find((c) => c.id === currentChatId) ?? null;

  const createNewChat = useCallback(() => {
    setCurrentChatId(null);
    setAttachments([]);
  }, []);

  const addAttachment = useCallback((attachment: Omit<Attachment, "id">) => {
    setAttachments((prev) => [...prev, { ...attachment, id: generateId() }]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() && attachments.length === 0) return;

      setIsLoading(true);

      let chatId = currentChatId;
      let updatedChats = [...chats];

      const userMessageId = generateId();
      const userMessage: Message = {
        id: userMessageId,
        role: "user",
        content: content,
        createdAt: new Date(),
      };

      if (!chatId) {
        chatId = generateId();
        const newChat: Chat = {
          id: chatId,
          title: content.slice(0, 50) || "New Chat",
          messages: [userMessage],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        updatedChats = [newChat, ...updatedChats];
        setCurrentChatId(chatId);
      } else {
        updatedChats = updatedChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, userMessage],
                updatedAt: new Date(),
              }
            : chat
        );
      }

      setChats(updatedChats);

      try {
        const messagesForApi = updatedChats
          .find((c) => c.id === chatId)!
          .messages.map((msg) => {
            if (msg.id === userMessageId && attachments.length > 0) {
              const contentParts: Array<{type: string; text?: string; image_url?: {url: string}; file?: {filename: string; file_data: string}}> = [];
              
              if (content.trim()) {
                contentParts.push({ type: "text", text: content });
              }

              for (const att of attachments) {
                if (att.type === "image") {
                  contentParts.push({
                    type: "image_url",
                    image_url: { url: att.data },
                  });
                } else if (att.type === "pdf") {
                  contentParts.push({
                    type: "file",
                    file: {
                      filename: att.name,
                      file_data: att.data,
                    },
                  });
                }
              }

              return { role: msg.role, content: contentParts };
            }
            return { role: msg.role, content: msg.content };
          });

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messagesForApi,
            model: webSearchEnabled ? `${selectedModel}:online` : selectedModel,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        const assistantMessageId = generateId();
        let assistantContent = "";

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      id: assistantMessageId,
                      role: "assistant" as const,
                      content: "",
                      createdAt: new Date(),
                    },
                  ],
                  updatedAt: new Date(),
                }
              : chat
          )
        );

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (delta) {
                    assistantContent += delta;
                    setChats((prev) =>
                      prev.map((chat) =>
                        chat.id === chatId
                          ? {
                              ...chat,
                              messages: chat.messages.map((msg) =>
                                msg.id === assistantMessageId
                                  ? { ...msg, content: assistantContent }
                                  : msg
                              ),
                            }
                          : chat
                      )
                    );
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        }

        clearAttachments();
      } catch (error) {
        console.error("Failed to send message:", error);
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      id: generateId(),
                      role: "assistant" as const,
                      content: `Error: ${error instanceof Error ? error.message : "Failed to get response"}`,
                      createdAt: new Date(),
                    },
                  ],
                }
              : chat
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentChatId, chats, selectedModel, webSearchEnabled, attachments, clearAttachments]
  );

  const selectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
    setAttachments([]);
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  }, [currentChatId]);

  const searchChats = useCallback(
    (query: string) => {
      if (!query.trim()) return chats;
      const lowerQuery = query.toLowerCase();
      return chats.filter(
        (chat) =>
          chat.title.toLowerCase().includes(lowerQuery) ||
          chat.messages.some((msg) =>
            typeof msg.content === "string"
              ? msg.content.toLowerCase().includes(lowerQuery)
              : false
          )
      );
    },
    [chats]
  );

  return {
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
    clearAttachments,
    createNewChat,
    sendMessage,
    selectChat,
    deleteChat,
    searchChats,
  };
}
