import { AiChatbot } from "@/components/ai-coach/ai-chatbot";

export default function AiCoachPage() {
  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] w-full max-w-7xl flex-col">
      <AiChatbot variant="full" />
    </div>
  );
}
