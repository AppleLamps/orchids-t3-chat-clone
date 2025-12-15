"use client";

import { Sparkles, GalleryVertical, Code, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/hooks/use-chat-store";

const tabs = [
  { id: "create" as CategoryId, label: "Create", icon: Sparkles },
  { id: "explore" as CategoryId, label: "Explore", icon: GalleryVertical },
  { id: "code" as CategoryId, label: "Code", icon: Code },
  { id: "learn" as CategoryId, label: "Learn", icon: GraduationCap },
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
    <div className="pt-8 mx-auto flex w-full max-w-3xl flex-col px-4 pb-10 font-mono">
      <div className="flex min-h-[calc(100vh-20rem)] items-start justify-center">
        <div className="w-full space-y-8 px-2 pt-[calc(max(15vh,2.5rem))] sm:px-8">
          <h2 className="text-4xl font-bold text-[#22c55e] tracking-tight">
            <span className="mr-2 text-[#22c55e]">$</span>
            How can I help you?
          </h2>

          <div className="flex flex-row flex-wrap gap-3 text-sm max-sm:justify-evenly">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedCategory === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onCategoryChange(tab.id)}
                  data-selected={isSelected}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 border border-[#15803d]",
                    "justify-center text-sm font-bold whitespace-nowrap",
                    "transition-all duration-200",
                    "hover:bg-[#15803d]/20 hover:border-[#22c55e]",
                    "focus-visible:ring-1 focus-visible:ring-[#22c55e] focus-visible:outline-none",
                    isSelected 
                      ? "bg-[#22c55e] text-black border-[#22c55e]" 
                      : "bg-transparent text-[#22c55e]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <div>{tab.label}</div>
                </button>
              );
            })}
          </div>

          <div className="flex w-full flex-col space-y-4">
            {SUGGESTED_QUESTIONS.map((question) => (
              <div key={question} className="border-b border-[#15803d]/30 pb-2">
                <button
                  onClick={() => onSendMessage(question)}
                  className="text-[#22c55e]/80 hover:text-[#22c55e] hover:translate-x-1 w-full text-left text-base font-medium transition-all duration-200 outline-none flex items-center gap-2"
                  type="button"
                >
                  <span className="opacity-50">{">"}</span>
                  {question}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
