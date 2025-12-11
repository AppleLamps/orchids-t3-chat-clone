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
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", icon: "openai", capabilities: ["vision", "reasoning"], isDefault: true },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku", icon: "anthropic", capabilities: ["reasoning"] },
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash", icon: "gemini", capabilities: ["vision", "reasoning"] },
  { id: "mistralai/mistral-small-3.1-24b-instruct:free", name: "Mistral Small", icon: "mistral", capabilities: ["reasoning"] },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", icon: "meta", capabilities: ["reasoning"] },
] as const;

export type ModelId = typeof MODELS[number]["id"];