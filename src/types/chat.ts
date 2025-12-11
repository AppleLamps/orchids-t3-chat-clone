export interface ImageContent {
  type: "image_url";
  image_url: {
    url: string;
  };
}

export interface TextContent {
  type: "text";
  text: string;
}

export interface FileContent {
  type: "file";
  file: {
    filename: string;
    file_data: string;
  };
}

export type MessageContent = string | (TextContent | ImageContent | FileContent)[];

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: MessageContent;
  createdAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  type: "image" | "pdf";
  name: string;
  data: string;
  mimeType: string;
}

export const MODELS = [
  { id: "x-ai/grok-4.1-fast", name: "Grok 4.1 Fast", icon: "xai", capabilities: ["vision", "reasoning"], isDefault: true },
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", icon: "anthropic", capabilities: ["vision", "reasoning"] },
  { id: "google/gemini-2.5-flash-preview", name: "Gemini 2.5 Flash", icon: "gemini", capabilities: ["vision", "reasoning"] },
  { id: "openai/gpt-4.1", name: "GPT-4.1", icon: "openai", capabilities: ["vision", "reasoning"] },
  { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick", icon: "meta", capabilities: ["reasoning"] },
] as const;

export type ModelId = typeof MODELS[number]["id"];