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
    <div className="pt-8 mx-auto flex w-full max-w-3xl flex-col px-4 pb-10">
      <div className="flex min-h-[calc(100vh-20rem)] items-start justify-center">
        <div className="w-full space-y-6 px-2 pt-[calc(max(15vh,2.5rem))] sm:px-8">
          <h2 className="text-3xl font-semibold text-foreground">
            How can I help you?
          </h2>

          <div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedCategory === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onCategoryChange(tab.id)}
                  data-selected={isSelected}
                  className={cn(
                    "flex items-center gap-1 rounded-xl px-5 py-2 h-9",
                    "sm:gap-2 sm:rounded-full",
                    "justify-center text-sm font-semibold whitespace-nowrap",
                    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                    "shadow-sm backdrop-blur-xl transition-colors",
                    "outline-1 outline-secondary/70",
                    "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
                    "data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90",
                    "data-[selected=false]:hover:bg-secondary data-[selected=false]:outline-solid",
                    "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-hidden"
                  )}
                >
                  <Icon />
                  <div>{tab.label}</div>
                </button>
              );
            })}
          </div>

          <div className="flex w-full flex-col divide-y divide-border/50">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                onClick={() => onSendMessage(question)}
                className="text-secondary-foreground hover:text-primary w-full py-3 sm:py-4 text-left text-base font-normal transition-colors outline-none focus-visible:text-primary"
                type="button"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}