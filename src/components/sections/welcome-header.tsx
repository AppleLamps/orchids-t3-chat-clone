"use client";

import { Plus, Layout, Code, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/hooks/use-chat-store";

const tabs = [
  { id: "create" as CategoryId, label: "Create", icon: Plus },
  { id: "explore" as CategoryId, label: "Explore", icon: Layout },
  { id: "code" as CategoryId, label: "Code", icon: Code },
  { id: "learn" as CategoryId, label: "Learn", icon: BookOpen },
];

const SUGGESTED_QUESTIONS = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
];

interface WelcomeHeaderProps {
  onSendMessage: (message: string) => void;
  selectedCategory: CategoryId | null;
  onCategoryChange: (category: CategoryId) => void;
}

export default function WelcomeHeader({ onSendMessage, selectedCategory, onCategoryChange }: WelcomeHeaderProps) {
  return (
    <div 
      className="flex-1 flex flex-col p-10 overflow-y-auto"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <div className="max-w-[700px] mx-auto w-full flex-1 flex flex-col">
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
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Prompt Items */}
        <div className="flex flex-col">
          {SUGGESTED_QUESTIONS.map((question) => (
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
      </div>
    </div>
  );
}
