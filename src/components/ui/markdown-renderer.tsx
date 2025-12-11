"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Download, WrapText, Eye } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CodeBlock({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isHtml = language?.toLowerCase() === "html";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const ext = language || "txt";
    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[#e0e0e0] bg-[#f5f5f5]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#ebebeb] border-b border-[#e0e0e0]">
        <span className="text-xs font-medium text-[#666666]">{language || "text"}</span>
        <div className="flex items-center gap-1">
          {isHtml && (
            <button
              onClick={() => setPreviewOpen(true)}
              className="p-1.5 rounded hover:bg-[#d5d5d5] transition-colors"
              title="Preview HTML"
            >
              <Eye className="w-4 h-4 text-[#666666]" />
            </button>
          )}
          <button
            onClick={downloadCode}
            className="p-1.5 rounded hover:bg-[#d5d5d5] transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4 text-[#666666]" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-[#d5d5d5] transition-colors"
            title="Wrap text"
          >
            <WrapText className="w-4 h-4 text-[#666666]" />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded hover:bg-[#d5d5d5] transition-colors"
            title="Copy"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-[#666666]" />
            )}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <pre className="m-0 p-4 bg-transparent text-sm leading-relaxed">
          <code className="text-[#333333] font-mono">{value}</code>
        </pre>
      </div>

      {isHtml && (
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent 
              className="flex flex-col"
              style={{ width: '90vw', maxWidth: '90vw', height: '85vh' }}
            >
              <DialogHeader>
                <DialogTitle>HTML Preview</DialogTitle>
              </DialogHeader>
              <div className="flex-1 w-full min-h-0 border rounded bg-white overflow-hidden">
                <iframe
                  srcDoc={value}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts"
                  title="HTML Preview"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}

    </div>
  );
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !className;

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-[#e8e8e8] text-[#000000] font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match ? match[1] : ""}
                value={String(children).replace(/\n$/, "")}
              />
            );
          },
          p({ children }) {
            return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>;
          },
          ul({ children }) {
            return <ul className="list-disc list-outside ml-6 mb-4 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside ml-6 mb-4 space-y-1">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-[#000000] pl-4 my-4 italic text-[#555555]">
                {children}
              </blockquote>
            );
          },
          a({ children, href }) {
            return (
              <a
                href={href}
                className="text-[#000000] underline hover:text-[#333333] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          strong({ children }) {
            return <strong className="font-semibold">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic">{children}</em>;
          },
          hr() {
            return <hr className="my-6 border-[#E5E5E5]" />;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-[#E5E5E5] rounded-lg overflow-hidden">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-[#F5F5F5]">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-[#E5E5E5]">{children}</tbody>;
          },
          tr({ children }) {
            return <tr>{children}</tr>;
          },
          th({ children }) {
            return (
              <th className="px-4 py-2 text-left text-sm font-semibold text-[#1A1A1A]">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="px-4 py-2 text-sm">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}