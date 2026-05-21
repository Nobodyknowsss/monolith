import { MessageSquare } from "lucide-react";
import { ChatThread } from "@/components/chat/chat-thread";

type Message = {
  id: string;
  role: string;
  content: string;
};

type Props = {
  notebookId: string;
  initialMessages: Message[];
  hasReadyDocuments: boolean;
};

export function ChatPane({
  notebookId,
  initialMessages,
  hasReadyDocuments,
}: Props) {
  return (
    <section className="flex min-h-[480px] flex-col rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium">
        <MessageSquare
          aria-hidden="true"
          className="size-4 text-teal-600 dark:text-teal-400"
        />
        Chat
      </div>
      <ChatThread
        notebookId={notebookId}
        initialMessages={initialMessages}
        hasReadyDocuments={hasReadyDocuments}
      />
    </section>
  );
}
