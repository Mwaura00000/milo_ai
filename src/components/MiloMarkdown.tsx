"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { ExampleSnippet } from "./ExampleSnippet";
import { AnalogyCard } from "./AnalogyCard";

interface MiloMarkdownProps {
  content: string;
}

/**
 * MiloMarkdown — Last line of defense.
 * Renders assistant chat text as rich markdown. If the LLM leaks JSON
 * inside a code block despite our prompt rules, this component intercepts
 * the <pre><code> blocks and renders the appropriate Generative UI component.
 */
export function MiloMarkdown({ content }: MiloMarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        // Intercept code blocks — catch rogue JSON that slipped through the parser
        pre({ children }) {
          // Extract the raw code text from the <code> child
          const codeChild = React.Children.toArray(children).find(
            (child) => React.isValidElement(child) && child.type === "code"
          );

          if (React.isValidElement(codeChild)) {
            const codeProps = codeChild.props as Record<string, unknown>;
            const rawText = extractTextFromChildren(codeProps.children as React.ReactNode);
            const trimmed = rawText.trim();

            // Try to parse as JSON and render as a UI component
            if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
              try {
                const parsed = JSON.parse(trimmed);

                if (parsed.type === "example" && (parsed.codeOrBrief || parsed.code)) {
                  return (
                    <ExampleSnippet
                      concept={parsed.concept || "Example"}
                      code={parsed.codeOrBrief || parsed.code || ""}
                      explanation={parsed.explanation || ""}
                    />
                  );
                }

                if (parsed.type === "analogy" && parsed.concept && parsed.analogy) {
                  return (
                    <AnalogyCard
                      concept={parsed.concept}
                      analogy={parsed.analogy}
                    />
                  );
                }

                // For other JSON types, render as a styled code block (not raw JSON)
                return (
                  <div className="bg-slate-950 text-slate-50 font-mono text-[10px] rounded-xl p-3 border border-slate-800 overflow-x-auto shadow-inner select-all relative leading-relaxed my-2">
                    <pre className="whitespace-pre-wrap"><code>{trimmed}</code></pre>
                  </div>
                );
              } catch {
                // Not valid JSON — fall through to default rendering
              }
            }

            // Non-JSON code blocks — render with dark styling
            return (
              <div className="bg-slate-950 text-slate-50 font-mono text-[10px] rounded-xl p-3 border border-slate-800 overflow-x-auto shadow-inner select-all relative leading-relaxed my-2">
                <div className="flex gap-1.5 mb-2 select-none">
                  <div className="w-2 h-2 rounded-full bg-red-500/70" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
                  <div className="w-2 h-2 rounded-full bg-green-500/70" />
                </div>
                <pre className="whitespace-pre-wrap"><code>{rawText}</code></pre>
              </div>
            );
          }

          return <pre>{children}</pre>;
        },

        // Style inline code
        code({ children }) {
          return (
            <code className="bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-[#14fac8] px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold">
              {children}
            </code>
          );
        },

        // Style paragraphs
        p({ children }) {
          return <p className="mb-1.5 last:mb-0">{children}</p>;
        },

        // Style bold
        strong({ children }) {
          return <strong className="font-black text-zinc-900 dark:text-white">{children}</strong>;
        },

        // Style lists
        ul({ children }) {
          return <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>;
        },
        li({ children }) {
          return <li className="text-xs leading-relaxed">{children}</li>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/** Recursively extract text content from React children */
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join("");
  if (React.isValidElement(children)) {
    const childProps = children.props as Record<string, unknown>;
    if (childProps.children) {
      return extractTextFromChildren(childProps.children as React.ReactNode);
    }
  }
  return "";
}

export default MiloMarkdown;
