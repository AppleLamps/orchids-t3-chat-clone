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
  const [wordWrap, setWordWrap] = useState(false);

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
    <div className="my-4 overflow-hidden border border-[#00ff4130] bg-[#0a0a0a]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#111111] border-b border-[#00ff4130]">
        <span className="text-[11px] font-medium text-[#00cc33]">{language || "text"}</span>
        <div className="flex items-center gap-1">
          {isHtml && (
            <button
              onClick={() => setPreviewOpen(true)}
              className="p-1.5 hover:bg-[#00ff4120] transition-colors text-[#00ff4180] hover:text-[#00ff41]"
              title="Preview HTML"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={downloadCode}
            className="p-1.5 hover:bg-[#00ff4120] transition-colors text-[#00ff4180] hover:text-[#00ff41]"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={cn(
              "p-1.5 hover:bg-[#00ff4120] transition-colors",
              wordWrap ? "text-[#00ff41] bg-[#00ff4120]" : "text-[#00ff4180] hover:text-[#00ff41]"
            )}
            title={wordWrap ? "Disable word wrap" : "Enable word wrap"}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-[#00ff4120] transition-colors text-[#00ff4180] hover:text-[#00ff41]"
            title="Copy"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#28c840]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
      <div className={wordWrap ? "" : "overflow-x-auto"}>
        <pre className={cn(
          "m-0 p-4 bg-transparent text-[13px] leading-relaxed",
          wordWrap && "whitespace-pre-wrap break-words"
        )}>
          <code className="text-[#00ff41]">{value}</code>
        </pre>
      </div>

      {isHtml && (
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent 
              className="flex flex-col bg-[#0a0a0a] border border-[#00ff41]"
              style={{ width: '90vw', maxWidth: '90vw', height: '85vh', fontFamily: "'JetBrains Mono', monospace" }}
            >
              <DialogHeader>
                <DialogTitle className="text-[#00ff41]">HTML Preview</DialogTitle>
              </DialogHeader>
              <div className="flex-1 w-full min-h-0 border border-[#00ff4130] bg-white overflow-hidden">
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
    <div 
      className={cn("markdown-content text-[#00ff41]", className)}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !className;

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 bg-[#00ff4120] text-[#00ff41] text-[13px] border border-[#00ff4130]"
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
            return <p className="mb-4 last:mb-0 leading-relaxed text-[#00ff41]">{children}</p>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-semibold mb-4 mt-6 first:mt-0 text-[#00ff41] green-glow border-b border-[#00ff4130] pb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-semibold mb-3 mt-5 first:mt-0 text-[#00ff41]">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0 text-[#00ff41]">{children}</h3>;
          },
          ul({ children }) {
            return <ul className="list-disc list-outside ml-6 mb-4 space-y-1 marker:text-[#00cc33]">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside ml-6 mb-4 space-y-1 marker:text-[#00cc33]">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed text-[#00ff41]">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-[#00cc33] pl-4 my-4 italic text-[#00ff4180]">
                {children}
              </blockquote>
            );
          },
          a({ children, href }) {
            return (
              <a
                href={href}
                className="text-[#00ff41] underline hover:text-[#00cc33] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          strong({ children }) {
            return <strong className="font-semibold text-white">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic">{children}</em>;
          },
          hr() {
            return <hr className="my-6 border-[#00ff4130]" />;
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-[#00ff4130] overflow-hidden">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-[#111111] border-b border-[#00ff4130]">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-[#00ff4130]">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-[#00ff4110] transition-colors">{children}</tr>;
          },
          th({ children }) {
            return (
              <th className="px-4 py-2 text-left text-[13px] font-semibold text-[#00ff41]">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="px-4 py-2 text-[13px] text-[#00ff41]">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
