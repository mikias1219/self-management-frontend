"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStandUi } from "@/stores/use-stand";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const openAiChat = useStandUi((s) => s.openAiChat);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (e.key === "?" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        toast.info("Shortcuts: ⌘K search · N new task · / focus search · ? help", {
          duration: 5000,
        });
        return;
      }

      if (typing) return;

      if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        router.push("/productivity?tab=tasks");
        return;
      }

      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const search = document.querySelector<HTMLInputElement>(
          'input[aria-label="Search modules to navigate"]',
        );
        search?.focus();
        return;
      }

      if (e.key === "a" && e.altKey) {
        e.preventDefault();
        openAiChat();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, openAiChat]);
}
