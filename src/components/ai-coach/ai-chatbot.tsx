"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { aiCoachApi } from "@/lib/api";
import type { AiCoachMessage } from "@/lib/types";
import { ChatMessageContent } from "@/components/ai-coach/chat-message-content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What are my tasks for today?",
  "How much did I spend today?",
  "Which habits did I log today?",
  "Summarize my goals progress",
  "Any unread notifications?",
  "What did I study or learn today?",
];

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

type AiChatbotProps = {
  variant?: "floating" | "full";
  onClose?: () => void;
};

export function AiChatbot({ variant = "full", onClose }: AiChatbotProps) {
  const isFloating = variant === "floating";
  const [messages, setMessages] = useState<AiCoachMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (isFloating) {
      textareaRef.current?.focus();
    }
  }, [isFloating]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const optimisticUser: AiCoachMessage = {
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUser]);
      setInput("");
      setLoading(true);

      try {
        const res = await aiCoachApi.chat(trimmed, sessionId);
        setSessionId(res.sessionId);
        setMessages(res.messages);
      } catch (err: unknown) {
        setMessages((prev) => prev.slice(0, -1));
        const msg = (
          err as { response?: { data?: { message?: string | string[] } } }
        )?.response?.data?.message;
        const detail = Array.isArray(msg) ? msg.join(", ") : msg;
        toast.error(
          typeof detail === "string" ? detail : "Could not reach AI assistant",
        );
      } finally {
        setLoading(false);
        textareaRef.current?.focus();
      }
    },
    [loading, sessionId],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setInput("");
    textareaRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden bg-card",
        isFloating
          ? "h-full rounded-2xl shadow-2xl ring-1 ring-foreground/10"
          : "h-[calc(100vh-10rem)] min-h-[520px] rounded-xl ring-1 ring-foreground/10",
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Bot className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">LifeOS Assistant</p>
            <p className="truncate text-[11px] text-muted-foreground">
              Tasks, finance, habits & all your modules
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={startNewChat}
          >
            New
          </Button>
          {isFloating && onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onClose}
              aria-label="Close chat"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-6" />
            </div>
            <p className="max-w-[240px] text-xs text-muted-foreground">
              Ask anything about your real LifeOS data — expenses, tasks,
              habits, learning, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[10px] transition-colors hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div
              key={`${m.createdAt}-${i}`}
              className={cn("flex", isUser ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[92%] rounded-2xl px-3 py-2 shadow-sm",
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/80 text-foreground",
                )}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {m.content}
                  </p>
                ) : (
                  <ChatMessageContent content={m.content} />
                )}
                <p
                  className={cn(
                    "mt-1.5 text-[10px] opacity-60",
                    isUser ? "text-right" : "text-left",
                  )}
                >
                  {formatTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Checking your data…
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="shrink-0 border-t border-border/60 p-3"
      >
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about your day…"
            rows={2}
            disabled={loading}
            className="min-h-[44px] resize-none text-sm"
          />
          <Button
            type="submit"
            size="icon"
            className="size-11 shrink-0"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
