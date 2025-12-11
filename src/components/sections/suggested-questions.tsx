'use client';

import React from 'react';

const SUGGESTED_QUESTIONS = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
];

export default function SuggestedQuestions() {
  return (
    <div className="flex w-full flex-col divide-y divide-border/50">
      {SUGGESTED_QUESTIONS.map((question) => (
        <button
          key={question}
          className="text-secondary-foreground hover:text-primary w-full py-3 sm:py-4 text-left text-base font-normal transition-colors outline-none focus-visible:text-primary"
          type="button"
        >
          {question}
        </button>
      ))}
    </div>
  );
}