"use client";

import { Bot, MessageCircle } from "lucide-react";
import { AiChatbot } from "@/components/ai-coach/ai-chatbot";
import { cn } from "@/lib/utils";
import { useStandUi } from "@/stores/use-stand";

export function FloatingAiChat() {
  const open = useStandUi((s) => s.aiChatOpen);
  const prefill = useStandUi((s) => s.aiChatPrefill);
  const setAiChatOpen = useStandUi((s) => s.setAiChatOpen);
  const closeAiChat = useStandUi((s) => s.closeAiChat);

  return (
    <>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none"
            aria-label="Close chat overlay"
            onClick={closeAiChat}
          />
          <div
            className={cn(
              "fixed z-50 flex flex-col",
              "bottom-20 right-4 left-4 sm:left-auto",
              "h-[min(72vh,560px)] w-auto sm:w-[400px]",
              "animate-in fade-in slide-in-from-bottom-4 duration-200",
            )}
          >
            <AiChatbot
              variant="floating"
              onClose={closeAiChat}
              initialInput={prefill}
            />
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setAiChatOpen(!open)}
        aria-label={open ? "Close LifeOS assistant" : "Open LifeOS assistant"}
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full shadow-lg transition-all",
          "bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          open && "rotate-0 scale-95",
        )}
      >
        {open ? (
          <MessageCircle className="size-6" />
        ) : (
          <Bot className="size-7" />
        )}
      </button>
    </>
  );
}
