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
  { id: "x-ai/grok-code-fast-1", name: "Grok Code Fast", icon: "xai", capabilities: ["reasoning"] },
  { id: "mistralai/devstral-2512:free", name: "Devstral", icon: "mistral", capabilities: ["reasoning"] },
  { id: "openai/gpt-oss-20b:free", name: "GPT OSS 20B", icon: "openai", capabilities: ["reasoning"] },
  { id: "openai/gpt-5-mini", name: "GPT-5 Mini", icon: "openai", capabilities: ["vision", "reasoning"] },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free", name: "Nemotron Nano 12B", icon: "nvidia", capabilities: ["vision", "reasoning"] },
] as const;

export type ModelId = typeof MODELS[number]["id"];