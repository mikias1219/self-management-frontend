"use client";

import { cn } from "@/lib/utils";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function ChatMessageContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const lines = content.split("\n");

  return (
    <div className={cn("space-y-2 text-sm leading-relaxed", className)}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith("## ")) {
          return (
            <h3
              key={idx}
              className="mt-2 text-xs font-semibold uppercase tracking-wide text-foreground/80 first:mt-0"
            >
              {trimmed.slice(3)}
            </h3>
          );
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="mt-1 font-semibold text-foreground">
              {trimmed.slice(4)}
            </h4>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex gap-2 pl-1">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-50" />
              <p>{renderInline(trimmed.slice(2))}</p>
            </div>
          );
        }

        return <p key={idx}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}
