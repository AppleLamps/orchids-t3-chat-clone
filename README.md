# T3 Chat Clone

A modern, feature-rich AI chat application inspired by T3 Chat, built with Next.js 15 and React 19. Chat with multiple AI models through OpenRouter with real-time streaming responses.

## Features

- **Multi-Model Support** — Switch between Grok, Mistral, GPT, Gemini, and Nvidia models
- **Real-time Streaming** — See AI responses as they're generated
- **Chat History** — Persistent local storage for all conversations
- **File Attachments** — Upload images and PDFs to include in conversations
- **Web Search** — Toggle online mode for models to access current information
- **Markdown Rendering** — Full support for formatted responses with syntax highlighting
- **Responsive Sidebar** — Collapsible chat history with search functionality
- **Dark Theme** — Sleek dark interface optimized for extended use

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives + shadcn/ui
- **Animations**: Framer Motion
- **AI Backend**: OpenRouter API
- **State Management**: React hooks with localStorage persistence

## File Structure

```
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts   # OpenRouter streaming API endpoint
│   │   ├── layout.tsx         # Root layout with fonts
│   │   └── page.tsx           # Main entry point
│   ├── components/
│   │   ├── sections/
│   │   │   ├── chat-wrapper.tsx        # Main chat orchestrator
│   │   │   ├── chat-messages.tsx       # Message list display
│   │   │   ├── chat-input-form.tsx     # Input with model selector
│   │   │   ├── sidebar.tsx             # Chat history sidebar
│   │   │   ├── sidebar-toggle-buttons.tsx
│   │   │   ├── welcome-header.tsx      # Landing screen
│   │   │   ├── suggested-questions.tsx
│   │   │   ├── category-tabs.tsx
│   │   │   ├── main-container.tsx
│   │   │   ├── top-right-settings.tsx
│   │   │   ├── terms-disclaimer.tsx
│   │   │   └── mobile-warning.tsx
│   │   └── ui/                # shadcn/ui components
│   │       ├── markdown-renderer.tsx   # Markdown + code highlighting
│   │       └── ...                     # 40+ UI primitives
│   ├── hooks/
│   │   ├── use-chat-store.ts  # Chat state management
│   │   └── use-mobile.ts      # Responsive detection
│   ├── lib/
│   │   └── utils.ts           # Utility functions
│   └── types/
│       └── chat.ts            # TypeScript interfaces & model configs
├── components.json            # shadcn/ui configuration
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## How It Works

1. **User Input** — Messages are captured via `ChatInputForm` with optional file attachments
2. **State Management** — `useChatStore` hook manages all chat state and persists to localStorage
3. **API Request** — Messages are sent to `/api/chat` which proxies to OpenRouter
4. **Streaming Response** — The API returns a Server-Sent Events stream that's parsed in real-time
5. **UI Update** — React state updates trigger re-renders showing the streaming response
6. **Persistence** — Completed chats are automatically saved to localStorage

## Getting Started

### Prerequisites

- Node.js 18+
- Bun, npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd orchids-t3-chat-clone

# Install dependencies
bun install
# or
npm install

# Start the development server
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start chatting.

### Environment Variables

The app uses OpenRouter for AI model access. To use your own API key, update the authorization header in `src/app/api/chat/route.ts`.

## Available Models

| Model | Provider | Capabilities |
|-------|----------|--------------|
| Grok 4.1 Fast | xAI | Vision, Reasoning |
| Grok Code Fast | xAI | Reasoning |
| Devstral | Mistral | Reasoning |
| GPT OSS 120B | OpenAI | Reasoning |
| Nemotron Nano 12B | Nvidia | Vision |
| Gemini 2.5 Flash Lite | Google | Vision, Reasoning |

## Scripts

```bash
bun dev      # Start development server with Turbopack
bun build    # Build for production
bun start    # Start production server
bun lint     # Run ESLint
```

## License

MIT
