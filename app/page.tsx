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
  CheckCircle2,
  Sparkles,
  Layers,
  FileCode2,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { getUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getUser();
  const isLoggedIn = !!user;

  return (
    <div
      style={{ backgroundColor: "#020503", color: "#e3ece6" }}
      className="min-h-screen font-sans selection:bg-[#4ade80] selection:text-[#020503]"
    >
      <LandingHeader isLoggedIn={isLoggedIn} />
      <Hero isLoggedIn={isLoggedIn} />
      <TrustBar />
      <VisualizerSection />
      <BentoPhilosophy />
      <Features />
      <HowItWorks />
      <FinalCta isLoggedIn={isLoggedIn} />
      <LandingFooter />
    </div>
  );
}

function LandingHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header
      style={{
        backgroundColor: "rgba(2, 5, 3, 0.9)",
        borderColor: "rgba(34, 197, 94, 0.2)",
      }}
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="cursor-pointer">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-8 text-xs font-mono uppercase tracking-widest text-[#729a82] md:flex">
          <a
            href="#features"
            className="hover:text-[#4ade80] transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-[#4ade80] transition-colors"
          >
            How it works
          </a>
          <a
            href="/dashboard"
            className="hover:text-[#4ade80] transition-colors"
          >
            Dashboard
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              style={{
                backgroundColor: "#22c55e",
                color: "#020503",
                boxShadow: "0 0 25px rgba(34, 197, 94, 0.5)",
              }}
              className="inline-flex h-9 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105"
            >
              Dashboard
              <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-[#8caea0] hover:text-[#4ade80] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/dashboard"
                style={{
                  backgroundColor: "#22c55e",
                  color: "#020503",
                  boxShadow: "0 0 25px rgba(34, 197, 94, 0.5)",
                }}
                className="inline-flex h-9 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105"
              >
                Try It Out
                <ArrowRight className="size-3.5" />
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
    <section className="relative overflow-hidden pt-20 pb-16 text-center">
      {/* Intense Emerald Radial Glow */}
      <div
        style={{
          background:
            "radial-gradient(circle, rgba(34,197,94,0.3) 0%, rgba(34,197,94,0.05) 50%, transparent 70%)",
        }}
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4 size-[650px] blur-2xl"
      />

      <div className="relative mx-auto max-w-4xl px-6">
        <div
          style={{
            backgroundColor: "#071c0e",
            borderColor: "#22c55e",
            color: "#4ade80",
          }}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-mono uppercase tracking-widest"
        >
          <span
            style={{
              backgroundColor: "#4ade80",
              boxShadow: "0 0 10px #4ade80",
            }}
            className="size-2 rounded-full animate-pulse"
          />
          ✦ Notes that answer back
        </div>

        <h1 className="mt-8 font-serif text-5xl tracking-tight text-white sm:text-7xl leading-[1.1]">
          Stop searching your notes. <br />
          <span style={{ color: "#4ade80" }} className="italic">
            Start asking them.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base text-[#9ec4ad] leading-relaxed">
          Upload your documents and chat with an AI that only answers from what
          you’ve uploaded &mdash; strictly grounded, cite-backed, and zero
          hallucinations.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row font-mono text-xs">
          <Link
            href="/dashboard"
            style={{
              backgroundColor: "#22c55e",
              color: "#020503",
              boxShadow: "0 0 30px rgba(34, 197, 94, 0.45)",
            }}
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg px-8 font-bold uppercase tracking-wider transition-all hover:bg-[#4ade80] hover:scale-105"
          >
            {isLoggedIn ? "Open Dashboard" : "Get started — it's free"}
          </Link>
          <Link
            href="/dashboard"
            style={{
              backgroundColor: "#06150b",
              borderColor: "#1b4327",
              color: "#86efac",
            }}
            className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-lg border px-7 font-bold uppercase tracking-wider transition-all hover:border-[#22c55e] hover:text-white"
          >
            <Sparkles style={{ color: "#4ade80" }} className="size-4" />
            Try it out
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <div
      style={{
        backgroundColor: "#040e07",
        borderColor: "rgba(34, 197, 94, 0.2)",
      }}
      className="border-y py-4 font-mono text-xs"
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-around gap-6 px-6 text-[#9bc4ad]">
        <div className="flex items-center gap-2">
          <CheckCircle2 style={{ color: "#4ade80" }} className="size-4" />
          <span>Line-by-line citation</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck style={{ color: "#4ade80" }} className="size-4" />
          <span>Strict context isolation</span>
        </div>
        <div className="flex items-center gap-2">
          <Brain style={{ color: "#4ade80" }} className="size-4" />
          <span>Zero external fabrication</span>
        </div>
      </div>
    </div>
  );
}

function VisualizerSection() {
  const bars = [
    18, 35, 55, 25, 75, 95, 45, 80, 100, 40, 70, 35, 85, 95, 50, 90, 35, 60, 75,
    40,
  ];

  return (
    <section className="relative mx-auto max-w-4xl px-6 py-12">
      <div
        style={{
          backgroundColor: "#031107",
          borderColor: "#184a25",
          boxShadow: "0 0 50px rgba(34, 197, 94, 0.2)",
        }}
        className="relative overflow-hidden rounded-2xl border p-8"
      >
        {/* Neon Green Underglow */}
        <div
          style={{
            background:
              "linear-gradient(to top, rgba(34, 197, 94, 0.45) 0%, rgba(34, 197, 94, 0.1) 40%, transparent 80%)",
          }}
          className="pointer-events-none absolute -bottom-10 left-0 right-0 h-44 blur-xl"
        />

        <div className="text-center font-mono text-xs uppercase tracking-widest text-[#4ade80]">
          Interactive retrieval demonstration
        </div>

        {/* Green Waveform + Glowing Center Button */}
        <div className="relative mt-8 flex items-center justify-center gap-2 sm:gap-3 h-36">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {bars.slice(0, 10).map((h, i) => (
              <div
                key={`left-${i}`}
                style={{
                  height: `${h}%`,
                  backgroundColor: "#4ade80",
                  boxShadow: "0 0 8px rgba(74, 222, 128, 0.6)",
                }}
                className="w-1.5 rounded-full"
              />
            ))}
          </div>

          <div
            style={{
              backgroundColor: "#22c55e",
              borderColor: "#86efac",
              boxShadow: "0 0 35px rgba(74, 222, 128, 0.9)",
              color: "#020503",
            }}
            className="relative z-10 flex size-16 items-center justify-center rounded-full border-2"
          >
            <MessageSquare className="size-7" />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {bars.slice(10, 20).map((h, i) => (
              <div
                key={`right-${i}`}
                style={{
                  height: `${h}%`,
                  backgroundColor: "#4ade80",
                  boxShadow: "0 0 8px rgba(74, 222, 128, 0.6)",
                }}
                className="w-1.5 rounded-full"
              />
            ))}
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-xs tracking-wider uppercase text-[#7cb390]">
          Synthesizing insights across indexed PDF, DOCX, & Markdown
        </p>
      </div>
    </section>
  );
}

function BentoPhilosophy() {
  return (
    <section
      style={{
        backgroundColor: "#030805",
        borderColor: "rgba(34, 197, 94, 0.15)",
      }}
      className="border-t py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <div
            style={{
              backgroundColor: "#061c0e",
              borderColor: "#22c55e",
              color: "#4ade80",
            }}
            className="inline-block rounded-full border px-3.5 py-1 text-[11px] font-mono uppercase tracking-widest mb-4"
          >
            ✦ WHY MONOLITH
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-white">
            Why Choose
            <br />
            Monolith
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6">
            <div
              style={{
                backgroundColor: "#05140a",
                borderColor: "#184224",
              }}
              className="rounded-xl border p-6"
            >
              <div
                style={{
                  backgroundColor: "#0b2b16",
                  borderColor: "#4ade80",
                  color: "#4ade80",
                }}
                className="size-8 rounded border flex items-center justify-center mb-4"
              >
                <Quote className="size-4" />
              </div>
              <h3 className="font-medium text-white text-base">
                Grounded in your sources
              </h3>
              <p className="mt-2 text-xs text-[#8ab59c] leading-relaxed">
                Every single answer quotes directly from your uploaded files.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#05140a",
                borderColor: "#184224",
              }}
              className="rounded-xl border p-6"
            >
              <div
                style={{
                  backgroundColor: "#0b2b16",
                  borderColor: "#4ade80",
                  color: "#4ade80",
                }}
                className="size-8 rounded border flex items-center justify-center mb-4"
              >
                <Search className="size-4" />
              </div>
              <h3 className="font-medium text-white text-base">
                Semantic Vector Search
              </h3>
              <p className="mt-2 text-xs text-[#8ab59c] leading-relaxed">
                Vector embeddings find context without relying on exact matching
                words.
              </p>
            </div>
          </div>

          {/* Center Glowing Showcase Card */}
          <div
            style={{
              backgroundColor: "#071f10",
              borderColor: "#22c55e",
              boxShadow: "0 0 35px rgba(34, 197, 94, 0.25)",
            }}
            className="relative overflow-hidden rounded-xl border p-8 text-center flex flex-col items-center justify-center"
          >
            <div
              style={{
                backgroundColor: "#0d3119",
                borderColor: "#4ade80",
                color: "#4ade80",
                boxShadow: "0 0 20px rgba(74, 222, 128, 0.5)",
              }}
              className="size-20 rounded-full border-2 flex items-center justify-center mb-6"
            >
              <Brain className="size-9" />
            </div>
            <div className="text-xs uppercase tracking-widest text-[#4ade80] font-mono mb-2">
              CORE PRINCIPLE
            </div>
            <blockquote className="font-serif text-lg text-white leading-snug italic">
              “AI should never guess what it doesn't know. Answers must always
              trace back to an exact line in your notes.”
            </blockquote>
          </div>

          <div className="space-y-6">
            <div
              style={{
                backgroundColor: "#05140a",
                borderColor: "#184224",
              }}
              className="rounded-xl border p-6"
            >
              <div
                style={{
                  backgroundColor: "#0b2b16",
                  borderColor: "#4ade80",
                  color: "#4ade80",
                }}
                className="size-8 rounded border flex items-center justify-center mb-4"
              >
                <Layers className="size-4" />
              </div>
              <h3 className="font-medium text-white text-base">
                Conversation Memory
              </h3>
              <p className="mt-2 text-xs text-[#8ab59c] leading-relaxed">
                Sessions auto-summarize so your context window never spills
                over.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#05140a",
                borderColor: "#184224",
              }}
              className="rounded-xl border p-6"
            >
              <div
                style={{
                  backgroundColor: "#0b2b16",
                  borderColor: "#4ade80",
                  color: "#4ade80",
                }}
                className="size-8 rounded border flex items-center justify-center mb-4"
              >
                <ShieldCheck className="size-4" />
              </div>
              <h3 className="font-medium text-white text-base">
                Locked-Down Vault
              </h3>
              <p className="mt-2 text-xs text-[#8ab59c] leading-relaxed">
                Your data stays strictly scoped and is never used to train
                external models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section
      id="features"
      style={{
        backgroundColor: "#020503",
        borderColor: "rgba(34, 197, 94, 0.15)",
      }}
      className="border-t py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <div
            style={{
              backgroundColor: "#061c0e",
              borderColor: "#22c55e",
              color: "#4ade80",
            }}
            className="inline-block rounded-full border px-3.5 py-1 text-[11px] font-mono uppercase tracking-widest mb-4"
          >
            ✦ FEATURES
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-white">
            Everything your research requires, <br />
            handled automatically
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="space-y-4 lg:col-span-5">
            <div
              style={{
                backgroundColor: "#05140a",
                borderColor: "#184224",
              }}
              className="rounded-xl border p-4"
            >
              <div className="flex items-center gap-3 text-white font-medium text-sm">
                <FileText style={{ color: "#4ade80" }} className="size-4" />
                Bring your own documents
              </div>
              <p className="mt-1 text-xs text-[#82aa94] pl-7">
                PDF, DOCX, or plain text up to 10MB each.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#082613",
                borderColor: "#22c55e",
                boxShadow: "0 0 20px rgba(34, 197, 94, 0.25)",
              }}
              className="rounded-xl border-2 p-4"
            >
              <div className="flex items-center gap-3 text-[#4ade80] font-medium text-sm">
                <CheckCircle2 className="size-4" />
                Strict context grounding
              </div>
              <p className="mt-1 text-xs text-[#a9d8bd] pl-7">
                Replies only derive from your notes with highlighted passages.
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#05140a",
                borderColor: "#184224",
              }}
              className="rounded-xl border p-4"
            >
              <div className="flex items-center gap-3 text-white font-medium text-sm">
                <FileCode2 style={{ color: "#4ade80" }} className="size-4" />
                Automated Chunk & Embed
              </div>
              <p className="mt-1 text-xs text-[#82aa94] pl-7">
                Instant chunking algorithm maps text to high-dimensional space.
              </p>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#061b0d",
              borderColor: "#22c55e",
              boxShadow: "0 0 35px rgba(34, 197, 94, 0.2)",
            }}
            className="rounded-2xl border p-6 lg:col-span-7"
          >
            <div
              style={{ borderColor: "#154222" }}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center gap-2">
                <div
                  style={{
                    backgroundColor: "#4ade80",
                    boxShadow: "0 0 8px #4ade80",
                  }}
                  className="size-2.5 rounded-full"
                />
                <span className="text-sm font-semibold text-white">
                  Live Query Session
                </span>
              </div>
              <span className="text-xs text-[#4ade80] font-mono">
                SOURCE VERIFIED
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-end">
                <div
                  style={{
                    backgroundColor: "#0c2b16",
                    borderColor: "#22c55e",
                  }}
                  className="rounded-lg border px-4 py-2 text-xs text-white"
                >
                  What were the three key takeaways from the Q1 strategy memo?
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#030d06",
                  borderColor: "#163f20",
                }}
                className="rounded-lg border p-4 text-xs leading-relaxed text-[#d7ebd9]"
              >
                <div className="mb-2 font-mono text-[11px] text-[#4ade80]">
                  ✦ Grounded in q1-strategy.pdf (Page 4)
                </div>
                <ol className="list-decimal space-y-1 pl-4 text-neutral-200">
                  <li>
                    Ship the new interactive chat surface by end of quarter.
                  </li>
                  <li>
                    Migrate the authentication stack to the latest Next.js SDK.
                  </li>
                  <li>
                    Cut document ingestion and vector parsing latency by 40%.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: NotebookPen,
      title: "Create a notebook",
      desc: "One isolated vault per topic, project, or research thread.",
    },
    {
      num: "02",
      icon: Upload,
      title: "Upload documents",
      desc: "Drop PDFs, DOCX, or TXT. We chunk and embed them automatically.",
    },
    {
      num: "03",
      icon: MessageSquare,
      title: "Ask anything",
      desc: "Type a query and get answers grounded purely in your sources.",
    },
  ];

  return (
    <section
      id="how-it-works"
      style={{
        backgroundColor: "#030805",
        borderColor: "rgba(34, 197, 94, 0.15)",
      }}
      className="border-t py-24"
    >
      <div className="mx-auto max-w-5xl px-6 text-center">
        <div
          style={{
            backgroundColor: "#061c0e",
            borderColor: "#22c55e",
            color: "#4ade80",
          }}
          className="inline-block rounded-full border px-3.5 py-1 text-[11px] font-mono uppercase tracking-widest mb-4"
        >
          ✦ THREE STEPS
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl text-white mb-16">
          From raw document to verified answer <br />
          in under a minute
        </h2>

        <div className="grid gap-6 md:grid-cols-3 text-left">
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                backgroundColor: "#05140a",
                borderColor: "#184224",
              }}
              className="rounded-xl border p-6 transition-all hover:border-[#22c55e]"
            >
              <span className="font-mono text-xs font-bold text-[#4ade80]">
                STEP {step.num}
              </span>
              <h3 className="mt-3 font-medium text-white text-base">
                {step.title}
              </h3>
              <p className="mt-2 text-xs text-[#8eb8a0] leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section
      style={{ borderColor: "rgba(34, 197, 94, 0.2)" }}
      className="relative overflow-hidden border-t py-24 text-center"
    >
      {/* Huge Emerald Glow Center */}
      <div
        style={{
          background:
            "radial-gradient(circle, rgba(34,197,94,0.35) 0%, rgba(34,197,94,0.05) 60%, transparent 80%)",
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] blur-2xl"
      />

      <div className="relative mx-auto max-w-3xl px-6">
        <h2 className="font-serif text-4xl sm:text-6xl text-white leading-tight">
          Your notes are waiting.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-[#9ec4ad]">
          Start your first notebook in seconds. Free while in early access.
        </p>
        <div className="mt-8 flex justify-center font-mono">
          <Link
            href="/dashboard"
            style={{
              backgroundColor: "#22c55e",
              color: "#020503",
              boxShadow: "0 0 35px rgba(34, 197, 94, 0.6)",
            }}
            className="inline-flex h-12 items-center gap-2 rounded-full px-8 text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105 hover:bg-[#4ade80]"
          >
            {isLoggedIn ? "Open Dashboard" : "Start your first notebook"}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer
      style={{
        backgroundColor: "#010402",
        borderColor: "rgba(34, 197, 94, 0.15)",
      }}
      className="border-t py-8 text-xs text-[#6e9981] font-mono"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <BrandMark size="sm" />
        <span>Monolith &middot; Notes that answer back.</span>
      </div>
    </footer>
  );
}
