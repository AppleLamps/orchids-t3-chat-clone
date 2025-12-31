"use client";

import { Plus, Layout, Code, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/hooks/use-chat-store";

const tabs = [
  { id: "create" as CategoryId, label: "Create", icon: Plus },
  { id: "explore" as CategoryId, label: "Explore", icon: Layout },
  { id: "code" as CategoryId, label: "Code", icon: Code },
  { id: "learn" as CategoryId, label: "Learn", icon: BookOpen },
];

const SUGGESTIONS_BY_CATEGORY: Record<CategoryId | "default", string[]> = {
  default: [
    "How does AI work?",
    "Are black holes real?",
    'How many Rs are in the word "strawberry"?',
    "What is the meaning of life?",
  ],
  create: [
    "Write a short story about a robot learning to love",
    "Generate a poem about the night sky",
    "Create a recipe for a unique fusion dish",
    "Design a logo concept for a tech startup",
  ],
  explore: [
    "What are the wonders of the ancient world?",
    "Explain quantum entanglement simply",
    "What would happen if the moon disappeared?",
    "How do octopuses change color?",
  ],
  code: [
    "Explain the difference between REST and GraphQL",
    "How do I center a div in CSS?",
    "Write a binary search algorithm in Python",
    "What are React hooks and when should I use them?",
  ],
  learn: [
    "Teach me the basics of machine learning",
    "How do I start learning a new language?",
    "Explain the scientific method",
    "What are the key principles of economics?",
  ],
};

interface WelcomeHeaderProps {
  onSendMessage: (message: string) => void;
  selectedCategory: CategoryId | null;
  onCategoryChange: (category: CategoryId) => void;
}

export default function WelcomeHeader({ onSendMessage, selectedCategory, onCategoryChange }: WelcomeHeaderProps) {
  const suggestions = selectedCategory
    ? SUGGESTIONS_BY_CATEGORY[selectedCategory]
    : SUGGESTIONS_BY_CATEGORY.default;

  return (
    <div
      className="flex-1 flex flex-col px-10 pt-16 pb-10"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <div className="max-w-[700px] mx-auto w-full flex-1 flex flex-col">
        {/* Terminal ASCII Art Header */}
        <div className="text-[#00ff4140] text-[10px] mb-6 leading-tight select-none" aria-hidden="true">
          <pre>{`╔══════════════════════════════════════════════════════════════╗
║  LAMPS.CHAT v1.0 — AI Terminal Interface                     ║
║  Status: READY — Awaiting user input...                       ║
╚══════════════════════════════════════════════════════════════╝`}</pre>
        </div>

        {/* Main Heading */}
        <h1 className="text-[32px] font-semibold mb-8 text-[#00ff41] green-glow">
          <span className="text-[#00cc33]">$ </span>
          How can I help you?
          <span className="cursor-blink" />
        </h1>

        {/* Category Buttons */}
        <div className="flex gap-3 mb-10 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onCategoryChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 bg-[#1a1a1a] border border-[#00ff4130] text-[#00ff41] py-2.5 px-5 text-[13px] cursor-pointer transition-all duration-200",
                  "hover:border-[#00ff41] hover:bg-[#00ff4120] hover:green-glow-box",
                  isSelected && "border-[#00ff41] bg-[#00ff4120] green-glow-box"
                )}
                aria-pressed={isSelected}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Section Label */}
        <div className="flex items-center gap-2 mb-4 text-[11px] text-[#00ff4160]">
          <Sparkles className="w-3 h-3" />
          <span>
            {selectedCategory
              ? `Suggested ${selectedCategory} prompts`
              : "Try asking..."}
          </span>
        </div>

        {/* Prompt Items */}
        <div className="flex flex-col">
          {suggestions.map((question) => (
            <button
              key={question}
              onClick={() => onSendMessage(question)}
              className="group py-[18px] border-b border-[#00ff4130] cursor-pointer transition-all duration-200 text-[14px] text-left text-[#00ff41] hover:text-white hover:pl-3 hover:green-glow"
              type="button"
            >
              <span className="text-[#00cc33] opacity-0 group-hover:opacity-100 transition-opacity duration-200">→ </span>
              {question}
            </button>
          ))}
        </div>

        {/* Hint Text */}
        <p className="mt-8 text-[11px] text-[#00ff4140] text-center">
          Type your own message below or click a suggestion above
        </p>
      </div>
    </div>
  );
}
