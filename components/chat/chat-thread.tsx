"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageBubble } from "@/components/chat/message-bubble";

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

// Typewriter pacing: each tick is ~16ms (~60fps). The chars-per-tick is
// computed dynamically so any buffered text drains in ~1.3 seconds — long
// responses don't drag, short ones don't fly by.
const REVEAL_TICK_MS = 16;
const REVEAL_DRAIN_TICKS = 80;

export function ChatThread({
  notebookId,
  initialMessages,
  hasReadyDocuments,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  // streamTarget = full text the server has streamed in so far.
  // displayedText = what the user actually sees; animates toward streamTarget.
  const [streamTarget, setStreamTarget] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [streamDone, setStreamDone] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isAnimating = displayedText.length < streamTarget.length;
  const isStreaming = isWaiting || isAnimating;

  // Typewriter loop: advance displayedText toward streamTarget. Re-runs on
  // every displayed/target change so the animation continues smoothly while
  // new server chunks arrive.
  useEffect(() => {
    if (!isAnimating) return;
    const id = setTimeout(() => {
      setDisplayedText((prev) => {
        const remaining = streamTarget.length - prev.length;
        if (remaining <= 0) return prev;
        const chars = Math.max(1, Math.ceil(remaining / REVEAL_DRAIN_TICKS));
        return streamTarget.slice(0, prev.length + chars);
      });
    }, REVEAL_TICK_MS);
    return () => clearTimeout(id);
  }, [displayedText, streamTarget, isAnimating]);

  // Commit assistant message once both: (a) server stream is done AND
  // (b) the typewriter has caught up. Avoids visual snap-to-final.
  useEffect(() => {
    if (!streamDone || isAnimating || !streamTarget) return;
    const final = streamTarget;
    setMessages((prev) => [
      ...prev,
      {
        id: `tmp-assist-${Date.now()}`,
        role: "assistant",
        content: final,
      },
    ]);
    setStreamTarget("");
    setDisplayedText("");
    setStreamDone(false);
  }, [streamDone, isAnimating, streamTarget]);

  // Auto-scroll on new content
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, displayedText, isWaiting]);

  // Auto-focus on mount when input is usable
  useEffect(() => {
    if (hasReadyDocuments) {
      inputRef.current?.focus();
    }
  }, [hasReadyDocuments]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const question = input.trim();
    if (!question || isStreaming || !hasReadyDocuments) return;

    setError(null);
    setInput("");

    const userMsg: Message = {
      id: `tmp-user-${Date.now()}`,
      role: "user",
      content: question,
    };
    setMessages((prev) => [...prev, userMsg]);
    setStreamTarget("");
    setDisplayedText("");
    setStreamDone(false);
    setIsWaiting(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notebookId, question }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error ?? `Request failed (${res.status})`);
        setIsWaiting(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        setStreamTarget(buf);
      }

      // Server is done; the commit effect waits for the typewriter to catch up.
      setStreamDone(true);
      setIsWaiting(false);
    } catch (err) {
      console.error("[chat] client error:", err);
      setError("Network error. Please try again.");
      setIsWaiting(false);
    } finally {
      // Return focus to the input for the next question.
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter inserts newline.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  const hasContent = messages.length > 0 || isStreaming;
  const inputDisabled = isStreaming || !hasReadyDocuments;

  return (
    <div className="flex flex-1 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {hasContent ? (
          <>
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                role={m.role}
                content={m.content}
              />
            ))}
            {isStreaming && displayedText && (
              <MessageBubble role="assistant" content={displayedText} />
            )}
            {isStreaming && !displayedText && (
              <div
                className="flex justify-start px-1 text-muted-foreground"
                aria-live="polite"
                aria-label="Thinking"
              >
                <ThinkingDots />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              {hasReadyDocuments
                ? "Ask anything about your documents."
                : "Upload a document to start asking questions."}
            </p>
            {hasReadyDocuments && (
              <p className="text-xs text-muted-foreground">
                Answers are grounded only in what you&rsquo;ve uploaded.
              </p>
            )}
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {error}
          </p>
        )}
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t bg-background p-3"
      >
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            hasReadyDocuments
              ? "Ask a question… (Shift+Enter for new line)"
              : "Add a document first"
          }
          disabled={inputDisabled}
          autoComplete="off"
          rows={1}
          className="max-h-40 min-h-9 flex-1 resize-none py-2"
          aria-label="Your question"
        />
        <Button
          type="submit"
          size="icon-sm"
          disabled={!input.trim() || inputDisabled}
          className="cursor-pointer"
          aria-label="Send question"
        >
          <Send aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      <span
        className="size-1.5 animate-bounce rounded-full bg-current motion-reduce:animate-none"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="size-1.5 animate-bounce rounded-full bg-current motion-reduce:animate-none"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="size-1.5 animate-bounce rounded-full bg-current motion-reduce:animate-none"
        style={{ animationDelay: "300ms" }}
      />
    </span>
  );
}
