import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Search,
  Brain,
  Quote,
  Upload,
  MessageSquare,
  NotebookPen,
  ShieldCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
import { getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function LandingPage() {
  const user = await getUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-svh">
      <LandingHeader isLoggedIn={isLoggedIn} />
      <Hero isLoggedIn={isLoggedIn} />
      <Preview />
      <Features />
      <HowItWorks />
      <FinalCta isLoggedIn={isLoggedIn} />
      <LandingFooter />
    </div>
  );
}

function LandingHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="Monolith home" className="cursor-pointer">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a
            href="#features"
            className="transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-foreground"
          >
            How it works
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className={cn(buttonVariants(), "cursor-pointer")}
            >
              Open dashboard
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "cursor-pointer",
                )}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants(), "cursor-pointer")}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 size-[640px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-green-500/20 blur-3xl"
      />
      <div className="mx-auto max-w-3xl px-6 pb-12 pt-20 text-center sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-200">
          <span className="size-1.5 rounded-full bg-green-400" />
          Notes that answer back.
        </span>
        <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Stop searching your notes.{" "}
          <span className="text-muted-foreground">Start asking them.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          Upload your documents and chat with an AI that only answers from what
          you&rsquo;ve uploaded &mdash; never from outside knowledge, never made
          up.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: "lg" }), "cursor-pointer")}
            >
              Open dashboard
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: "lg" }), "cursor-pointer")}
              >
                Get started &mdash; it&rsquo;s free
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "cursor-pointer",
                )}
              >
                I already have an account
              </Link>
            </>
          )}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck
            aria-hidden="true"
            className="size-3.5 text-green-400"
          />
          Your documents stay private to your account.
        </div>
      </div>
    </section>
  );
}

function Preview() {
  return (
    <section className="relative mx-auto max-w-3xl px-6 pb-24">
      <div className="relative rounded-2xl border border-border/80 bg-card p-6 shadow-2xl sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-12 -inset-y-6 -z-10 rounded-[2.5rem] bg-green-500/15 blur-3xl"
        />
        <div className="space-y-5">
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-secondary px-4 py-2.5 text-sm">
              What were the three key takeaways from the Q1 strategy memo?
            </div>
          </div>
          <div className="max-w-[92%] text-sm leading-relaxed text-foreground">
            Based on{" "}
            <span className="font-medium text-green-300">q1-strategy.pdf</span>
            , the three key takeaways were:
            <br />
            <br />
            1. Ship the new chat surface by end of quarter.
            <br />
            2. Migrate the auth stack to the new SDK.
            <br />
            3. Cut document ingestion latency by 40%.
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <FileText aria-hidden="true" className="size-3.5 text-green-400" />
          Grounded in 1 source &middot; no outside knowledge used
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: FileText,
    title: "Bring your own documents",
    desc: "PDF, DOCX, or plain text. Up to 10MB each. Everything stays scoped to your account.",
  },
  {
    icon: Quote,
    title: "Grounded in your sources",
    desc: "Every answer comes from your uploaded documents. If it’s not in the notes, the model says so.",
  },
  {
    icon: Search,
    title: "Semantic search",
    desc: "Vector embeddings find the right passage even when your question doesn’t share words with the source.",
  },
  {
    icon: Brain,
    title: "Conversation memory",
    desc: "Follow up naturally. Long sessions get auto-summarized so context never spills over.",
  },
];

function Features() {
  return (
    <section id="features" className="border-t border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for focused research.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every feature exists for one reason: helping you find answers in
            what you&rsquo;ve already written.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-green-400/40"
            >
              <div className="flex size-9 items-center justify-center rounded-md bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-400/30">
                <Icon aria-hidden="true" className="size-4" />
              </div>
              <h3 className="mt-4 font-medium">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    num: "1",
    icon: NotebookPen,
    title: "Create a notebook",
    desc: "One per topic, project, or research thread.",
  },
  {
    num: "2",
    icon: Upload,
    title: "Upload documents",
    desc: "Drop PDFs, DOCX, or TXT files. We chunk and embed them automatically.",
  },
  {
    num: "3",
    icon: MessageSquare,
    title: "Ask anything",
    desc: "Type a question. Get an answer grounded in your sources.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/60 py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps.
          </h2>
          <p className="mt-4 text-muted-foreground">
            From upload to answer in under a minute.
          </p>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {STEPS.map(({ num, icon: Icon, title, desc }) => (
            <div key={num} className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-400/30">
                <Icon aria-hidden="true" className="size-6" />
              </div>
              <div className="mt-4 text-xs font-medium tracking-wider text-green-400">
                STEP {num}
              </div>
              <h3 className="mt-1 text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="border-t border-border/60 py-24">
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-20 -top-10 -z-10 h-40 rounded-full bg-green-500/20 blur-3xl"
        />
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Your notes are waiting.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Start a notebook in seconds. Free while we&rsquo;re in early access.
        </p>
        <div className="mt-8">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ size: "lg" }), "cursor-pointer")}
            >
              Open dashboard
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : (
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: "lg" }), "cursor-pointer")}
            >
              Start your first notebook
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
        <BrandMark size="sm" />
        <span>&copy; 2025 Monolith &middot; Notes that answer back.</span>
      </div>
    </footer>
  );
}
